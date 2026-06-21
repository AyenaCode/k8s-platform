import { Link, Outlet } from '@tanstack/react-router'
import { LevelChip } from '@/features/gamification/LevelChip'
import { useProgressSummary } from '@/features/progress/hooks'
import { useLang, type Lang } from '@/core/i18n/lang'

function LangToggle() {
  const { lang, setLang } = useLang()
  const langs: Lang[] = ['en', 'fr']
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {langs.map((l) => (
        <button
          key={l}
          className={l === lang ? 'lang-toggle__btn lang-toggle__btn--on' : 'lang-toggle__btn'}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// The Kubernetes helmsman's wheel — 7 spokes for the project's heptagon identity.
// Drawn in currentColor so the brand mark inherits the K8s-blue signal.
function HelmWheel() {
  const spokes = [
    [12, 4.4],
    [17.94, 7.26],
    [19.41, 13.69],
    [15.3, 18.85],
    [8.7, 18.85],
    [4.59, 13.69],
    [6.06, 7.26],
  ]
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {spokes.map(([x, y], i) => (
        <line key={i} x1="12" y1="12" x2={x} y2={y} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      ))}
      <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      {spokes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.25" fill="currentColor" />
      ))}
      <circle cx="12" cy="12" r="1.9" fill="currentColor" />
    </svg>
  )
}

// A streak is the single most addictive retention loop: keep it visible everywhere.
function NavStreak() {
  const { data } = useProgressSummary()
  if (!data || data.streak <= 0) return null
  return (
    <span className={data.streak >= 3 ? 'nav-streak is-hot' : 'nav-streak'} title="Days in a row with a solved task">
      🔥 <strong>{data.streak}</strong>
    </span>
  )
}

export function RootLayout() {
  return (
    <div className="app">
      <nav className="app__nav">
        <Link to="/" className="app__brand">
          <span className="app__brand-mark" aria-hidden="true">
            <HelmWheel />
          </span>
          K8s<b>Lab</b>
        </Link>
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'app__link--active' }}>
          Console
        </Link>
        <Link to="/lessons" activeProps={{ className: 'app__link--active' }}>
          Missions
        </Link>
        <Link to="/ckad" activeProps={{ className: 'app__link--active' }}>
          CKAD
        </Link>
        <div className="app__nav-spacer" />
        <NavStreak />
        <LangToggle />
        <LevelChip />
      </nav>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
