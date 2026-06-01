// DashboardPage is the gamification home: level/XP, streak, badges, and at-a-glance
// completion of every lesson.
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lessonsListQuery } from '@/features/lessons/api/lessons.queries'
import { BadgeGrid } from '@/features/gamification/BadgeGrid'
import { XpBar } from '@/features/gamification/XpBar'
import { completedLessonSlugs, solvedStepKeys, useProgressSummary } from '@/features/progress/hooks'
import { useLang } from '@/core/i18n/lang'

export function DashboardPage() {
  const { lang } = useLang()
  const summary = useProgressSummary()
  const lessons = useQuery(lessonsListQuery(lang))

  if (summary.isLoading) return <p>Loading…</p>

  const done = completedLessonSlugs(summary.data)
  const solvedSteps = solvedStepKeys(summary.data)

  return (
    <div className="dashboard">
      <h1>Your progress</h1>

      {summary.data && (
        <section className="card dashboard__hero">
          <XpBar level={summary.data.level} />
          <div className="streak" title="Consecutive days with at least one solved task">
            🔥 <strong>{summary.data.streak}</strong> day streak
          </div>
        </section>
      )}

      <section>
        <h2>Badges</h2>
        {summary.data && <BadgeGrid badges={summary.data.badges} />}
      </section>

      <section>
        <h2>Lessons</h2>
        <ul className="progress-list">
          {lessons.data?.map((l) => {
            const here = [...solvedSteps].filter((k) => k.startsWith(`step:${l.slug}/`)).length
            return (
              <li key={l.slug}>
                <Link to="/lessons/$slug" params={{ slug: l.slug }}>
                  <span className="check">{done.has(l.slug) ? '✅' : here > 0 ? '🔵' : '⬜'}</span>
                  {l.title}
                  <span className="card-meta">
                    {l.verifyCount > 0 ? `${here}/${l.verifyCount} tasks` : 'reading'} · {l.xp} XP
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
