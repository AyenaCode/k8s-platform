export interface Exercise {
  id: string
  ns: string
  level: 'easy' | 'medium' | 'hard'
  title: string
  concept: string
  markdown?: string
}
