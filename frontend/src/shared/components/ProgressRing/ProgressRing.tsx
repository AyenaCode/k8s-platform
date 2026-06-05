// ProgressRing is a dependency-free SVG completion ring. It reads as the unit of
// "mastery" across the app — lesson cards, the dashboard daily goal, lesson
// headers. Filled in signal-lime; switches to success-green at 100%.
interface ProgressRingProps {
  /** 0..1 completion. */
  value: number
  size?: number
  stroke?: number
  /** Optional centered label (e.g. "70%", "3/5", an emoji). */
  label?: React.ReactNode
}

export function ProgressRing({ value, size = 44, stroke = 4, label }: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const done = pct >= 1
  return (
    <span className="ring-wrap" style={{ width: size, height: size }}>
      <svg className="ring" width={size} height={size} aria-hidden="true">
        <circle className="ring__bg" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className={done ? 'ring__fill ring__fill--done' : 'ring__fill'}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      {label != null && (
        <span className="ring-wrap__label" style={{ fontSize: Math.round(size * 0.3) }}>
          {label}
        </span>
      )}
    </span>
  )
}
