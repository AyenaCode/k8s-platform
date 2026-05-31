import { Link, Outlet } from '@tanstack/react-router'

export function RootLayout() {
  return (
    <div className="app">
      <nav className="app__nav">
        <Link to="/" className="app__brand">
          K8s Platform
        </Link>
        <Link to="/exercises">Exercises</Link>
      </nav>
      <main className="app__main">
        <Outlet />
      </main>
    </div>
  )
}
