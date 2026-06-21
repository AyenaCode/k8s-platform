// A persistent count-up "exam clock" for the CKAD track. Each mission gets its
// own attempt: the elapsed time is tracked against the lesson's time budget so
// the learner feels real exam pressure ("how long did this exo take me?").
//
// Persistence model: we store "time banked while paused" + the epoch ms the
// clock was last (re)started. Elapsed is derived from those, so the attempt keeps
// advancing across navigation AND across a full reload while it's running —
// exactly like a real exam window that doesn't stop because you switched tabs.
import { useCallback, useEffect, useRef, useState } from 'react'

interface StoredTimer {
  /** Milliseconds banked during previous running stretches (frozen while paused). */
  accumulatedMs: number
  /** Epoch ms of the current running stretch, or null when paused. */
  runningSince: number | null
}

const keyOf = (slug: string) => `ckad-timer:${slug}`

function load(slug: string): StoredTimer | null {
  try {
    const raw = localStorage.getItem(keyOf(slug))
    if (!raw) return null
    const v = JSON.parse(raw) as StoredTimer
    if (typeof v.accumulatedMs !== 'number') return null
    return { accumulatedMs: v.accumulatedMs, runningSince: v.runningSince ?? null }
  } catch {
    return null
  }
}

function save(slug: string, v: StoredTimer) {
  try {
    localStorage.setItem(keyOf(slug), JSON.stringify(v))
  } catch {
    // storage unavailable/full — the timer simply won't survive a reload
  }
}

const elapsedOf = (v: StoredTimer): number =>
  v.accumulatedMs + (v.runningSince != null ? Date.now() - v.runningSince : 0)

const seed = (slug: string, autoStart: boolean): StoredTimer =>
  load(slug) ?? { accumulatedMs: 0, runningSince: autoStart ? Date.now() : null }

export interface ExamTimerState {
  elapsedMs: number
  running: boolean
  start: () => void
  pause: () => void
  reset: () => void
}

/**
 * Count-up exam clock for one CKAD mission. Auto-starts the first time a mission
 * is opened; on return it resumes the saved attempt. The hook stays mounted while
 * the learner moves between missions, so it re-seeds when `slug` changes.
 */
export function useExamTimer(slug: string, autoStart = true): ExamTimerState {
  const [state, setState] = useState<StoredTimer>(() => seed(slug, autoStart))
  const [elapsedMs, setElapsedMs] = useState(() => elapsedOf(state))

  // Re-seed when the mission changes (the initializer only runs on first mount).
  const slugRef = useRef(slug)
  useEffect(() => {
    if (slugRef.current === slug) return
    slugRef.current = slug
    const next = seed(slug, autoStart)
    setState(next)
    setElapsedMs(elapsedOf(next))
  }, [slug, autoStart])

  // Persist + recompute on every control mutation (and on initial auto-start).
  useEffect(() => {
    save(slug, state)
    setElapsedMs(elapsedOf(state))
  }, [slug, state])

  // Tick once a second, only while running. `state` is stable across ticks (only
  // the derived `elapsedMs` changes), so the interval isn't torn down each second.
  useEffect(() => {
    if (state.runningSince == null) return
    const id = window.setInterval(() => setElapsedMs(elapsedOf(state)), 1000)
    return () => window.clearInterval(id)
  }, [state])

  const start = useCallback(() => {
    setState((s) => (s.runningSince != null ? s : { ...s, runningSince: Date.now() }))
  }, [])
  const pause = useCallback(() => {
    setState((s) => (s.runningSince == null ? s : { accumulatedMs: elapsedOf(s), runningSince: null }))
  }, [])
  const reset = useCallback(() => {
    setState({ accumulatedMs: 0, runningSince: null })
  }, [])

  return { elapsedMs, running: state.runningSince != null, start, pause, reset }
}
