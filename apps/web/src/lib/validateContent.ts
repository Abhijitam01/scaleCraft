import { z } from 'zod'

// ─── Lesson schema ───────────────────────────────────────────────────────────

const QuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
})

const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(QuizOptionSchema).min(2),
  correctOptionId: z.string(),
  explanation: z.object({
    correct: z.string(),
    wrongAnswers: z.record(z.string(), z.string()),
  }),
})

const LessonStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number().int().positive(),
  instruction: z.string(),
  detail: z.string(),
  allowedNodeType: z.string(),
  allowedEdge: z.object({
    source: z.string(),
    target: z.string(),
  }),
  explanation: z.object({
    what: z.string(),
    why: z.string(),
    tradeoff: z.string(),
    realWorld: z.string(),
    capacity: z.string(),
  }),
})

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(LessonStepSchema).min(1),
  quiz: z.object({
    questions: z.array(QuizQuestionSchema).min(1),
    passingScore: z.number().int().positive(),
    totalQuestions: z.number().int().positive(),
  }),
})

export type Lesson = z.infer<typeof LessonSchema>
export type LessonStep = z.infer<typeof LessonStepSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

// ─── Simulation schema ────────────────────────────────────────────────────────

const TrafficLevelSchema = z.enum(['low', 'med', 'high', 'spike'])
const ReadRatioSchema = z.union([z.literal(0.9), z.literal(0.99)])

export const SimulationStateSchema = z.object({
  caching: z.boolean(),
  read_replicas: z.boolean(),
  connection_pooling: z.boolean(),
  traffic_level: TrafficLevelSchema,
  read_ratio: ReadRatioSchema,
  p50_latency_ms: z.number().nonnegative(),
  p99_latency_ms: z.number().nonnegative(),
  error_rate_pct: z.number().min(0).max(100),
  rps_capacity: z.number().positive(),
  cache_hit_rate_pct: z.number().min(0).max(100),
  toggle_explanation: z.string(),
})

export const SimulationStatesFileSchema = z.object({
  _meta: z.object({
    description: z.string(),
    dimensions: z.record(z.string(), z.unknown()),
    fields: z.record(z.string(), z.string()),
    note: z.string().optional(),
    total_states: z.number().int().optional(),
  }),
  states: z.array(SimulationStateSchema).min(1),
})

export type SimulationState = z.infer<typeof SimulationStateSchema>
export type TrafficLevel = z.infer<typeof TrafficLevelSchema>

// ─── Validators (called at app init) ─────────────────────────────────────────

export function validateLesson(raw: unknown): Lesson {
  const result = LessonSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(
      `[content] lesson-url-shortener.json invalid — ${issue?.path.join('.')} ${issue?.message}`
    )
  }
  return result.data
}

export function validateSimulationStates(raw: unknown): SimulationState[] {
  const result = SimulationStatesFileSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(
      `[content] simulationStates.json invalid — ${issue?.path.join('.')} ${issue?.message}`
    )
  }
  return result.data.states
}
