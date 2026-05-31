// XpBar shows progress from the current level floor to the next level threshold.
import type { LevelInfo } from '@/features/progress/types'

export function XpBar({ level }: { level: LevelInfo }) {
  const atMax = level.nextLevelXp === 0
  const span = atMax ? 1 : level.nextLevelXp - level.floor
  const done = atMax ? 1 : level.xp - level.floor
  const pct = Math.min(100, Math.round((done / span) * 100))

  return (
    <div className="xpbar">
      <div className="xpbar__head">
        <strong>
          Lv {level.level} · {level.title}
        </strong>
        <span>{atMax ? `${level.xp} XP · max level` : `${level.xp} / ${level.nextLevelXp} XP`}</span>
      </div>
      <div className="xpbar__track">
        <div className="xpbar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
