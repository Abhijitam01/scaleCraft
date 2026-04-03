import lessonRaw from '@/data/lesson-url-shortener.json'
import simStatesRaw from '@/data/simulationStates.json'
import ecSimStatesRaw from '@/data/sim-ecommerce.json'
import chatSimStatesRaw from '@/data/sim-chat.json'
import { validateLesson, validateSimulationStates } from '@/lib/validateContent'
import { validateEcommerceSimStates, validateChatSimStates } from '@/lib/validateTemplate'
import type { Lesson, SimulationState } from '@/lib/validateContent'
import type { EcommerceSimulationState, ChatSimulationState } from '@/lib/validateTemplate'

export const lesson: Lesson = validateLesson(lessonRaw)
export const simulationStates: SimulationState[] = validateSimulationStates(simStatesRaw)
export const ecSimStates: EcommerceSimulationState[] = validateEcommerceSimStates(ecSimStatesRaw)
export const chatSimStates: ChatSimulationState[] = validateChatSimStates(chatSimStatesRaw)
