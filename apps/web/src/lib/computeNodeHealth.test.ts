import { describe, it, expect } from 'vitest'
import { computeNodeHealth } from '@/lib/computeNodeHealth'
import type { SimulationState } from '@/lib/validateContent'

// Baseline state — low traffic, no components, no errors
const BASE: SimulationState = {
  caching: false,
  read_replicas: false,
  connection_pooling: false,
  traffic_level: 'low',
  read_ratio: 0.9,
  p50_latency_ms: 18,
  p99_latency_ms: 65,
  error_rate_pct: 0.0,
  rps_capacity: 180,
  cache_hit_rate_pct: 0,
  toggle_explanation: 'test',
}

describe('computeNodeHealth', () => {
  it('returns empty object for empty node list', () => {
    expect(computeNodeHealth([], BASE)).toEqual({})
  })

  it('client is always active', () => {
    const result = computeNodeHealth(['client'], BASE)
    expect(result.client).toBe('active')
  })

  describe('database', () => {
    it('active at low error rate and low latency', () => {
      const result = computeNodeHealth(['database'], { ...BASE, error_rate_pct: 0, p99_latency_ms: 65 })
      expect(result.database).toBe('active')
    })

    it('degraded when error rate > 2%', () => {
      const result = computeNodeHealth(['database'], { ...BASE, error_rate_pct: 2.5 })
      expect(result.database).toBe('degraded')
    })

    it('degraded when p99 > 300ms even with no errors', () => {
      const result = computeNodeHealth(['database'], { ...BASE, error_rate_pct: 0, p99_latency_ms: 350 })
      expect(result.database).toBe('degraded')
    })

    it('overloaded when error rate > 5%', () => {
      const result = computeNodeHealth(['database'], { ...BASE, error_rate_pct: 6 })
      expect(result.database).toBe('overloaded')
    })

    it('failed when error rate > 10%', () => {
      const result = computeNodeHealth(['database'], { ...BASE, error_rate_pct: 12 })
      expect(result.database).toBe('failed')
    })
  })

  describe('api_server', () => {
    it('active at zero error rate', () => {
      const result = computeNodeHealth(['api_server'], BASE)
      expect(result.api_server).toBe('active')
    })

    it('degraded at error rate > 1%', () => {
      const result = computeNodeHealth(['api_server'], { ...BASE, error_rate_pct: 1.5 })
      expect(result.api_server).toBe('degraded')
    })

    it('overloaded at error rate > 3%', () => {
      const result = computeNodeHealth(['api_server'], { ...BASE, error_rate_pct: 4 })
      expect(result.api_server).toBe('overloaded')
    })

    it('failed at error rate > 8%', () => {
      const result = computeNodeHealth(['api_server'], { ...BASE, error_rate_pct: 9 })
      expect(result.api_server).toBe('failed')
    })
  })

  describe('cache', () => {
    it('idle when caching=false in state', () => {
      const result = computeNodeHealth(['cache'], { ...BASE, caching: false })
      expect(result.cache).toBe('idle')
    })

    it('active when caching=true and hit rate > 80%', () => {
      const result = computeNodeHealth(['cache'], { ...BASE, caching: true, cache_hit_rate_pct: 87 })
      expect(result.cache).toBe('active')
    })

    it('degraded when caching=true but hit rate <= 80%', () => {
      const result = computeNodeHealth(['cache'], { ...BASE, caching: true, cache_hit_rate_pct: 40 })
      expect(result.cache).toBe('degraded')
    })
  })

  describe('load_balancer', () => {
    it('idle when connection_pooling=false', () => {
      const result = computeNodeHealth(['load_balancer'], { ...BASE, connection_pooling: false })
      expect(result.load_balancer).toBe('idle')
    })

    it('active when connection_pooling=true', () => {
      const result = computeNodeHealth(['load_balancer'], { ...BASE, connection_pooling: true })
      expect(result.load_balancer).toBe('active')
    })
  })

  describe('read_replica', () => {
    it('idle when read_replicas=false', () => {
      const result = computeNodeHealth(['read_replica'], { ...BASE, read_replicas: false })
      expect(result.read_replica).toBe('idle')
    })

    it('active when read_replicas=true', () => {
      const result = computeNodeHealth(['read_replica'], { ...BASE, read_replicas: true })
      expect(result.read_replica).toBe('active')
    })
  })

  describe('always-active nodes', () => {
    it.each(['cdn', 'rate_limiter', 'monitoring'])('%s is always active when placed', (id) => {
      const result = computeNodeHealth([id], BASE)
      expect(result[id]).toBe('active')
    })
  })

  it('unknown node type defaults to idle', () => {
    const result = computeNodeHealth(['some_future_node'], BASE)
    expect(result.some_future_node).toBe('idle')
  })

  it('handles multiple nodes together', () => {
    const state: SimulationState = {
      ...BASE,
      caching: true,
      read_replicas: true,
      connection_pooling: true,
      traffic_level: 'spike',
      error_rate_pct: 7,
      p99_latency_ms: 480,
      cache_hit_rate_pct: 88,
    }
    const result = computeNodeHealth(
      ['client', 'api_server', 'database', 'cache', 'load_balancer', 'read_replica'],
      state
    )
    expect(result.client).toBe('active')
    expect(result.api_server).toBe('overloaded')    // error_rate 7 > 3, not > 8
    expect(result.database).toBe('overloaded')     // error_rate 7 > 5
    expect(result.cache).toBe('active')            // caching=true, hit_rate=88 > 80
    expect(result.load_balancer).toBe('active')    // connection_pooling=true
    expect(result.read_replica).toBe('active')     // read_replicas=true
  })
})
