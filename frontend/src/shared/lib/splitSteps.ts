// splitSteps turns one course markdown document into ordered lab steps, splitting
// on level-2 headings (`## `). It is fence-aware: `#`/`##` lines INSIDE fenced code
// blocks (``` or ~~~) are bash comments, not headings, and must never split a step.
//
// The preamble before the first H2 (the `# H1` title + intro blockquote) becomes
// step 0, titled "Overview". Each `## Heading` opens a new step whose title is the
// heading text and whose body keeps the heading (so the renderer shows it).

export interface Step {
  title: string
  body: string
}

const H2 = /^##\s+(.+?)\s*$/
const FENCE = /^(```|~~~)/

export function splitSteps(markdown: string): Step[] {
  const lines = markdown.split('\n')
  const steps: Step[] = []
  let current: Step | null = null
  let preamble: string[] = []
  let inFence = false

  const push = () => {
    if (current) steps.push({ title: current.title, body: current.body.trimEnd() })
  }

  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence

    const heading = !inFence ? H2.exec(line) : null
    if (heading) {
      push()
      current = { title: heading[1] ?? '', body: line + '\n' }
      continue
    }

    if (current) current.body += line + '\n'
    else preamble.push(line)
  }
  push()

  const overview = preamble.join('\n').trim()
  if (overview) steps.unshift({ title: 'Overview', body: overview })

  // A course with no H2 at all still yields a single readable step.
  if (steps.length === 0) steps.push({ title: 'Overview', body: markdown.trim() })

  return steps
}
