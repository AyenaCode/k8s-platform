import { Link, Outlet } from '@tanstack/react-router'
import { LevelChip } from '@/features/gamification/LevelChip'

export function RootLayout() {
  return (
    <div className="app">
      <nav className="app__nav">
        <Link to="/" className="app__brand">
          K8s Lab
        </Link>
        <Link to="/courses">Courses</Link>
        <Link to="/exercises">Incidents</Link>
        <div className="app__nav-spacer" />
        <LevelChip />
      </nav>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
