// DashboardPage is the gamification home: level/XP, badges, and at-a-glance
// completion of every course and incident.
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { coursesListQuery } from '@/features/courses/api/courses.queries'
import { exercisesListQuery } from '@/features/exercises/api/exercises.queries'
import { BadgeGrid } from '@/features/gamification/BadgeGrid'
import { XpBar } from '@/features/gamification/XpBar'
import { completedCourseSlugs, solvedExerciseIds, useProgressSummary } from '@/features/progress/hooks'

export function DashboardPage({ lang = 'en' }: { lang?: string }) {
  const summary = useProgressSummary()
  const courses = useQuery(coursesListQuery(lang))
  const exercises = useQuery(exercisesListQuery(lang))

  if (summary.isLoading) return <p>Loading…</p>

  const solved = solvedExerciseIds(summary.data)
  const done = completedCourseSlugs(summary.data)

  return (
    <div className="dashboard">
      <h1>Your progress</h1>

      {summary.data && (
        <section className="card">
          <XpBar level={summary.data.level} />
        </section>
      )}

      <section>
        <h2>Badges</h2>
        {summary.data && <BadgeGrid badges={summary.data.badges} />}
      </section>

      <div className="dashboard__cols">
        <section>
          <h2>Courses</h2>
          <ul className="progress-list">
            {courses.data?.map((c) => (
              <li key={c.slug}>
                <Link to="/courses/$slug" params={{ slug: c.slug }}>
                  <span className="check">{done.has(c.slug) ? '✅' : '⬜'}</span>
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Incidents</h2>
          <ul className="progress-list">
            {exercises.data?.map((ex) => (
              <li key={ex.id}>
                <Link to="/exercises/$id" params={{ id: ex.id }}>
                  <span className="check">{solved.has(ex.id) ? '✅' : '⬜'}</span>
                  {ex.title}
                  <span className={`badge level--${ex.level}`}>{ex.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
