export type ContentArea =
  | "medical-surgical"
  | "mother-child"
  | "psychiatric"
  | "community-health"
  | "leadership-management"

export type Difficulty = "easy" | "medium" | "hard"

export interface Question {
  id: string
  contentArea: ContentArea
  difficulty: Difficulty
  text: string
  choices: { key: string; text: string }[]
  correctAnswer: string
  rationale: string
  wrongChoiceRationales: Record<string, string>
  reviewed: boolean
  reviewedBy?: string
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  type: "practice" | "mock-exam"
  contentAreas: ContentArea[]
  status: "in-progress" | "completed"
  startedAt: string
  completedAt?: string
  questions: string[]
  answers: Record<string, string>
}

export interface SessionResult {
  sessionId: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  score: number
  timeTaken: number
  areaBreakdown: Record<ContentArea, { correct: number; total: number }>
}

export interface UserProgress {
  totalQuestionsAnswered: number
  totalCorrect: number
  overallScore: number
  areaScores: Record<ContentArea, { correct: number; total: number; score: number }>
  weakAreas: ContentArea[]
}
