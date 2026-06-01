// Confetti is a dependency-free celebration burst shown when a lesson is
// completed. It self-dismisses after the animation; positions/colours are derived
// from the piece index so it stays deterministic and cheap.
import { useEffect } from 'react'

const COLORS = ['#4c8dff', '#3fb950', '#d29922', '#ff6b6b', '#a371f7', '#56d4dd']
const PIECES = Array.from({ length: 90 }, (_, i) => i)

export function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((i) => (
        <span
          key={i}
          className="confetti__piece"
          style={{
            left: `${(i * 1.13) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 12) * 0.09}s`,
            animationDuration: `${1.8 + (i % 7) * 0.18}s`,
          }}
        />
      ))}
    </div>
  )
}
