import { queryOptions } from '@tanstack/react-query'
import { apiGet } from '@/core/api/client'
import type { Lesson, LessonCard } from '@/features/lessons/types'

export const lessonKeys = {
  all: ['lessons'] as const,
  list: (lang: string) => [...lessonKeys.all, 'list', lang] as const,
  detail: (slug: string, lang: string) => [...lessonKeys.all, 'detail', slug, lang] as const,
}

export function lessonsListQuery(lang: string) {
  return queryOptions({
    queryKey: lessonKeys.list(lang),
    queryFn: () => apiGet<LessonCard[]>(`/api/lessons?lang=${lang}`),
  })
}

export function lessonDetailQuery(slug: string, lang: string) {
  return queryOptions({
    queryKey: lessonKeys.detail(slug, lang),
    queryFn: () => apiGet<Lesson>(`/api/lessons/${slug}?lang=${lang}`),
  })
}
