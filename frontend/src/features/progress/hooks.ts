// Gamification hooks. The summary query is the single source of truth for XP,
// level, streak and badges. Steps are awarded server-side when their verify
// script passes (see LessonPage), so the only client action is to refetch the
// summary afterwards: there are no client-side "solve" mutations anymore.
import { useQuery } from '@tanstack/react-query'
import { progressSummaryQuery } from '@/features/progress/api/progress.queries'
import type { ProgressSummary } from '@/features/progress/types'

export function useProgressSummary() {
  return useQuery(progressSummaryQuery())
}

// Record-id helpers mirror the backend's key scheme (internal/progress/level.go).
export function stepKey(slug: string, stepId: string): string {
  return `step:${slug}/${stepId}`
}

export function solvedStepKeys(summary?: ProgressSummary): Set<string> {
  const ids = new Set<string>()
  summary?.records.forEach((r) => {
    if (r.solved && r.exerciseId.startsWith('step:')) ids.add(r.exerciseId)
  })
  return ids
}

export function completedLessonSlugs(summary?: ProgressSummary): Set<string> {
  const slugs = new Set<string>()
  summary?.records.forEach((r) => {
    if (r.solved && r.exerciseId.startsWith('lesson:')) slugs.add(r.exerciseId.slice('lesson:'.length))
  })
  return slugs
}
