// terminalSocketURL builds the absolute ws:// URL for the PTY terminal. In dev,
// Vite proxies /ws to the Go backend; in prod it is same-origin.
export function terminalSocketURL(path = '/ws/terminal'): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}${path}`
}

// encodeResize builds the 5-byte control frame the Go PTY handler expects:
// 0x01 | rows(uint16 BE) | cols(uint16 BE).
export function encodeResize(rows: number, cols: number): ArrayBuffer {
  const buf = new ArrayBuffer(5)
  const view = new DataView(buf)
  view.setUint8(0, 0x01)
  view.setUint16(1, rows, false)
  view.setUint16(3, cols, false)
  return buf
}
