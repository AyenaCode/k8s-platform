// streamSSE consumes the backend's POST SSE endpoints (deploy/reset/run/check).
// The backend emits frames shaped as { type: 'out'|'err'|'done', text?, ok? }.
// EventSource only does GET, so we read the streaming fetch body manually.

export interface SSEFrame {
  type: 'out' | 'err' | 'done'
  text?: string
  ok?: boolean
}

export interface StreamHandlers {
  onFrame: (frame: SSEFrame) => void
  signal?: AbortSignal
}

export async function streamSSE(path: string, { onFrame, signal }: StreamHandlers): Promise<void> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { Accept: 'text/event-stream' },
    ...(signal ? { signal } : {}),
  })
  if (!res.body) throw new Error(`no stream body for ${path}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are separated by a blank line.
    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const dataLine = chunk.split('\n').find((l) => l.startsWith('data:'))
      if (!dataLine) continue
      try {
        onFrame(JSON.parse(dataLine.slice(5).trim()) as SSEFrame)
      } catch {
        // ignore malformed frame
      }
    }
  }
}
