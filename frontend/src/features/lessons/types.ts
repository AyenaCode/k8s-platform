export interface LessonStep {
  id: string
  title: string
  markdown: string
  hint?: string
  hasSetup: boolean
  hasVerify: boolean
  xp: number
}

export interface LessonCard {
  slug: string
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
