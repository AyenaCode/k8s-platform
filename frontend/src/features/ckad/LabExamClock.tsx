// The global 2-hour exam clock that lives in the persistent terminal bar. Unlike
// the per-mission ExamTimer (count-up against each exo's budget), this is a single
// opt-in countdown that spans the whole lab session — the real CKAD exam window.
//
// It reuses useExamTimer (a persistent count-up keyed on a fixed pseudo-slug) and
// just renders the remaining time = EXAM - elapsed. The attempt survives
// navigation and reload, and the clock keeps draining while running, exactly like
// the real exam window.
import { useEffect } from 'react'
import { useExamTimer } from './useExamTimer'

const EXAM_MIN = 120
const EXAM_MS = EXAM_MIN * 60_000
const WARN_MS = 15 * 60_000 // amber under 15 min left
const DANGER_MS = 5 * 60_000 // coral under 5 min left

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function LabExamClock() {
  // Opt-in: starts paused at 2:00:00; the learner clicks "Start exam" to begin.
  const { elapsedMs, running, start, pause, reset } = useExamTimer('__global-exam__', false)

  const remainingMs = Math.max(0, EXAM_MS - elapsedMs)
  const expired = EXAM_MS - elapsedMs <= 0
  const started = running || elapsedMs > 0

  // Freeze the clock the instant the window closes, so we stop ticking at 0.
  useEffect(() => {
    if (expired && running) pause()
  }, [expired, running, pause])

  if (!started) {
    return (
      <button
        type="button"
        className="lab__exam lab__exam--start"
        onClick={start}
        title="Start a timed 2-hour exam run"
      >
        <span className="lab__exam-ico" aria-hidden="true">▶</span>
        Start exam
        <span className="lab__exam-hint">{fmt(EXAM_MS)}</span>
      </button>
    )
  }

  const tone = expired
    ? 'is-up'
    : remainingMs <= DANGER_MS
      ? 'is-danger'
      : remainingMs <= WARN_MS
        ? 'is-warn'
        : running
          ? 'is-running'
          : 'is-paused'

  return (
    <span className={`lab__exam ${tone}`} role="timer" aria-label="Exam time remaining">
      <span className="lab__exam-dot" aria-hidden="true" />
      <span className="lab__exam-label">EXAM</span>
      <span className="lab__exam-time">{expired ? "TIME'S UP" : fmt(remainingMs)}</span>
      <span className="lab__exam-ctrls">
        {!expired && (
          <button
            type="button"
            className="lab__exam-btn"
            onClick={running ? pause : start}
            title={running ? 'Pause exam' : 'Resume exam'}
            aria-label={running ? 'Pause exam' : 'Resume exam'}
          >
            {running ? '❚❚' : '▶'}
          </button>
        )}
        <button
          type="button"
          className="lab__exam-btn"
          onClick={reset}
          title="Reset exam"
          aria-label="Reset exam"
        >
          ↺
        </button>
      </span>
    </span>
  )
}
