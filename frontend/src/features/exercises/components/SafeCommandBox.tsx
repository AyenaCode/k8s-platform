// SafeCommandBox is the RESTRICTED terminal used for solving exercises. It posts
// to /api/run (kubectl + read-only tools only; decoders blocked) and renders the
// streamed SSE output. Command history with arrow keys, like the original app.
import { useRef, useState } from 'react'
import { streamSSE } from '@/core/api/sse'

interface Line {
  kind: 'cmd' | 'out' | 'err'
  text: string
}

export function SafeCommandBox({ namespace }: { namespace: string }) {
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef<string[]>([])
  const histIdx = useRef<number>(-1)

  const push = (line: Line) => setLines((prev) => [...prev, line])

  async function run(cmd: string) {
    const trimmed = cmd.trim()
    if (!trimmed || busy) return
    if (trimmed === 'clear') {
      setLines([])
      setValue('')
      return
    }
    history.current.push(trimmed)
    histIdx.current = history.current.length
    push({ kind: 'cmd', text: trimmed })
    setValue('')
    setBusy(true)
    try {
      await streamSSE(`/api/run?cmd=${encodeURIComponent(trimmed)}`, {
        onFrame: (f) => {
          if (f.type === 'out' && f.text) push({ kind: 'out', text: f.text })
          else if (f.type === 'err' && f.text) push({ kind: 'err', text: f.text })
        },
      })
    } catch {
      push({ kind: 'err', text: 'stream error\n' })
    } finally {
      setBusy(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      void run(value)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (histIdx.current > 0) {
        histIdx.current -= 1
        setValue(history.current[histIdx.current] ?? '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx.current < history.current.length - 1) {
        histIdx.current += 1
        setValue(history.current[histIdx.current] ?? '')
      } else {
        histIdx.current = history.current.length
        setValue('')
      }
    }
  }

  return (
    <div className="safe-box">
      <div className="safe-box__output">
        {lines.map((l, i) => (
          <div key={i} className={`safe-box__line safe-box__line--${l.kind}`}>
            {l.kind === 'cmd' ? `$ ${l.text}` : l.text}
          </div>
        ))}
      </div>
      <div className="safe-box__bar">
        <span className="safe-box__prompt">you@k8s {namespace} %</span>
        <input
          className="safe-box__input"
          value={value}
          placeholder="k -n exo-001 get pods …"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
        <span className="safe-box__hint">↑ ↓ history · full shell · anti-cheat (no decoders)</span>
      </div>
    </div>
  )
}
