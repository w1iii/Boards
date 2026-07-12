import type { z } from "zod"
import type {
  contentAreaSchema,
  difficultySchema,
  choiceSchema,
  createQuestionSchema,
  generatedQuestionSchema,
} from "./validation"

export type ContentArea = z.infer<typeof contentAreaSchema>
export type Difficulty = z.infer<typeof difficultySchema>
export type Choice = z.infer<typeof choiceSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>

export interface Question {
  id: string
  content_area: ContentArea
  difficulty: Difficulty
  text: string
  choices: Choice[]
  correct_answer: string
  rationale: string
  wrong_choice_rationales: Record<string, string>
  reviewed: boolean
  reviewed_by?: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  type: "practice" | "mock-exam"
  content_areas: ContentArea[]
  status: "in-progress" | "completed"
  started_at: string
  completed_at?: string
  questions: string[]
  answers: Record<string, string>
}

export interface SessionResult {
  sessionId: string
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  score: number
  areaBreakdown: Record<string, { correct: number; total: number }>
}

export interface UserProgress {
  totalQuestionsAnswered: number
  totalCorrect: number
  overallScore: number
  areaScores: Record<string, { correct: number; total: number; score: number }>
  weakAreas: string[]
}

export interface UserProfile {
  id: string
  clerk_user_id: string
  first_name?: string
  last_name?: string
  onboarding_completed: boolean
  content_areas: ContentArea[]
  daily_goal: number
  target_exam_date?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: "monthly" | "final-push"
  status: "active" | "expired" | "cancelled"
  starts_at: string
  expires_at: string
  paymongo_session_id?: string
  created_at: string
}

