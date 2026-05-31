import { queryOptions } from '@tanstack/react-query'
import { apiGet } from '@/core/api/client'
import type { Exercise } from '@/features/exercises/types'

export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (lang: string) => [...exerciseKeys.all, 'list', lang] as const,
  detail: (id: string, lang: string) => [...exerciseKeys.all, 'detail', id, lang] as const,
}

export function exercisesListQuery(lang: string) {
  return queryOptions({
    queryKey: exerciseKeys.list(lang),
    queryFn: () => apiGet<Exercise[]>(`/api/exercises?lang=${lang}`),
  })
}

export function exerciseDetailQuery(id: string, lang: string) {
  return queryOptions({
    queryKey: exerciseKeys.detail(id, lang),
    queryFn: () => apiGet<Exercise>(`/api/exercises/${id}?lang=${lang}`),
  })
}
