import lessonRaw from '@/data/lesson-url-shortener.json'
import simStatesRaw from '@/data/simulationStates.json'
import { validateLesson, validateSimulationStates } from '@/lib/validateContent'
import type { Lesson, SimulationState } from '@/lib/validateContent'

// Validated at module load — throws loudly with field path if JSON is malformed.
// Fix the JSON, not the error handling.
export const lesson: Lesson = validateLesson(lessonRaw)
export const simulationStates: SimulationState[] = validateSimulationStates(simStatesRaw)
