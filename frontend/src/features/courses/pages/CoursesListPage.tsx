import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { coursesListQuery } from '@/features/courses/api/courses.queries'
import { completedCourseSlugs, useProgressSummary } from '@/features/progress/hooks'

export function CoursesListPage({ lang = 'en' }: { lang?: string }) {
  const { data, isLoading, error } = useQuery(coursesListQuery(lang))
  const summary = useProgressSummary()
  const done = completedCourseSlugs(summary.data)

  if (isLoading) return <p>Loading courses…</p>
  if (error) return <p className="error">Failed to load courses.</p>

  return (
    <div className="catalog">
      <h1>Courses</h1>
      <p className="catalog__hint">Learn a concept, then practise it in the live terminal.</p>
      <ul className="card-list">
        {data?.map((c) => (
          <li key={c.slug}>
            <Link to="/courses/$slug" params={{ slug: c.slug }}>
              <span className="check">{done.has(c.slug) ? '✅' : '⬜'}</span>
              <div>
                <strong>{c.title}</strong>
                <span className="muted">{c.desc}</span>
              </div>
              <span className="badge">{c.duration}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
