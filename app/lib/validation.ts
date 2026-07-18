import { z } from "zod"

export const contentAreaSchema = z.enum([
  "pnle-i",
  "pnle-ii",
  "pnle-iii",
  "pnle-iv",
  "pnle-v",
])

export const difficultySchema = z.enum(["easy", "medium", "hard"])

export const choiceSchema = z.object({
  key: z.string().min(1),
  text: z.string().min(1),
})

export const createQuestionSchema = z.object({
  contentArea: contentAreaSchema,
  difficulty: difficultySchema,
  text: z.string().min(1),
  choices: z.array(choiceSchema).min(2).max(10),
  correctAnswer: z.string().min(1),
  rationale: z.string().min(1),
  wrongChoiceRationales: z.record(z.string(), z.string()).optional(),
})

export const generateQuestionsSchema = z.object({
  contentArea: contentAreaSchema,
  count: z.number().int().min(1).max(50).default(10),
})

export const reviewQuestionSchema = z.object({
  questionId: z.string().uuid(),
  approved: z.boolean(),
  feedback: z.string().optional(),
})

export const createSessionSchema = z.object({
  type: z.enum(["practice", "mock-exam"]),
  contentAreas: z.array(contentAreaSchema).min(1),
  questionCount: z.number().int().min(1).max(100).default(20),
})

export const answerQuestionSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().min(1),
})

export const checkoutSchema = z.object({
  plan: z.enum(["monthly", "final-push"]),
})

export const wrongChoiceKeysSchema = z.record(z.string(), z.string()).refine(
  (val) => Object.keys(val).length >= 1,
  { message: "wrongChoiceRationales needs at least 1 entry" },
)

export const generatedQuestionSchema = z.object({
  text: z.string().min(1),
  choices: z.array(choiceSchema).min(2).max(10),
  correctAnswer: z.string().min(1),
  rationale: z.string().min(1),
  wrongChoiceRationales: wrongChoiceKeysSchema,
})

export const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  contentAreas: z.array(contentAreaSchema).min(1, "Select at least one content area"),
  dailyGoal: z.number().int().min(5).max(100).default(20),
  targetExamDate: z.string().optional(),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>

export const questionListSchema = z.object({
  contentArea: contentAreaSchema.optional(),
  difficulty: difficultySchema.optional(),
  reviewed: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
