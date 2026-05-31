import { useQuery } from '@tanstack/react-query'
import { exerciseDetailQuery } from '@/features/exercises/api/exercises.queries'
import { PtyTerminal } from '@/shared/components/Terminal/PtyTerminal'

export function ExercisePage({ id, lang = 'en' }: { id: string; lang?: string }) {
  const { data, isLoading, error } = useQuery(exerciseDetailQuery(id, lang))

  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p className="error">Exercise not found.</p>

  return (
    <div className="exercise">
      <header>
        <h1>{data.title}</h1>
        <span className="badge">{data.level}</span>
      </header>

      {/* Mission briefing (markdown rendering arrives in a later iteration). */}
      <pre className="mission">{data.markdown}</pre>

      {/* Single full-access lab terminal (Killercoda-style): a real shell with
          kubectl, vim, editing — no restrictions. */}
      <div className="terminal-pane">
        <PtyTerminal />
      </div>
    </div>
  )
}
