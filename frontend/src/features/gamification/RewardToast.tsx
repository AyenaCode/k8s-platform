// RewardToast is a transient celebration shown when an exercise is solved.
import { useEffect } from 'react'

export interface Reward {
  xp: number
  badge?: string
}

export function RewardToast({ reward, onDismiss }: { reward: Reward; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [reward, onDismiss])

  return (
    <div className="toast" role="status" onClick={onDismiss}>
      <strong>Incident resolved! +{reward.xp} XP</strong>
      {reward.badge && <span className="toast__badge">🏅 New badge: {reward.badge}</span>}
    </div>
  )
}
