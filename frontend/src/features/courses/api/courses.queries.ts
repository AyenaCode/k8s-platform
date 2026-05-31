import { queryOptions } from '@tanstack/react-query'
import { apiGet } from '@/core/api/client'
import type { Course, CourseDetail } from '@/features/courses/types'

export const courseKeys = {
  all: ['courses'] as const,
  list: (lang: string) => [...courseKeys.all, 'list', lang] as const,
  detail: (slug: string, lang: string) => [...courseKeys.all, 'detail', slug, lang] as const,
}

export function coursesListQuery(lang: string) {
  return queryOptions({
    queryKey: courseKeys.list(lang),
    queryFn: () => apiGet<Course[]>(`/api/courses?lang=${lang}`),
  })
}

export function courseDetailQuery(slug: string, lang: string) {
  return queryOptions({
    queryKey: courseKeys.detail(slug, lang),
    queryFn: () => apiGet<CourseDetail>(`/api/courses/${slug}?lang=${lang}`),
  })
}
