import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { exercisesListQuery } from '@/features/exercises/api/exercises.queries'

export function ExerciseListPage({ lang = 'en' }: { lang?: string }) {
  const { data, isLoading, error } = useQuery(exercisesListQuery(lang))

  if (isLoading) return <p>Loading exercises…</p>
  if (error) return <p className="error">Failed to load exercises.</p>

  return (
    <div className="exercise-list">
      <h1>Exercises</h1>
      <ul>
        {data?.map((ex) => (
          <li key={ex.id} className={`level level--${ex.level}`}>
            <Link to="/exercises/$id" params={{ id: ex.id }}>
              <strong>{ex.title}</strong>
              <span className="concept">{ex.concept}</span>
              <span className="badge">{ex.level}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
