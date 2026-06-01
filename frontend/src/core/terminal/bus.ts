// A tiny bridge between rendered lesson code blocks and the single live PTY
// terminal. The terminal (in LabLayout) registers a "sink" while its WebSocket is
// open; the "Run" buttons in the markdown (in LessonPage) call runInTerminal() to
// type a command straight into the shell. They are sibling components, so this
// module-level singleton is the channel between them (there is only ever one
// terminal at a time).

type Sink = {
  send: (data: string) => void
  focus: () => void
}

let sink: Sink | null = null

export function setTerminalSink(s: Sink | null) {
  sink = s
}

export function terminalAvailable() {
  return sink !== null
}

// runInTerminal types a command into the PTY and presses Enter. Returns false if
// no terminal is currently connected.
export function runInTerminal(command: string): boolean {
  if (!sink) return false
  const text = command.endsWith('\n') ? command : command + '\n'
  sink.send(text)
  sink.focus()
  return true
}
