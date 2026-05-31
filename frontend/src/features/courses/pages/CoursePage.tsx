// CoursePage is the left (content) pane of the lab for a course. It splits the
// markdown into steps and walks the learner through them; the persistent terminal
// lives in LabLayout to the right. Finishing the last step awards course XP.
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { courseDetailQuery } from '@/features/courses/api/courses.queries'
import { MarkdownView } from '@/shared/components/Markdown/Markdown'
import { splitSteps } from '@/shared/lib/splitSteps'
import { completedCourseSlugs, useCompleteCourse, useProgressSummary } from '@/features/progress/hooks'

export function CoursePage({ slug, lang = 'en' }: { slug: string; lang?: string }) {
  const { data, isLoading, error } = useQuery(courseDetailQuery(slug, lang))
  const summary = useProgressSummary()
  const complete = useCompleteCourse()
  const [idx, setIdx] = useState(0)

  const steps = useMemo(() => (data ? splitSteps(data.markdown) : []), [data])

  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p className="error">Course not found.</p>
  if (steps.length === 0) return <p className="error">Empty course.</p>

  const step = steps[Math.min(idx, steps.length - 1)]
  if (!step) return <p className="error">Empty course.</p>
  const isLast = idx >= steps.length - 1
  const alreadyDone = completedCourseSlugs(summary.data).has(slug)

  return (
    <div className="lesson">
      <div className="lesson__bar">
        <span className="lesson__count">
          Step {idx + 1} / {steps.length}
        </span>
        <div className="dots">
          {steps.map((s, i) => (
            <button
              key={i}
              className={i === idx ? 'dot dot--on' : 'dot'}
              title={s.title}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
        {alreadyDone && <span className="lesson__done">✅ completed</span>}
      </div>

      <article className="lesson__body">
        <MarkdownView>{step.body}</MarkdownView>
      </article>

      <div className="lesson__nav">
        <button disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          ← Previous
        </button>
        {isLast ? (
          <button
            className="primary"
            disabled={complete.isPending}
            onClick={() => complete.mutate(slug)}
          >
            {alreadyDone ? 'Finish again' : complete.isPending ? 'Saving…' : 'Finish course (+50 XP)'}
          </button>
        ) : (
          <button className="primary" onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
