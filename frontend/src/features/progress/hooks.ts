// Gamification hooks. Queries read the aggregated summary; mutations record a
// solved exercise / finished course and refetch the summary so XP, level and
// badges update everywhere (nav chip, dashboard, lists) at once.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiPost } from '@/core/api/client'
import { progressKeys, progressSummaryQuery } from '@/features/progress/api/progress.queries'
import type { ProgressRecord, ProgressSummary } from '@/features/progress/types'

export function useProgressSummary() {
  return useQuery(progressSummaryQuery())
}

export function useSolveExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiPost<ProgressRecord>(`/api/progress/${id}/solve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: progressKeys.summary() }),
  })
}

export function useCompleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => apiPost<ProgressRecord>(`/api/courses/${slug}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: progressKeys.summary() }),
  })
}

// solvedIds and completedCourseSlugs are small selectors used by list pages to
// render checkmarks without re-deriving the filtering logic each time.
export function solvedExerciseIds(summary?: ProgressSummary): Set<string> {
  const ids = new Set<string>()
  summary?.records.forEach((r) => {
    if (r.solved && !r.exerciseId.startsWith('course:')) ids.add(r.exerciseId)
  })
  return ids
}

export function completedCourseSlugs(summary?: ProgressSummary): Set<string> {
  const slugs = new Set<string>()
  summary?.records.forEach((r) => {
    if (r.solved && r.exerciseId.startsWith('course:')) slugs.add(r.exerciseId.slice('course:'.length))
  })
  return slugs
}
