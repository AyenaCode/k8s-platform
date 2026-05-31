// Code-based TanStack Router tree (type-safe, no codegen). The catalog/dashboard
// pages render full-width under RootLayout. Course and incident pages render under
// a pathless LAYOUT route (`_lab`) that keeps a single persistent terminal mounted
// while their <Outlet/> content swaps — so the shell session survives navigation.
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from '@/app/RootLayout'
import { LabLayout } from '@/app/LabLayout'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { CoursesListPage } from '@/features/courses/pages/CoursesListPage'
import { CoursePage } from '@/features/courses/pages/CoursePage'
import { ExerciseListPage } from '@/features/exercises/pages/ExerciseListPage'
import { ExercisePage } from '@/features/exercises/pages/ExercisePage'

const rootRoute = createRootRoute({ component: RootLayout })

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <DashboardPage />,
})

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  component: () => <CoursesListPage />,
})

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises',
  component: () => <ExerciseListPage />,
})

// Pathless layout route: declared with `id` (not `path`). Its children keep their
// own absolute paths; the layout component is not remounted between them.
const labRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_lab',
  component: LabLayout,
})

const courseDetailRoute = createRoute({
  getParentRoute: () => labRoute,
  path: '/courses/$slug',
  component: function CourseDetailRoute() {
    const { slug } = courseDetailRoute.useParams()
    return <CoursePage slug={slug} />
  },
})

const exerciseDetailRoute = createRoute({
  getParentRoute: () => labRoute,
  path: '/exercises/$id',
  component: function ExerciseDetailRoute() {
    const { id } = exerciseDetailRoute.useParams()
    return <ExercisePage id={id} />
  },
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  coursesRoute,
  exercisesRoute,
  labRoute.addChildren([courseDetailRoute, exerciseDetailRoute]),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
