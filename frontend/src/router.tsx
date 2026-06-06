// Code-based TanStack Router tree (type-safe, no codegen). The dashboard and the
// lesson catalog render full-width under RootLayout. A lesson renders under a
// pathless LAYOUT route (`_lab`) that keeps a single persistent terminal mounted
// while its <Outlet/> content swaps, so the shell session survives navigation.
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from '@/app/RootLayout'
import { LabLayout } from '@/app/LabLayout'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { LessonsListPage } from '@/features/lessons/pages/LessonsListPage'
import { LessonPage } from '@/features/lessons/pages/LessonPage'

const rootRoute = createRootRoute({ component: RootLayout })

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <DashboardPage />,
})

const lessonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lessons',
  component: () => <LessonsListPage />,
})

// Pathless layout route (declared with `id`, not `path`): persistent terminal.
const labRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_lab',
  component: LabLayout,
})

const lessonDetailRoute = createRoute({
  getParentRoute: () => labRoute,
  path: '/lessons/$slug',
  component: function LessonDetailRoute() {
    const { slug } = lessonDetailRoute.useParams()
    return <LessonPage slug={slug} />
  },
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  lessonsRoute,
  labRoute.addChildren([lessonDetailRoute]),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
