// LessonPage is the heart of the lab: the left (content) pane of a lesson under
// LabLayout, with the persistent terminal on the right. It walks the learner
// through ordered steps — concept prose, then an interactive task they perform in
// the terminal and confirm with "Verify". Verify streams a script over SSE; the
// backend awards XP on success, so we just refetch the summary and celebrate.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { streamSSE } from '@/core/api/sse'
import { useLang } from '@/core/i18n/lang'
import { lessonDetailQuery, lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { Confetti } from '@/features/gamification/Confetti'
import { RewardToast, type Reward } from '@/features/gamification/RewardToast'
import { progressSummaryQuery } from '@/features/progress/api/progress.queries'
import { completedLessonSlugs, solvedStepKeys, stepKey, useProgressSummary } from '@/features/progress/hooks'
import { MarkdownView } from '@/shared/components/Markdown/Markdown'

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
  const [showHint, setShowHint] = useState(false)
  const [reward, setReward] = useState<Reward | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const outRef = useRef<HTMLPreElement>(null)
  // Pending auto-advance timer (next step or next lesson) — cleared on unmount
  // and on any manual navigation so a deferred jump never fires out of context.
  const advanceTimer = useRef<number | null>(null)
  const clearAdvance = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
  }

  // The next lesson in catalog order, so finishing a lesson rolls straight on.
  const nextSlug = useMemo(() => {
    const items = lessons.data
    if (!items) return undefined
    const here = items.findIndex((l) => l.slug === slug)
    return here >= 0 ? items[here + 1]?.slug : undefined
  }, [lessons.data, slug])

  const goNextLesson = () => {
    if (nextSlug) navigate({ to: '/lessons/$slug', params: { slug: nextSlug } })
  }

  useEffect(() => setIdx(0), [slug, lang])
  useEffect(() => {
    setOut([])
    setShowHint(false)
    clearAdvance()
  }, [idx, slug])
  useEffect(() => clearAdvance, [])
  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [out])

  const solved = useMemo(() => solvedStepKeys(summary.data), [summary.data])
  const lessonDone = completedLessonSlugs(summary.data).has(slug)

  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p className="error">Lesson not found.</p>
  if (data.steps.length === 0) return <p className="error">This lesson has no steps yet.</p>

  const step = data.steps[Math.min(idx, data.steps.length - 1)]
  if (!step) return <p className="error">This lesson has no steps yet.</p>
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
    if (!ok) {
      setShowHint(true)
      return
    }
    // Backend awarded XP; force a fresh refetch (staleTime: 0 — otherwise the
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
    // when XP or a badge was actually gained — re-verifying a solved step still
    // celebrates but won't claim fake XP.)
    setCelebrate(true)
    // Gentle auto-advance to keep momentum: next step within the lesson, or — once
    // the last step is verified — straight on to the next lesson (a touch slower so
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

  const onReset = () => {
    runStream('/api/reset', 'reset cluster')
  }

  return (
    <div className="lesson">
      <header className="lesson__head">
        <div>
          <h1>{data.title}</h1>
          <span className="lesson__count">
            Step {idx + 1} / {data.steps.length}
          </span>
        </div>
        {lessonDone && <span className="lesson__done">✅ lesson complete</span>}
      </header>

      <div className="dots">
        {data.steps.map((s, i) => (
          <button
            key={s.id}
            className={
              i === idx ? 'dot dot--on' : solved.has(stepKey(slug, s.id)) ? 'dot dot--done' : 'dot'
            }
            title={s.title}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>

      <article className="lesson__body">
        <MarkdownView>{step.markdown}</MarkdownView>
      </article>

      {(step.hasSetup || step.hasVerify) && (
        <div className="task">
          {step.hasSetup && (
            <button
              disabled={busy}
              onClick={() => runStream(`/api/lessons/${slug}/steps/${step.id}/setup`, `setup ${step.id}`)}
            >
              Prepare task
            </button>
          )}
          {step.hasVerify && (
            <button className="primary" disabled={busy} onClick={onVerify}>
              {stepSolved ? 'Verify again ✓' : busy ? 'Checking…' : 'Verify'}
            </button>
          )}
          {step.hint && (
            <button className="ghost" onClick={() => setShowHint((s) => !s)}>
              {showHint ? 'Hide hint' : 'Hint'}
            </button>
          )}
          {stepSolved && <span className="task__solved">✓ solved</span>}
        </div>
      )}

      {showHint && step.hint && <div className="hint">💡 {step.hint}</div>}

      {out.length > 0 && (
        <pre className="run-output" ref={outRef}>
          {out.join('\n')}
        </pre>
      )}

      <div className="lesson__nav">
        <button
          disabled={idx === 0}
          onClick={() => {
            clearAdvance()
            setIdx((i) => Math.max(0, i - 1))
          }}
        >
          ← Previous
        </button>
        <button className="ghost" disabled={busy} onClick={onReset}>
          Reset cluster
        </button>
        {isLast ? (
          <button
            className="primary"
            disabled={!nextSlug}
            onClick={() => {
              clearAdvance()
              goNextLesson()
            }}
          >
            {nextSlug ? 'Next lesson →' : 'Course complete 🎉'}
          </button>
        ) : (
          <button
            className="primary"
            onClick={() => {
              clearAdvance()
              setIdx((i) => Math.min(data.steps.length - 1, i + 1))
            }}
          >
            Next →
          </button>
        )}
      </div>

      {reward && <RewardToast reward={reward} onDismiss={() => setReward(null)} />}
      {celebrate && <Confetti onDone={() => setCelebrate(false)} />}
    </div>
  )
}
