// PtyTerminal is the UNRESTRICTED interactive terminal: a real shell (vim, nano,
// kubectl edit) streamed over a WebSocket to the Go backend's PTY. Output/input
// is piped by AttachAddon; resize is sent as a 5-byte control frame.
import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '@xterm/addon-attach'
import '@xterm/xterm/css/xterm.css'
import { encodeResize, terminalSocketURL } from '@/core/api/ws'

export function PtyTerminal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      theme: { background: '#0b0f14' },
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(container)
    fit.fit()

    const ws = new WebSocket(terminalSocketURL())
    ws.binaryType = 'arraybuffer'

    const sendResize = () => {
      fit.fit()
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(encodeResize(term.rows, term.cols))
      }
    }

    ws.addEventListener('open', () => {
      term.loadAddon(new AttachAddon(ws))
      sendResize()
      term.focus()
    })
    ws.addEventListener('close', () => term.write('\r\n\x1b[90m[terminal closed]\x1b[0m\r\n'))

    const observer = new ResizeObserver(() => sendResize())
    observer.observe(container)

    return () => {
      observer.disconnect()
      ws.close()
      term.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 320 }} />
}
