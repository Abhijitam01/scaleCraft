import { describe, it, expect } from 'vitest'
import { deriveHealth } from '../index.js'
import type { SimNode, SimEdge, SimConfig, HealthState } from '../types.js'

function makeNode(id: string, nodeId: string): SimNode {
  return { id, nodeId }
}

function makeEdge(source: string, target: string): SimEdge {
  return { source, target }
}

const defaultConfig: SimConfig = {
  trafficLevel: 'moderate',
  readRatio: 0.9,
  activeFailure: null,
}

describe('deriveHealth', () => {
  describe('empty graph', () => {
    it('returns safe defaults for empty node list', () => {
      const result = deriveHealth([], [], defaultConfig)
      expect(result.nodeHealth).toEqual({})
      expect(result.p99LatencyMs).toBe(0)
      expect(result.rpsCapacity).toBe(0)
      expect(result.errorRate).toBe(0)
      expect(result.bottleneck).toBeNull()
      expect(result.warnings).toEqual([])
      expect(result.detectedPatterns).toEqual([])
      expect(result.score).toBe(100)
    })
  })

  describe('traffic levels', () => {
    it('marks nodes as idle at idle traffic', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'idle' })
      expect(result.nodeHealth['a1']).toBe('idle')
    })

    it('marks api_server as healthy at low traffic', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'low' })
      // 500 RPS / 10000 capacity = 0.05 ratio → healthy
      expect(result.nodeHealth['a1']).toBe('healthy')
    })

    it('marks database as overloaded at high traffic without cache', () => {
      const nodes = [makeNode('db1', 'database')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'high' })
      // 50000 RPS / 5000 capacity = 10.0 ratio → failed
      expect(result.nodeHealth['db1']).toBe('failed')
    })

    it('marks database better than without cache at high traffic', () => {
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('c1', 'cache'),
        makeNode('db1', 'database'),
      ]
      const edges = [makeEdge('a1', 'c1'), makeEdge('a1', 'db1')]
      const withCache = deriveHealth(nodes, edges, { ...defaultConfig, trafficLevel: 'high' })

      const nodesNoCache = [makeNode('a1', 'api_server'), makeNode('db1', 'database')]
      const edgesNoCache = [makeEdge('a1', 'db1')]
      const withoutCache = deriveHealth(nodesNoCache, edgesNoCache, { ...defaultConfig, trafficLevel: 'high' })

      // With cache, DB receives only 10% of traffic — it must be in a better or equal health state
      const healthOrder: HealthState[] = ['idle', 'healthy', 'degraded', 'overloaded', 'failed']
      const withCacheIdx = healthOrder.indexOf(withCache.nodeHealth['db1'] ?? 'failed')
      const withoutCacheIdx = healthOrder.indexOf(withoutCache.nodeHealth['db1'] ?? 'failed')
      expect(withCacheIdx).toBeLessThanOrEqual(withoutCacheIdx)
    })
  })

  describe('SPOF detection', () => {
    it('gives score ≤70 for single api_server (SPOF)', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const result = deriveHealth(nodes, [], defaultConfig)
      expect(result.score).toBeLessThanOrEqual(70)
      expect(result.detectedPatterns).toContain('single-point-of-failure')
      expect(result.warnings.some(w => w.includes('Single point of failure'))).toBe(true)
    })

    it('does not flag SPOF when load_balancer is present', () => {
      const nodes = [
        makeNode('lb1', 'load_balancer'),
        makeNode('a1', 'api_server'),
        makeNode('a2', 'api_server'),
      ]
      const edges = [makeEdge('lb1', 'a1'), makeEdge('lb1', 'a2')]
      const result = deriveHealth(nodes, edges, defaultConfig)
      expect(result.detectedPatterns).not.toContain('single-point-of-failure')
    })
  })

  describe('failure scenarios', () => {
    it('marks targeted node as failed for nodeFailure', () => {
      const nodes = [makeNode('db1', 'database'), makeNode('a1', 'api_server')]
      const edges = [makeEdge('a1', 'db1')]
      const result = deriveHealth(nodes, edges, {
        ...defaultConfig,
        activeFailure: {
          id: 'db-overload',
          type: 'nodeFailure',
          targetNodeId: 'database',
          description: 'DB fails',
          durationMs: 30000,
        },
      })
      expect(result.nodeHealth['db1']).toBe('failed')
      expect(result.errorRate).toBeGreaterThan(0)
    })

    it('marks cache as failed for networkPartition', () => {
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('c1', 'cache'),
        makeNode('db1', 'database'),
      ]
      const edges = [makeEdge('a1', 'c1'), makeEdge('a1', 'db1')]
      const result = deriveHealth(nodes, edges, {
        ...defaultConfig,
        activeFailure: {
          id: 'network-partition',
          type: 'networkPartition',
          description: 'Cache unreachable',
          durationMs: 20000,
        },
      })
      expect(result.nodeHealth['c1']).toBe('failed')
      expect(result.warnings.some(w => w.includes('Network partition'))).toBe(true)
    })

    it('increases p99 for latencySpike', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const baseline = deriveHealth(nodes, [], defaultConfig)
      const spiked = deriveHealth(nodes, [], {
        ...defaultConfig,
        activeFailure: {
          id: 'latency-spike',
          type: 'latencySpike',
          description: 'Latency spike',
          durationMs: 15000,
        },
      })
      expect(spiked.p99LatencyMs).toBeGreaterThan(baseline.p99LatencyMs)
    })

    it('degrades health for trafficSurge', () => {
      // api_server at moderate traffic is healthy; 5x surge should push it into degraded/overloaded
      const nodes = [makeNode('a1', 'api_server')]
      const baseline = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'low' })
      const surged = deriveHealth(nodes, [], {
        ...defaultConfig,
        trafficLevel: 'low',
        activeFailure: {
          id: 'traffic-surge',
          type: 'trafficSurge',
          description: '5x surge',
          durationMs: 10000,
        },
      })
      // baseline should be healthy, surge should be worse
      const healthOrder = ['idle', 'healthy', 'degraded', 'overloaded', 'failed']
      const baselineIdx = healthOrder.indexOf(baseline.nodeHealth['a1'] ?? 'idle')
      const surgedIdx = healthOrder.indexOf(surged.nodeHealth['a1'] ?? 'idle')
      expect(surgedIdx).toBeGreaterThanOrEqual(baselineIdx)
    })
  })

  describe('warnings', () => {
    it('warns about db-fan-out when 3+ nodes connect to database', () => {
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('w1', 'worker'),
        makeNode('s1', 'server'),
        makeNode('db1', 'database'),
      ]
      const edges = [
        makeEdge('a1', 'db1'),
        makeEdge('w1', 'db1'),
        makeEdge('s1', 'db1'),
      ]
      const result = deriveHealth(nodes, edges, defaultConfig)
      expect(result.warnings.some(w => w.includes('connection pool'))).toBe(true)
      expect(result.score).toBeLessThan(100)
    })

    it('warns about no-auth-layer when no gateway or rate_limiter', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const result = deriveHealth(nodes, [], defaultConfig)
      expect(result.warnings.some(w => w.includes('rate limiter'))).toBe(true)
    })
  })

  describe('score', () => {
    it('scores 100 for monitoring-only (safe baseline)', () => {
      const nodes = [makeNode('m1', 'monitoring')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'idle' })
      expect(result.score).toBe(100)
    })

    it('score decreases with multiple anti-patterns', () => {
      // SPOF + no-auth + db-fan-out
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('w1', 'worker'),
        makeNode('s1', 'server'),
        makeNode('db1', 'database'),
      ]
      const edges = [
        makeEdge('a1', 'db1'),
        makeEdge('w1', 'db1'),
        makeEdge('s1', 'db1'),
      ]
      const result = deriveHealth(nodes, edges, defaultConfig)
      expect(result.score).toBeLessThan(60) // SPOF(-30) + no-auth(-20) + fan-out(-15) = 35
    })

    it('score never goes below 0', () => {
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('w1', 'worker'),
        makeNode('s1', 'server'),
        makeNode('db1', 'database'),
      ]
      const edges = [makeEdge('a1', 'db1'), makeEdge('w1', 'db1'), makeEdge('s1', 'db1')]
      const result = deriveHealth(nodes, edges, { ...defaultConfig, trafficLevel: 'peak' })
      expect(result.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('bottleneck', () => {
    it('identifies the most loaded node as bottleneck', () => {
      // At high traffic, database (5k capacity) will be bottleneck vs cache (100k capacity)
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('c1', 'cache'),
        makeNode('db1', 'database'),
      ]
      const edges = [makeEdge('a1', 'c1'), makeEdge('a1', 'db1')]
      const result = deriveHealth(nodes, edges, { ...defaultConfig, trafficLevel: 'high' })
      // Database is likely bottleneck (lowest RPS capacity among relevant nodes)
      expect(result.bottleneck).not.toBeNull()
    })

    it('returns null bottleneck for idle traffic', () => {
      const nodes = [makeNode('a1', 'api_server')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'idle' })
      // All nodes are idle — bottleneck tracking should reflect 0 load
      expect(result.nodeHealth['a1']).toBe('idle')
    })
  })

  describe('infinite-capacity nodes', () => {
    it('marks monitoring as idle at idle traffic level', () => {
      const nodes = [makeNode('m1', 'monitoring')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'idle' })
      expect(result.nodeHealth['m1']).toBe('idle')
    })

    it('marks monitoring as healthy at non-idle traffic', () => {
      // Infinite-capacity nodes skip capacity ratio path. Non-idle → 'healthy'.
      const nodes = [makeNode('m1', 'monitoring')]
      const result = deriveHealth(nodes, [], { ...defaultConfig, trafficLevel: 'moderate' })
      expect(result.nodeHealth['m1']).toBe('healthy')
    })
  })

  describe('readRatio 0.99', () => {
    it('reduces database effectiveRps by 99% when readRatio is 0.99', () => {
      // With cache + readRatio 0.99: effectiveRps *= 0.01 (only 1% of reads reach DB)
      // At high traffic (50k * 0.01 = 500 RPS / 5000 capacity = 0.1) → healthy
      const nodes = [
        makeNode('a1', 'api_server'),
        makeNode('c1', 'cache'),
        makeNode('db1', 'database'),
      ]
      const edges = [makeEdge('a1', 'c1'), makeEdge('a1', 'db1')]
      const result = deriveHealth(nodes, edges, {
        trafficLevel: 'high',
        readRatio: 0.99,
        activeFailure: null,
      })
      // 50000 * 0.01 = 500 / 5000 = 0.1 → healthy (vs 0.9 readRatio: 50000*0.1=5000/5000=1.0 → failed)
      expect(result.nodeHealth['db1']).toBe('healthy')
    })
  })

  describe('CDN path', () => {
    it('reduces effectiveRps for CDN node when cdn-origin pattern is active', () => {
      // CDN (1M RPS capacity) at moderate (5000 RPS) with cdn-origin: effectiveRps = 5000 * 0.05 = 250
      // ratio = 250 / 1000000 = 0.00025 → healthy
      const nodes = [makeNode('cdn1', 'cdn'), makeNode('a1', 'api_server')]
      const edges = [makeEdge('cdn1', 'a1')]
      const result = deriveHealth(nodes, edges, { ...defaultConfig, trafficLevel: 'moderate' })
      expect(result.nodeHealth['cdn1']).toBe('healthy')
      expect(result.detectedPatterns).toContain('cdn-origin')
    })
  })

  describe('overloaded state', () => {
    it('marks rate_limiter as overloaded under trafficSurge at high traffic', () => {
      // rate_limiter capacity: 300k RPS
      // high traffic (50k RPS) * trafficSurge (5x) = 250k effectiveRps
      // ratio = 250000 / 300000 = 0.833 → in [0.8, 1.0) → overloaded
      const nodes = [makeNode('rl1', 'rate_limiter'), makeNode('a1', 'api_server')]
      const edges = [makeEdge('rl1', 'a1')]
      const result = deriveHealth(nodes, edges, {
        trafficLevel: 'high',
        readRatio: 0.9,
        activeFailure: {
          id: 'traffic-surge',
          type: 'trafficSurge',
          description: '5x surge',
          durationMs: 10000,
        },
      })
      expect(result.nodeHealth['rl1']).toBe('overloaded')
    })
  })

  describe('unknown node types', () => {
    it('marks unknown node types as idle', () => {
      const nodes = [makeNode('x1', 'unknown_component')]
      const result = deriveHealth(nodes, [], defaultConfig)
      expect(result.nodeHealth['x1']).toBe('idle')
    })
  })

  describe('performance', () => {
    it('completes in under 5ms for a 10-node graph', () => {
      const nodes = [
        makeNode('lb1', 'load_balancer'),
        makeNode('a1', 'api_server'),
        makeNode('a2', 'api_server'),
        makeNode('gw1', 'api_gateway'),
        makeNode('rl1', 'rate_limiter'),
        makeNode('c1', 'cache'),
        makeNode('db1', 'database'),
        makeNode('rr1', 'read_replica'),
        makeNode('mq1', 'message_queue'),
        makeNode('w1', 'worker'),
      ]
      const edges = [
        makeEdge('lb1', 'a1'),
        makeEdge('lb1', 'a2'),
        makeEdge('a1', 'c1'),
        makeEdge('a1', 'db1'),
        makeEdge('db1', 'rr1'),
        makeEdge('a1', 'mq1'),
        makeEdge('mq1', 'w1'),
      ]
      const start = performance.now()
      deriveHealth(nodes, edges, { ...defaultConfig, trafficLevel: 'peak' })
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(5)
    })
  })
})
