// MarkdownView renders trusted lesson/mission markdown: GFM (tables, lists,
// task items) via remark-gfm, and syntax-highlighted code blocks via react-shiki.
// Every code block gets a toolbar: "Copy", and — for shell blocks — "Run", which
// types the command straight into the live terminal (see core/terminal/bus).
import { useState, type ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// /web uses the JS RegExp engine (no wasm/oniguruma chunk) — lighter & faster
// startup, plenty for our bash/yaml/text snippets.
import ShikiHighlighter, { isInlineCode, type Element } from 'react-shiki/web'
import { runInTerminal } from '@/core/terminal/bus'

const RUNNABLE = new Set(['bash', 'sh', 'shell', 'console', 'zsh'])

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

function RunButton({ code }: { code: string }) {
  const [ran, setRan] = useState(false)
  return (
    <button
      className="cb-btn cb-btn--run"
      title="Run in the terminal"
      onClick={() => {
        if (runInTerminal(code)) {
          setRan(true)
          setTimeout(() => setRan(false), 1400)
        }
      }}
    >
      {ran ? '✓ Sent' : '▶ Run'}
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
        {RUNNABLE.has(lang) && <RunButton code={code} />}
        <CopyButton code={code} />
      </div>
      <ShikiHighlighter language={lang} theme="github-dark" className="md-code">
        {code}
      </ShikiHighlighter>
    </div>
  )
}

export function MarkdownView({ children }: { children: string }) {
  return (
    <div className="md">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{ code: Code, pre: ({ children }) => <>{children}</> }}
      >
        {children}
      </Markdown>
    </div>
  )
}
