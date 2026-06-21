// LabLayout is the split "lab" shell: lesson/mission content on the left, a single
// PERSISTENT terminal on the right. It is a pathless layout route, so navigating
// between its children (/courses/$slug ↔ /exercises/$id) swaps only the <Outlet/>
// content, this component (and the PtyTerminal's WebSocket shell session) stays
// mounted, exactly like KodeKloud/KillerCoda.
import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
import { streamSSE } from '@/core/api/sse'
import { PtyTerminal } from '@/shared/components/Terminal/PtyTerminal'

export function LabLayout() {
  // Reset the live cluster to a clean state. It lives here (the persistent shell)
  // rather than in a lesson because it's an ENVIRONMENT control, not a step action.
  // Feedback is the button's own "Resetting…" state + the live terminal reacting;
  // the SSE output isn't surfaced in a pane, so we just drain it.
  const [resetting, setResetting] = useState(false)
  const onReset = async () => {
    if (resetting) return
    setResetting(true)
    try {
      await streamSSE('/api/reset', { onFrame: () => {} })
    } catch {
      // ignore — the cluster state shown in the terminal is the source of truth
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="lab">
      <section className="lab__content">
        <Outlet />
      </section>
      <aside className="lab__terminal">
        <div className="lab__terminal-bar">
          <span className="lab__session">
            <span className="dotled" aria-hidden="true" />
            <span className="lab__helm" aria-hidden="true">⎈</span>
            live&nbsp;cluster
          </span>
          <span className="lab__shell" aria-hidden="true">~ shell</span>
          <span className="spacer" />
          <button
            type="button"
            className="lab__reset"
            onClick={onReset}
            disabled={resetting}
            title="Reset the cluster to a clean state"
          >
            <svg className="lab__reset-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 11.5A8 8 0 1 0 18.4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 4.5V11h-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {resetting ? 'Resetting…' : 'Reset cluster'}
          </button>
        </div>
        <div className="lab__terminal-body">
          <PtyTerminal />
        </div>
      </aside>
    </div>
  )
}
