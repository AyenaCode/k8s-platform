// LabLayout is the split "lab" shell: lesson/mission content on the left, a single
// PERSISTENT terminal on the right. It is a pathless layout route, so navigating
// between its children (/courses/$slug ↔ /exercises/$id) swaps only the <Outlet/>
// content, this component (and the PtyTerminal's WebSocket shell session) stays
// mounted, exactly like KodeKloud/KillerCoda.
import { Outlet } from '@tanstack/react-router'
import { PtyTerminal } from '@/shared/components/Terminal/PtyTerminal'

export function LabLayout() {
  return (
    <div className="lab">
      <section className="lab__content">
        <Outlet />
      </section>
      <aside className="lab__terminal">
        <div className="lab__terminal-bar">
          <span className="dotled" aria-hidden="true" />
          <span>live cluster</span>
          <span className="spacer" />
          <span className="keyhint">Ctrl+Shift+C / V to copy &amp; paste</span>
        </div>
        <div className="lab__terminal-body">
          <PtyTerminal />
        </div>
      </aside>
    </div>
  )
}
