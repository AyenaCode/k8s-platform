import { Link, Outlet } from '@tanstack/react-router'
import { LevelChip } from '@/features/gamification/LevelChip'
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

export function RootLayout() {
  return (
    <div className="app">
      <nav className="app__nav">
        <Link to="/" className="app__brand">
          K8s Lab
        </Link>
        <Link to="/lessons">Lessons</Link>
        <div className="app__nav-spacer" />
        <LangToggle />
        <LevelChip />
      </nav>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
