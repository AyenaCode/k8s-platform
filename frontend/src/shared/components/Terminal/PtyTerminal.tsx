// PtyTerminal is the UNRESTRICTED interactive terminal: a real shell (vim, nano,
// kubectl edit) streamed over a WebSocket to the Go backend's PTY. Output/input
// is piped by AttachAddon; resize is sent as a 5-byte control frame. The theme is
// the "OPS CONSOLE" palette (see styles.css) so the shell reads as part of the
// cockpit, not a bolted-on black box.
import { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { AttachAddon } from '@xterm/addon-attach'
import '@xterm/xterm/css/xterm.css'
import { encodeResize, terminalSocketURL } from '@/core/api/ws'

const FONT_FAMILY =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const FONT_SIZE = 13

// Carbon surfaces + one signal-lime accent, mapped from the design tokens. The
// background MATCHES .lab__terminal-body (--ink-850) so the panel padding frames
// the canvas seamlessly. ANSI 16 stay semantically conventional (red=error,
// green=ok) so kubectl / vim / k9s output still reads correctly — they're only
// tuned toward the palette, with signal-lime reserved for the cursor + brightGreen.
const THEME = {
  background: '#0a0d0b',
  foreground: '#e9f0ea',
  cursor: '#b6f23a',
  cursorAccent: '#070908',
  selectionBackground: 'rgba(182, 242, 58, 0.22)',
  selectionInactiveBackground: 'rgba(140, 151, 142, 0.16)',
  scrollbarSliderBackground: 'rgba(140, 151, 142, 0.16)',
  scrollbarSliderHoverBackground: 'rgba(140, 151, 142, 0.30)',
  scrollbarSliderActiveBackground: 'rgba(182, 242, 58, 0.35)',

  black: '#1a201c',
  red: '#ff5d5d',
  green: '#57d98a',
  yellow: '#f0b429',
  blue: '#5aa9e6',
  magenta: '#c792ea',
  cyan: '#56d6e0',
  white: '#cfd8d0',
  brightBlack: '#5b655e',
  brightRed: '#ff7a7a',
  brightGreen: '#b6f23a',
  brightYellow: '#ffce5c',
  brightBlue: '#82c0ff',
  brightMagenta: '#e0a9ff',
  brightCyan: '#8be9f0',
  brightWhite: '#e9f0ea',
}

export function PtyTerminal() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Toggled true for ~1s after any copy, to flash the discreet "copied" pill.
  const [copyFlash, setCopyFlash] = useState(false)
  const flashTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      cursorWidth: 2,
      cursorInactiveStyle: 'outline',
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      fontWeight: 400,
      fontWeightBold: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
      scrollback: 5000,
      // Keep real-tool colours readable even when they land on our carbon bg.
      minimumContrastRatio: 4.5,
      theme: THEME,
    })
    const fit = new FitAddon()
    term.loadAddon(fit)

    // Copy the current selection to the clipboard and flash the "copied" pill.
    // `lastCopied` dedupes the stream of selectionChange events fired during a
    // mouse drag, so we don't hammer the clipboard API on every pixel of motion.
    // Ctrl+Shift+C passes force=true so an identical re-copy still confirms.
    let lastCopied = ''
    const flashCopied = () => {
      setCopyFlash(true)
      window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setCopyFlash(false), 1100)
    }
    const copySelection = (force: boolean) => {
      const sel = term.getSelection()
      if (!sel || (!force && sel === lastCopied)) return
      lastCopied = sel
      void navigator.clipboard?.writeText(sel)
      flashCopied()
    }
    // Copy-on-select, like a native Linux terminal: highlighting text copies it.
    term.onSelectionChange(() => copySelection(false))

    // Make this behave like a real terminal in the browser: route control keys to
    // the PTY instead of letting the browser act on them (Ctrl+R reloading the
    // page, Ctrl+L focusing the address bar, Ctrl+Shift+C opening the inspector…),
    // and wire the conventional Ctrl+Shift+C / Ctrl+Shift+V for copy & paste.
    term.attachCustomKeyEventHandler((e) => {
      if (e.type !== 'keydown') return true

      // Copy the selection. (Plain Ctrl+C stays SIGINT, the terminal convention.)
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        copySelection(true)
        e.preventDefault()
        return false
      }
      // Paste from the clipboard into the shell.
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyV') {
        void navigator.clipboard?.readText().then((text) => {
          if (text) term.paste(text)
        })
        e.preventDefault()
        return false
      }
      // Any other Ctrl/Alt combo (without Shift): block the browser shortcut and
      // let xterm send the control sequence to the shell: Ctrl+R history search,
      // Ctrl+L clear, Ctrl+A/E line nav, Ctrl+U/K/W kill, Ctrl+C interrupt, etc.
      // Shift is left alone so the few unblockable combos (Ctrl+Shift+I/J devtools)
      // aren't fought with.
      if ((e.ctrlKey || e.altKey) && !e.shiftKey) {
        e.preventDefault()
        return true
      }
      return true
    })

    // The fit addon measures cell geometry the instant the terminal opens. If the
    // self-hosted JetBrains Mono (font-display: swap) hasn't loaded yet, xterm locks
    // onto the FALLBACK glyph metrics → misaligned cursor + wrong cols/rows. So gate
    // open()/fit() on the real font being ready. `cancelled` guards an unmount that
    // beats the async font load (cleanup runs term.dispose() regardless).
    let cancelled = false
    let teardown: (() => void) | undefined

    const boot = () => {
      if (cancelled || !containerRef.current) return

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
      ws.addEventListener('close', () => {
        term.write('\r\n\x1b[90m[terminal closed]\x1b[0m\r\n')
      })

      const observer = new ResizeObserver(() => sendResize())
      observer.observe(container)

      teardown = () => {
        observer.disconnect()
        ws.close()
      }
    }

    const fontReady = document.fonts
      ? document.fonts.load(`${FONT_SIZE}px "JetBrains Mono"`).catch(() => undefined)
      : Promise.resolve()
    void fontReady.then(boot)

    return () => {
      cancelled = true
      window.clearTimeout(flashTimer.current)
      teardown?.()
      term.dispose()
    }
  }, [])

  return (
    <div className="pty">
      <div ref={containerRef} className="pty__screen" />
      <div className={`pty__toast${copyFlash ? ' is-on' : ''}`} aria-hidden="true">
        <span className="pty__toast-dot" />
        copied
      </div>
    </div>
  )
}
