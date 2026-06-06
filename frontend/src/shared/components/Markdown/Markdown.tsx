// MarkdownView renders trusted lesson/mission markdown: GFM (tables, lists,
// task items) via remark-gfm, and syntax-highlighted code blocks via react-shiki.
// Code blocks get a "Copy" button only, deliberately NO "Run": the learner types
// each command into the live terminal themselves (you learn kubectl by typing it).
import { memo, useState, type ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// /web uses the JS RegExp engine (no wasm/oniguruma chunk), lighter & faster
// startup, plenty for our bash/yaml/text snippets.
import ShikiHighlighter, { isInlineCode, type Element } from 'react-shiki/web'

// Shell languages get a "$" prompt label (a cue to type it), others show the lang.
const SHELL = new Set(['bash', 'sh', 'shell', 'console', 'zsh'])

// GitHub-style alert callouts: a blockquote whose first line is `[!NOTE]`,
// `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` renders as a coloured
// callout box (styled in styles.css). Implemented as a tiny inline remark
// transform, no extra dependency, by walking the mdast tree, stripping the
// marker, and retargeting the blockquote to a <div class="callout callout--TYPE">.
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i

interface MdNode {
  type: string
  value?: string
  children?: MdNode[]
  data?: { hName?: string; hProperties?: Record<string, unknown> }
}

function remarkAlerts() {
  return (tree: MdNode) => {
    const walk = (node: MdNode) => {
      if (!node.children) return
      for (const child of node.children) {
        if (child.type === 'blockquote' && child.children) {
          const para = child.children[0]
          const first = para?.children?.[0]
          if (para && para.type === 'paragraph' && para.children && first?.type === 'text' && first.value) {
            const m = ALERT_RE.exec(first.value)
            if (m) {
              const type = (m[1] ?? '').toLowerCase()
              first.value = first.value.slice(m[0].length)
              if (first.value === '') para.children.shift()
              child.data = {
                hName: 'div',
                hProperties: { className: `callout callout--${type}` },
              }
            }
          }
        }
        walk(child)
      }
    }
    walk(tree)
  }
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="cb-btn"
      title="Copy to clipboard"
      onClick={() => {
        void navigator.clipboard?.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
    >
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  )
}

type CodeProps = ComponentPropsWithoutRef<'code'> & { node?: unknown }

function Code({ className, children, node, ...props }: CodeProps) {
  const inline = node ? isInlineCode(node as Element) : false
  if (inline) {
    return (
      <code className="md-inline" {...props}>
        {children}
      </code>
    )
  }
  const lang = /language-(\w+)/.exec(className ?? '')?.[1] ?? 'bash'
  const code = String(children).replace(/\n$/, '')
  return (
    <div className="codeblock">
      <div className="codeblock__bar">
        <span className="codeblock__lang">{SHELL.has(lang) ? '$' : lang}</span>
        <CopyButton code={code} />
      </div>
      <ShikiHighlighter language={lang} theme="github-dark" className="md-code">
        {code}
      </ShikiHighlighter>
    </div>
  )
}

// Memoized on the markdown string: re-parsing + Shiki re-highlighting every code
// block is expensive, and LessonPage re-renders on every SSE frame / button click
// while `step.markdown` stays the same. Without this, those re-renders make the
// page lag during verify streaming.
export const MarkdownView = memo(function MarkdownView({ children }: { children: string }) {
  return (
    <div className="md">
      <Markdown
        remarkPlugins={[remarkGfm, remarkAlerts]}
        components={{ code: Code, pre: ({ children }) => <>{children}</> }}
      >
        {children}
      </Markdown>
    </div>
  )
})
