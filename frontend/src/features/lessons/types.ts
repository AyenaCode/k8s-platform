export interface LessonStep {
  id: string
  title: string
  markdown: string
  hasSetup: boolean
  hasVerify: boolean
  xp: number
}

export interface LessonCard {
  slug: string
  /** "core" or "ckad"; groups lessons into UI sections. */
  track: string
  title: string
  summary: string
  estMinutes: number
  xp: number
  stepCount: number
  verifyCount: number
}

export interface Lesson extends LessonCard {
  steps: LessonStep[]
}

/**
 * Whether a lesson belongs to the CKAD track. Prefers the backend `track`
 * field, with a slug fallback so the UI stays correct even if an older
 * payload omits it.
 */
export const isCkadLesson = (l: { track?: string; slug: string }): boolean =>
  l.track === 'ckad' || l.slug.includes('-ckad-')
