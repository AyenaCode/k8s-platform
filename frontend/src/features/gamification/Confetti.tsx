// Confetti is a dependency-free celebration burst shown when a lesson is
// completed. It self-dismisses after the animation; positions/colours are derived
// from the piece index so it stays deterministic and cheap.
import { useEffect } from 'react'

const COLORS = ['#b6f23a', '#57d98a', '#56d6e0', '#f0b429', '#ff5d5d', '#e9f0ea']
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
