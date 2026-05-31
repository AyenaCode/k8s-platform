import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { exercisesListQuery } from '@/features/exercises/api/exercises.queries'
import { solvedExerciseIds, useProgressSummary } from '@/features/progress/hooks'

export function ExerciseListPage({ lang = 'en' }: { lang?: string }) {
  const { data, isLoading, error } = useQuery(exercisesListQuery(lang))
  const summary = useProgressSummary()
  const solved = solvedExerciseIds(summary.data)

  if (isLoading) return <p>Loading exercises…</p>
  if (error) return <p className="error">Failed to load exercises.</p>

  return (
    <div className="catalog">
      <h1>Incidents</h1>
      <p className="catalog__hint">Each ticket deploys a broken setup. Diagnose and fix it in the terminal.</p>
      <ul className="card-list">
        {data?.map((ex) => (
          <li key={ex.id} className={`level--${ex.level}`}>
            <Link to="/exercises/$id" params={{ id: ex.id }}>
              <span className="check">{solved.has(ex.id) ? '✅' : '⬜'}</span>
              <div>
                <strong>{ex.title}</strong>
                <span className="muted">{ex.concept}</span>
              </div>
              <span className={`badge level--${ex.level}`}>{ex.level}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
