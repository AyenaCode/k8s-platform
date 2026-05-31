import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { exerciseDetailQuery } from '@/features/exercises/api/exercises.queries'
import { SafeCommandBox } from '@/features/exercises/components/SafeCommandBox'
import { PtyTerminal } from '@/shared/components/Terminal/PtyTerminal'

type Tab = 'solve' | 'edit'

export function ExercisePage({ id, lang = 'en' }: { id: string; lang?: string }) {
  const { data, isLoading, error } = useQuery(exerciseDetailQuery(id, lang))
  const [tab, setTab] = useState<Tab>('solve')

  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p className="error">Exercise not found.</p>

  return (
    <div className="exercise">
      <header>
        <h1>{data.title}</h1>
        <span className="badge">{data.level}</span>
      </header>

      {/* Mission briefing (markdown is rendered by a dedicated component in a
          later iteration; shown raw here to keep the slice focused). */}
      <pre className="mission">{data.markdown}</pre>

      <div className="tabs">
        <button className={tab === 'solve' ? 'active' : ''} onClick={() => setTab('solve')}>
          Solve (safe shell)
        </button>
        <button className={tab === 'edit' ? 'active' : ''} onClick={() => setTab('edit')}>
          Edit (full terminal)
        </button>
      </div>

      <div className="terminal-pane">
        {tab === 'solve' ? <SafeCommandBox namespace={data.ns} /> : <PtyTerminal />}
      </div>
    </div>
  )
}
