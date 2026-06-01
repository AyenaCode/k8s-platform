// Mirrors the backend gamification payloads (internal/progress + httpapi.summary).
export interface ProgressRecord {
  userId: string
  exerciseId: string
  solved: boolean
  xp: number
  solvedAt?: string
}

export interface LevelInfo {
  level: number
  title: string
  xp: number
  floor: number
  nextLevelXp: number // 0 at the top tier
}

export interface Badge {
  id: string
  name: string
  desc: string
  earned: boolean
}

export interface ProgressSummary {
  records: ProgressRecord[]
  totalXp: number
  level: LevelInfo
  streak: number
  badges: Badge[]
}
