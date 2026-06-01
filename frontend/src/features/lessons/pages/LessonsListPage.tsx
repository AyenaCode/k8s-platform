import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { completedLessonSlugs, solvedStepKeys, useProgressSummary } from '@/features/progress/hooks'
import { useLang } from '@/core/i18n/lang'

export function LessonsListPage() {
  const { lang } = useLang()
  const { data, isLoading, error } = useQuery(lessonsListQuery(lang))
  const summary = useProgressSummary()
  const done = completedLessonSlugs(summary.data)
  const solvedSteps = solvedStepKeys(summary.data)

  if (isLoading) return <p>Loading lessons…</p>
  if (error) return <p className="error">Failed to load lessons.</p>

  return (
    <div className="catalog">
      <h1>Lessons</h1>
      <p className="catalog__hint">
        Learn a concept, then practise it live in the terminal. Each verified task earns XP.
      </p>
      <ul className="card-list">
        {data?.map((l) => {
          const solvedHere = [...solvedSteps].filter((k) => k.startsWith(`step:${l.slug}/`)).length
          const mastery = l.verifyCount > 0 ? Math.round((solvedHere / l.verifyCount) * 100) : 0
          return (
            <li key={l.slug}>
              <Link to="/lessons/$slug" params={{ slug: l.slug }}>
                <span className="check">{done.has(l.slug) ? '✅' : mastery > 0 ? '🔵' : '⬜'}</span>
                <div>
                  <strong>{l.title}</strong>
                  <span className="muted">{l.summary}</span>
                  <span className="card-meta">
                    {l.estMinutes} min · {l.stepCount} steps · {l.xp} XP
                    {l.verifyCount > 0 && ` · ${mastery}% mastered`}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
