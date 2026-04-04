import { describe, it, expect } from 'vitest'
import { COMPONENT_TOKENS } from '../components.js'

const EXPECTED_NODE_IDS = [
  'client', 'load_balancer', 'api_server', 'server', 'database', 'read_replica',
  'cache', 'cdn', 'api_gateway', 'rate_limiter', 'message_queue', 'stream',
  'worker', 'function', 'container', 'blob_storage', 'search', 'monitoring',
]

describe('COMPONENT_TOKENS', () => {
  it('has entries for all 18 node types', () => {
    for (const nodeId of EXPECTED_NODE_IDS) {
      expect(COMPONENT_TOKENS[nodeId], `Missing token for ${nodeId}`).toBeDefined()
    }
  })

  it('each token has required fields', () => {
    for (const [key, token] of Object.entries(COMPONENT_TOKENS)) {
      expect(token.nodeId, `${key}: nodeId`).toBe(key)
      expect(typeof token.baseLatencyMs, `${key}: baseLatencyMs`).toBe('number')
      expect(token.baseLatencyMs, `${key}: baseLatencyMs >= 0`).toBeGreaterThanOrEqual(0)
      expect(typeof token.baseRpsCapacity, `${key}: baseRpsCapacity`).toBe('number')
      expect(token.baseRpsCapacity, `${key}: baseRpsCapacity > 0`).toBeGreaterThan(0)
      expect(typeof token.scaleFactor, `${key}: scaleFactor`).toBe('number')
      expect(token.scaleFactor, `${key}: scaleFactor > 0`).toBeGreaterThan(0)
      expect(typeof token.failureMode, `${key}: failureMode`).toBe('string')
      expect(token.failureMode.length, `${key}: failureMode non-empty`).toBeGreaterThan(0)
      expect(Array.isArray(token.tradeoffs), `${key}: tradeoffs is array`).toBe(true)
      expect(token.tradeoffs.length, `${key}: at least 1 tradeoff`).toBeGreaterThanOrEqual(1)
      expect(typeof token.capacityNote, `${key}: capacityNote`).toBe('string')
      expect(token.capacityNote.length, `${key}: capacityNote non-empty`).toBeGreaterThan(0)
      expect(typeof token.realWorldExample, `${key}: realWorldExample`).toBe('string')
      expect(token.realWorldExample.length, `${key}: realWorldExample non-empty`).toBeGreaterThan(0)
    }
  })

  it('client and monitoring have infinite or very high capacity', () => {
    expect(COMPONENT_TOKENS['client']?.baseRpsCapacity).toBe(Infinity)
    expect(COMPONENT_TOKENS['monitoring']?.baseRpsCapacity).toBe(Infinity)
  })

  it('cache has higher capacity than database', () => {
    const cache = COMPONENT_TOKENS['cache']
    const db = COMPONENT_TOKENS['database']
    expect(cache).toBeDefined()
    expect(db).toBeDefined()
    expect(cache!.baseRpsCapacity).toBeGreaterThan(db!.baseRpsCapacity)
  })

  it('cache has lower latency than database', () => {
    const cache = COMPONENT_TOKENS['cache']
    const db = COMPONENT_TOKENS['database']
    expect(cache!.baseLatencyMs).toBeLessThan(db!.baseLatencyMs)
  })

  it('CDN has higher capacity than api_server', () => {
    const cdn = COMPONENT_TOKENS['cdn']
    const api = COMPONENT_TOKENS['api_server']
    expect(cdn!.baseRpsCapacity).toBeGreaterThan(api!.baseRpsCapacity)
  })
})
