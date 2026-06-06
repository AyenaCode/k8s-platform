// Compact level/XP indicator for the nav bar.
import { useProgressSummary } from '@/features/progress/hooks'

export function LevelChip() {
  const { data } = useProgressSummary()
  if (!data) return null
  return (
    <span className="chip" title={`${data.level.title}: ${data.totalXp} XP`}>
      <span className="chip__lvl">Lv {data.level.level}</span>
      <span className="chip__title">{data.level.title}</span>
      <span className="chip__xp">{data.totalXp} XP</span>
    </span>
  )
}
