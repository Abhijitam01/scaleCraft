import { describe, it, expect } from 'vitest'
import { FAILURE_SCENARIOS } from '../failures.js'
import type { FailureType } from '../types.js'

const EXPECTED_TYPES: FailureType[] = [
  'nodeFailure',
  'networkPartition',
  'latencySpike',
  'trafficSurge',
]

describe('FAILURE_SCENARIOS', () => {
  it('contains all 4 failure types', () => {
    const types = FAILURE_SCENARIOS.map(s => s.type)
    for (const expected of EXPECTED_TYPES) {
      expect(types, `Missing failure type: ${expected}`).toContain(expected)
    }
  })

  it('each scenario has required fields', () => {
    for (const scenario of FAILURE_SCENARIOS) {
      expect(typeof scenario.id).toBe('string')
      expect(scenario.id.length).toBeGreaterThan(0)
      expect(EXPECTED_TYPES).toContain(scenario.type)
      expect(typeof scenario.description).toBe('string')
      expect(scenario.description.length).toBeGreaterThan(0)
      expect(typeof scenario.durationMs).toBe('number')
      expect(scenario.durationMs).toBeGreaterThan(0)
    }
  })

  it('nodeFailure scenario specifies a targetNodeId', () => {
    const nodeFailure = FAILURE_SCENARIOS.find(s => s.type === 'nodeFailure')
    expect(nodeFailure).toBeDefined()
    expect(nodeFailure?.targetNodeId).toBeDefined()
    expect(typeof nodeFailure?.targetNodeId).toBe('string')
  })

  it('has unique IDs', () => {
    const ids = FAILURE_SCENARIOS.map(s => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all durations are reasonable (1s–60s)', () => {
    for (const scenario of FAILURE_SCENARIOS) {
      expect(scenario.durationMs).toBeGreaterThanOrEqual(1000)
      expect(scenario.durationMs).toBeLessThanOrEqual(60000)
    }
  })
})
