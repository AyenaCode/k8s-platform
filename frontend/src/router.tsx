// Code-based TanStack Router tree (fully type-safe, no codegen step). Feature
// pages are imported from their modules; routing stays thin and declarative.
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from '@/app/RootLayout'
import { ExerciseListPage } from '@/features/exercises/pages/ExerciseListPage'
import { ExercisePage } from '@/features/exercises/pages/ExercisePage'

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/exercises' })
  },
})

const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises',
  component: () => <ExerciseListPage />,
})

const exerciseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises/$id',
  component: function ExerciseDetailRoute() {
    const { id } = exerciseDetailRoute.useParams()
    return <ExercisePage id={id} />
  },
})

const routeTree = rootRoute.addChildren([indexRoute, exercisesRoute, exerciseDetailRoute])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
