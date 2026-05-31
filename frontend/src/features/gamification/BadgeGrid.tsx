// BadgeGrid renders the achievement set; locked badges are dimmed.
import type { Badge } from '@/features/progress/types'

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul className="badges">
      {badges.map((b) => (
        <li key={b.id} className={b.earned ? 'badge-card badge-card--earned' : 'badge-card'}>
          <span className="badge-card__icon">{b.earned ? '🏅' : '🔒'}</span>
          <div>
            <strong>{b.name}</strong>
            <span className="badge-card__desc">{b.desc}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
