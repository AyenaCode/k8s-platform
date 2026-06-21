// The exam-clock chip shown in a CKAD mission header. It surfaces the elapsed
// "processing time" for the exo as the primary number, with the mission's time
// budget as context, and shifts colour as pressure builds: blue while you have
// headroom, amber in the last quarter, coral once you blow the budget.
import { useExamTimer } from './useExamTimer'

function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function ExamTimer({ slug, budgetMin }: { slug: string; budgetMin: number }) {
  const { elapsedMs, running, start, pause, reset } = useExamTimer(slug)

  const budgetMs = Math.max(0, budgetMin) * 60_000
  const remainingMs = budgetMs - elapsedMs
  const over = budgetMs > 0 && remainingMs < 0
  // Amber once only the last quarter of the budget is left; coral once over.
  const warn = !over && budgetMs > 0 && remainingMs <= budgetMs * 0.25

  const tone = over ? 'is-over' : warn ? 'is-warn' : running ? 'is-running' : 'is-paused'

  return (
    <div className={`exam-timer ${tone}`} role="timer" aria-label="Exam timer for this mission">
      <span className="exam-timer__dot" aria-hidden="true" />
      <span className="exam-timer__time">{fmt(elapsedMs)}</span>
      {budgetMs > 0 && (
        <span className="exam-timer__budget">
          {over ? `+${fmt(-remainingMs)} over` : `/ ${fmt(budgetMs)}`}
        </span>
      )}
      <span className="exam-timer__ctrls">
        <button
          type="button"
          className="exam-timer__btn"
          onClick={running ? pause : start}
          title={running ? 'Pause timer' : 'Resume timer'}
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          className="exam-timer__btn"
          onClick={reset}
          title="Reset timer"
          aria-label="Reset timer"
        >
          ↺
        </button>
      </span>
    </div>
  )
}
