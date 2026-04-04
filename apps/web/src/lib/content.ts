import urlShortenerRaw from '@/data/lesson-url-shortener.json'
import rateLimiterRaw from '@/data/lesson-rate-limiter.json'
import consistentHashingRaw from '@/data/lesson-consistent-hashing.json'
import ecommerceRaw from '@/data/lesson-ecommerce.json'
import cdnRaw from '@/data/lesson-cdn.json'
import socialFeedRaw from '@/data/lesson-social-media-feed.json'
import realTimeChatRaw from '@/data/lesson-real-time-chat.json'
import globalDistributedRaw from '@/data/lesson-global-distributed.json'
import simStatesRaw from '@/data/simulationStates.json'
import ecSimStatesRaw from '@/data/sim-ecommerce.json'
import chatSimStatesRaw from '@/data/sim-chat.json'
import { validateLesson, validateSimulationStates } from '@/lib/validateContent'
import { validateEcommerceSimStates, validateChatSimStates } from '@/lib/validateTemplate'
import type { Lesson, SimulationState } from '@/lib/validateContent'
import type { EcommerceSimulationState, ChatSimulationState } from '@/lib/validateTemplate'

const LESSON_REGISTRY: Record<string, unknown> = {
  'url-shortener': urlShortenerRaw,
  'rate-limiter': rateLimiterRaw,
  'consistent-hashing': consistentHashingRaw,
  'ecommerce-platform': ecommerceRaw,
  'cdn-design': cdnRaw,
  'social-media-feed': socialFeedRaw,
  'real-time-chat': realTimeChatRaw,
  'global-distributed': globalDistributedRaw,
}

export function getLessonContent(id: string): Lesson | null {
  const raw = LESSON_REGISTRY[id]
  if (!raw) return null
  return validateLesson(raw)
}

export const lesson: Lesson = validateLesson(urlShortenerRaw)
export const simulationStates: SimulationState[] = validateSimulationStates(simStatesRaw)
export const ecSimStates: EcommerceSimulationState[] = validateEcommerceSimStates(ecSimStatesRaw)
export const chatSimStates: ChatSimulationState[] = validateChatSimStates(chatSimStatesRaw)
