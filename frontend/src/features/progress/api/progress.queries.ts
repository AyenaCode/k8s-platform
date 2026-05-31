import { queryOptions } from '@tanstack/react-query'
import { apiGet } from '@/core/api/client'
import type { ProgressSummary } from '@/features/progress/types'

export const progressKeys = {
  all: ['progress'] as const,
  summary: () => [...progressKeys.all, 'summary'] as const,
}

export function progressSummaryQuery() {
  return queryOptions({
    queryKey: progressKeys.summary(),
    queryFn: () => apiGet<ProgressSummary>('/api/progress/summary'),
  })
}
