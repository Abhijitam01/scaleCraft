import { z } from 'zod'

const TrafficLevelSchema = z.enum(['low', 'med', 'high', 'spike'])

// ─── Ecommerce simulation schema ─────────────────────────────────────────────

export const EcommerceSimulationStateSchema = z.object({
  caching: z.boolean(),
  cdn: z.boolean(),
  traffic_level: TrafficLevelSchema,
  p50_latency_ms: z.number().nonnegative(),
  p99_latency_ms: z.number().nonnegative(),
  error_rate_pct: z.number().min(0).max(100),
  rps_capacity: z.number().positive(),
  cache_hit_rate_pct: z.number().min(0).max(100),
  toggle_explanation: z.string(),
})

const EcommerceSimStatesFileSchema = z.object({
  _meta: z.object({
    template: z.literal('ecommerce'),
    dimensions: z.array(z.string()),
    label: z.string(),
    states_count: z.number().int(),
  }),
  states: z.array(EcommerceSimulationStateSchema).min(1),
})

export type EcommerceSimulationState = z.infer<typeof EcommerceSimulationStateSchema>

export function validateEcommerceSimStates(raw: unknown): EcommerceSimulationState[] {
  const result = EcommerceSimStatesFileSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(
      `[content] sim-ecommerce.json invalid — ${issue?.path.join('.')} ${issue?.message}`
    )
  }
  return result.data.states
}

// ─── Chat simulation schema ───────────────────────────────────────────────────

export const ChatSimulationStateSchema = z.object({
  caching: z.boolean(),
  rate_limiter: z.boolean(),
  traffic_level: TrafficLevelSchema,
  p50_latency_ms: z.number().nonnegative(),
  p99_latency_ms: z.number().nonnegative(),
  error_rate_pct: z.number().min(0).max(100),
  rps_capacity: z.number().positive(),
  cache_hit_rate_pct: z.number().min(0).max(100),
  toggle_explanation: z.string(),
})

const ChatSimStatesFileSchema = z.object({
  _meta: z.object({
    template: z.literal('chat'),
    dimensions: z.array(z.string()),
    label: z.string(),
    states_count: z.number().int(),
  }),
  states: z.array(ChatSimulationStateSchema).min(1),
})

export type ChatSimulationState = z.infer<typeof ChatSimulationStateSchema>

export function validateChatSimStates(raw: unknown): ChatSimulationState[] {
  const result = ChatSimStatesFileSchema.safeParse(raw)
  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(
      `[content] sim-chat.json invalid — ${issue?.path.join('.')} ${issue?.message}`
    )
  }
  return result.data.states
}
