// LessonPage is the heart of the lab: the left (content) pane of a mission under
// LabLayout, with the persistent terminal on the right. It walks the learner
// through ordered steps: concept prose, then an interactive task they perform in
// the terminal and confirm with "Verify". Verify streams a script over SSE; the
// backend awards XP on success, so we just refetch the summary and celebrate.
//
// Ergonomics: a labelled step rail (not anonymous dots), a STICKY action bar so
// "Verify" is always one click away no matter how long the brief is, and a
// terminal-safe Cmd/Ctrl+Enter shortcut to verify without leaving the keyboard.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { streamSSE } from '@/core/api/sse'
import { useLang } from '@/core/i18n/lang'
import { lessonDetailQuery, lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { isCkadLesson } from '@/features/lessons/types'
import { ExamTimer } from '@/features/ckad/ExamTimer'
import { Confetti } from '@/features/gamification/Confetti'
import { RewardToast, type Reward } from '@/features/gamification/RewardToast'
import { progressSummaryQuery } from '@/features/progress/api/progress.queries'
import { completedLessonSlugs, solvedStepKeys, stepKey, useProgressSummary } from '@/features/progress/hooks'
import { MarkdownView } from '@/shared/components/Markdown/Markdown'

// Crisp SVG arrow for the action bar. A font arrow glyph (←/→) renders lopsided in
// the body face and looks broken in a button; this stays centred at any zoom/size.
function Arrow({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg
      className="ico-arrow"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M4 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LessonPage({ slug }: { slug: string }) {
  const { lang } = useLang()
  const { data, isLoading, error } = useQuery(lessonDetailQuery(slug, lang))
  const lessons = useQuery(lessonsListQuery(lang))
  const summary = useProgressSummary()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [idx, setIdx] = useState(0)
  const [out, setOut] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [reward, setReward] = useState<Reward | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const outRef = useRef<HTMLPreElement>(null)
  const lessonRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLOListElement>(null)
  // Holds the latest verify action so the (once-registered) keyboard listener
  // always calls the current closure; null when verify isn't available.
  const verifyRef = useRef<(() => void) | null>(null)
  // Pending auto-advance timer (next step or next mission), cleared on unmount
  // and on any manual navigation so a deferred jump never fires out of context.
  const advanceTimer = useRef<number | null>(null)
  const clearAdvance = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }

  // Lessons of the same track (core vs CKAD) in catalog order: auto-advance and
  // the "Mission NN" number both stay within the track the learner is in.
  const trackItems = useMemo(() => {
    const items = lessons.data
    if (!items) return undefined
    const inCkad = isCkadLesson({ slug })
    return items.filter((l) => isCkadLesson(l) === inCkad)
  }, [lessons.data, slug])

  // The next mission in the track, so finishing one rolls straight on.
  const nextSlug = useMemo(() => {
    if (!trackItems) return undefined
    const here = trackItems.findIndex((l) => l.slug === slug)
    return here >= 0 ? trackItems[here + 1]?.slug : undefined
  }, [trackItems, slug])

  const lessonNo = useMemo(() => {
    const i = trackItems?.findIndex((l) => l.slug === slug) ?? -1
    return i >= 0 ? i + 1 : null
  }, [trackItems, slug])

  const goNextLesson = () => {
    if (nextSlug) navigate({ to: '/lessons/$slug', params: { slug: nextSlug } })
  }

  useEffect(() => setIdx(0), [slug, lang])
  useEffect(() => {
    setOut([])
    clearAdvance()
    // A new step is a new "slide": jump the scrolling content pane back to the top
    // (otherwise the next step opens wherever the previous one was scrolled to)…
    lessonRef.current?.closest('.lab__content')?.scrollTo({ top: 0 })
    // …and keep the active chip visible in the horizontally-scrolling step rail so
    // the sub-nav tracks your progress through the steps.
    const rail = railRef.current
    const active = rail?.querySelector<HTMLElement>('.steprail__item.is-on')
    if (rail && active) {
      const a = active.getBoundingClientRect()
      const r = rail.getBoundingClientRect()
      rail.scrollBy({ left: a.left + a.width / 2 - (r.left + r.width / 2), behavior: 'smooth' })
    }
  }, [idx, slug])
  useEffect(() => clearAdvance, [])
  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [out])

  // Cmd/Ctrl+Enter = verify. Gated so it never steals input from the live
  // terminal (xterm focuses a hidden textarea) or any form field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !(e.metaKey || e.ctrlKey)) return
      const el = document.activeElement as HTMLElement | null
      if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.closest('.lab__terminal'))) return
      if (verifyRef.current) {
        e.preventDefault()
        verifyRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const solved = useMemo(() => solvedStepKeys(summary.data), [summary.data])
  const lessonDone = completedLessonSlugs(summary.data).has(slug)

  if (isLoading) return <p className="lesson">Loading…</p>
  if (error || !data) return <p className="lesson error">Mission not found.</p>
  if (data.steps.length === 0) return <p className="lesson error">This mission has no steps yet.</p>

  const step = data.steps[Math.min(idx, data.steps.length - 1)]
  if (!step) return <p className="lesson error">This mission has no steps yet.</p>
  const isLast = idx >= data.steps.length - 1
  const stepSolved = solved.has(stepKey(slug, step.id))

  const runStream = async (path: string, label: string): Promise<boolean> => {
    setBusy(true)
    setOut([`$ ${label}`])
    let ok = false
    try {
      await streamSSE(path, {
        onFrame: (f) => {
          if (f.type === 'done') ok = Boolean(f.ok)
          else if (f.text) setOut((o) => [...o, f.text!.replace(/\n+$/, '')])
        },
      })
    } catch (e) {
      setOut((o) => [...o, `[error] ${String(e)}`])
    }
    setBusy(false)
    return ok
  }

  const onVerify = async () => {
    const before = summary.data
    const earnedBefore = new Set(before?.badges.filter((b) => b.earned).map((b) => b.id))
    const xpBefore = before?.totalXp ?? 0

    const ok = await runStream(`/api/lessons/${slug}/steps/${step.id}/verify`, `verify ${step.id}`)
    if (!ok) return
    // Backend awarded XP; force a fresh refetch (staleTime: 0, otherwise the
    // global 30s staleTime makes fetchQuery resolve from cache, so the delta is
    // always 0 and neither the reward toast nor the confetti ever fire). This
    // also updates the cache + notifies observers, so no invalidate is needed.
    const fresh = await qc.fetchQuery({ ...progressSummaryQuery(), staleTime: 0 })
    const gained = Math.max(0, fresh.totalXp - xpBefore)
    const newBadge = fresh.badges.find((b) => b.earned && !earnedBefore.has(b.id))
    if (gained > 0 || newBadge) {
      setReward(newBadge ? { xp: gained, badge: newBadge.name } : { xp: gained })
    }
    // Confetti on every successful verify. (The reward toast still only shows
    // when XP or a badge was actually gained, re-verifying a solved step still
    // celebrates but won't claim fake XP.)
    setCelebrate(true)
    // Gentle auto-advance to keep momentum: next step within the mission, or, once
    // the last step is verified, straight on to the next mission (a touch slower so
    // the reward toast is seen first). Stops at the end of the course.
    clearAdvance()
    if (!isLast) {
      advanceTimer.current = window.setTimeout(
        () => setIdx((i) => Math.min(data.steps.length - 1, i + 1)),
        1200,
      )
    } else if (nextSlug) {
      advanceTimer.current = window.setTimeout(goNextLesson, 1800)
    }
  }

  const goPrev = () => {
    clearAdvance()
    setIdx((i) => Math.max(0, i - 1))
  }
  const goNextStep = () => {
    clearAdvance()
    setIdx((i) => Math.min(data.steps.length - 1, i + 1))
  }
  // The single "forward" action: next step, or next mission on the last step.
  const forward = () => (isLast ? (clearAdvance(), goNextLesson()) : goNextStep())
  const forwardDisabled = isLast && !nextSlug

  // Expose verify to the keyboard shortcut only when it's actually actionable.
  verifyRef.current = step.hasVerify && !busy ? onVerify : null

  return (
    <div className="lesson" ref={lessonRef}>
      <header className="lesson__head">
        <div>
          <span className="lesson__kicker">
            {lessonNo != null ? `Mission ${String(lessonNo).padStart(2, '0')}` : 'Mission'}
          </span>
          <h1>{data.title}</h1>
        </div>
        <div className="lesson__head-aside">
          {isCkadLesson(data) && <ExamTimer slug={slug} budgetMin={data.estMinutes} />}
          {lessonDone && <span className="lesson__done">✓ mission complete</span>}
        </div>
      </header>

      <ol className="steprail" ref={railRef}>
        {data.steps.map((s, i) => {
          const sdone = solved.has(stepKey(slug, s.id))
          const cls = 'steprail__item' + (i === idx ? ' is-on' : sdone ? ' is-done' : '')
          return (
            <li key={s.id}>
              <button
                className={cls}
                title={s.title}
                onClick={() => {
                  clearAdvance()
                  setIdx(i)
                }}
              >
                <span className="steprail__idx">{sdone ? '✓' : i + 1}</span>
                <span className="steprail__label">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <article className="lesson__body">
        <MarkdownView>{step.markdown}</MarkdownView>

        {out.length > 0 && (
          <pre className="run-output" ref={outRef}>
            {out.join('\n')}
          </pre>
        )}
      </article>

      {/* Sticky action bar, kept minimal: a single back arrow on the left, and one
          forward "Next" button on the right. Verify (when the step has a check) is
          the primary action; otherwise Next is. Every label is nowrap and the right
          cluster wraps as ONE unit when narrow, so a word is never split mid-label.
          (Reset lives discreetly on the terminal bar — see LabLayout.) */}
      <div className="actionbar">
        <button
          className="ghost actionbar__back"
          disabled={idx === 0}
          onClick={goPrev}
          title="Previous step"
          aria-label="Previous step"
        >
          <Arrow dir="left" />
        </button>

        <span className="actionbar__pos">
          {idx + 1} / {data.steps.length}
        </span>

        <div className="actionbar__task">
          {stepSolved && !busy && <span className="task__solved">✓ solved</span>}
          {step.hasSetup && (
            <button
              className="actionbar__prepare"
              disabled={busy}
              onClick={() => runStream(`/api/lessons/${slug}/steps/${step.id}/setup`, `setup ${step.id}`)}
            >
              Prepare
            </button>
          )}
          {step.hasVerify && (
            <button className="primary btn-verify" disabled={busy} onClick={onVerify}>
              {busy ? 'Checking…' : stepSolved ? 'Verify again' : 'Verify'}
              {!busy && <kbd>⌘↵</kbd>}
            </button>
          )}
          <button
            className={'btn-next' + (step.hasVerify ? '' : ' primary')}
            disabled={forwardDisabled}
            onClick={forward}
            title={isLast ? 'Next mission' : 'Next step'}
          >
            {isLast && !nextSlug ? (
              <>Course complete 🎉</>
            ) : (
              <>
                Next <Arrow />
              </>
            )}
          </button>
        </div>
      </div>

      {reward && <RewardToast reward={reward} onDismiss={() => setReward(null)} />}
      {celebrate && <Confetti onDone={() => setCelebrate(false)} />}
    </div>
  )
}
