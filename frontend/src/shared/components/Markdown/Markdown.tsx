// MarkdownView renders trusted lesson/mission markdown: GFM (tables, lists,
// task items) via remark-gfm, and syntax-highlighted code blocks via react-shiki.
// We override `pre` to a fragment so ShikiHighlighter owns the single <pre> and
// we don't nest <pre><pre>.
import type { ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// /web uses the JS RegExp engine (no wasm/oniguruma chunk) — lighter & faster
// startup, plenty for our bash/yaml/text snippets.
import ShikiHighlighter, { isInlineCode, type Element } from 'react-shiki/web'

// react-markdown passes a hast `node` typed as `Element | undefined`. We keep the
// param loose (unknown) to dodge the duplicate-Element-type clash between
// react-markdown and react-shiki, then assert it for isInlineCode.
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
    <ShikiHighlighter language={lang} theme="github-dark" className="md-code">
      {code}
    </ShikiHighlighter>
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
