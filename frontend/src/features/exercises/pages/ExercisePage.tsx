// ExercisePage is the left (content) pane of the lab for an incident: the mission
// briefing plus Launch / Check / Reset actions that stream over SSE. The terminal
// you debug in is the persistent one in LabLayout. Solving (Check returning ok)
// awards XP and surfaces any newly earned badge.
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { streamSSE } from '@/core/api/sse'
import { exerciseDetailQuery } from '@/features/exercises/api/exercises.queries'
import { RewardToast, type Reward } from '@/features/gamification/RewardToast'
import { progressSummaryQuery } from '@/features/progress/api/progress.queries'
import { useProgressSummary, useSolveExercise } from '@/features/progress/hooks'
import { MarkdownView } from '@/shared/components/Markdown/Markdown'
import { useLang } from '@/core/i18n/lang'

export function ExercisePage({ id }: { id: string }) {
  const { lang } = useLang()
  const { data, isLoading, error } = useQuery(exerciseDetailQuery(id, lang))
  const summary = useProgressSummary()
  const solve = useSolveExercise()
  const qc = useQueryClient()
  const [out, setOut] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [reward, setReward] = useState<Reward | null>(null)
  const outRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight })
  }, [out])

  if (isLoading) return <p>Loading…</p>
  if (error || !data) return <p className="error">Exercise not found.</p>

  async function runStream(path: string, label: string): Promise<boolean> {
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

  async function onCheck() {
    const before = summary.data
    const earnedBefore = new Set(before?.badges.filter((b) => b.earned).map((b) => b.id))
    const alreadySolved = Boolean(before?.records.find((r) => r.exerciseId === id && r.solved))

    const ok = await runStream(`/api/check/${id}`, `check ${id}`)
    if (!ok) {
      setOut((o) => [...o, '❌ Not solved yet — keep digging.'])
      return
    }
    const rec = await solve.mutateAsync(id)
    const fresh = await qc.fetchQuery(progressSummaryQuery())
    const newBadge = fresh.badges.find((b) => b.earned && !earnedBefore.has(b.id))
    setOut((o) => [...o, '✅ Solved!'])
    if (!alreadySolved) setReward(newBadge ? { xp: rec.xp, badge: newBadge.name } : { xp: rec.xp })
  }

  return (
    <div className="lesson">
      <header className="lesson__head">
        <h1>{data.title}</h1>
        <span className={`badge level--${data.level}`}>{data.level}</span>
      </header>

      <div className="actions">
        <button className="primary" disabled={busy} onClick={() => runStream(`/api/deploy/${id}`, `deploy ${id}`)}>
          Launch
        </button>
        <button disabled={busy} onClick={onCheck}>
          Check
        </button>
        <button disabled={busy} onClick={() => runStream('/api/reset', 'reset')}>
          Reset
        </button>
      </div>

      {out.length > 0 && (
        <pre className="run-output" ref={outRef}>
          {out.join('\n')}
        </pre>
      )}

      <article className="lesson__body">
        {data.markdown ? <MarkdownView>{data.markdown}</MarkdownView> : <p>No mission briefing.</p>}
      </article>

      {reward && <RewardToast reward={reward} onDismiss={() => setReward(null)} />}
    </div>
  )
}
