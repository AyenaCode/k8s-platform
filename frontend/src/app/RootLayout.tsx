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

// A streak is the single most addictive retention loop — keep it visible everywhere.
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
          <span className="app__brand-mark" aria-hidden="true" />
          K8s<b>Lab</b>
        </Link>
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'app__link--active' }}>
          Console
        </Link>
        <Link to="/lessons" activeProps={{ className: 'app__link--active' }}>
          Missions
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
