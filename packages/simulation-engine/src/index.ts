import { COMPONENT_TOKENS } from './components'
import { detectPatterns } from './patterns'
import type {
  SimNode,
  SimEdge,
  SimConfig,
  HealthResult,
  HealthState,
  TrafficLevel,
} from './types'

export { COMPONENT_TOKENS } from './components'
export { detectPatterns } from './patterns'
export { FAILURE_SCENARIOS } from './failures'
export type {
  SimNode,
  SimEdge,
  SimConfig,
  HealthResult,
  HealthState,
  TrafficLevel,
  ComponentToken,
  FailureScenario,
  FailureType,
  PatternType,
} from './types'

const TRAFFIC_RPS: Record<TrafficLevel, number> = {
  idle: 10,
  low: 500,
  moderate: 5000,
  high: 50000,
  peak: 500000,
}

export function deriveHealth(
  nodes: SimNode[],
  edges: SimEdge[],
  config: SimConfig,
): HealthResult {
  if (nodes.length === 0) {
    return {
      nodeHealth: {},
      p99LatencyMs: 0,
      rpsCapacity: 0,
      errorRate: 0,
      bottleneck: null,
      warnings: [],
      detectedPatterns: [],
      score: 100,
    }
  }

  const incomingRps = TRAFFIC_RPS[config.trafficLevel]
  const patterns = detectPatterns(nodes, edges)

  const hasCDN = patterns.includes('cdn-origin')
  const hasCache =
    patterns.includes('write-through-cache') ||
    patterns.includes('db-replication')
  const isSPOF = patterns.includes('single-point-of-failure')

  const nodeHealth: Record<string, HealthState> = {}
  let p99 = 0
  let bottleneck: string | null = null
  let worstCapacityRatio = 0
  let minRpsCapacity = Infinity
  const warnings: string[] = []

  for (const node of nodes) {
    const token = COMPONENT_TOKENS[node.nodeId]

    // Unknown node type — mark idle
    if (!token) {
      nodeHealth[node.id] = 'idle'
      continue
    }

    // Nodes with infinite capacity (client, monitoring) are always healthy
    if (!isFinite(token.baseRpsCapacity)) {
      nodeHealth[node.id] = config.trafficLevel === 'idle' ? 'idle' : 'healthy'
      continue
    }

    // nodeFailure: targeted node is hard-failed
    if (
      config.activeFailure?.type === 'nodeFailure' &&
      config.activeFailure.targetNodeId === node.nodeId
    ) {
      nodeHealth[node.id] = 'failed'
      p99 += token.baseLatencyMs * 10
      worstCapacityRatio = Math.max(worstCapacityRatio, 2.0)
      continue
    }

    let effectiveRps = incomingRps

    // networkPartition: cache becomes unreachable — database absorbs its traffic
    if (config.activeFailure?.type === 'networkPartition') {
      if (node.nodeId === 'cache') {
        nodeHealth[node.id] = 'failed'
        continue
      }
      // Database absorbs full traffic when cache is down
    } else if (node.nodeId === 'database' && hasCache) {
      // With cache, DB only sees cache-miss traffic
      effectiveRps *= config.readRatio === 0.99 ? 0.01 : 0.1
    }

    if (node.nodeId === 'cdn' && hasCDN) {
      effectiveRps *= 0.05 // 95% cache hit rate
    }

    // trafficSurge: 5x the effective RPS
    if (config.activeFailure?.type === 'trafficSurge') {
      effectiveRps *= 5
    }

    const capacityRatio = effectiveRps / token.baseRpsCapacity
    let state: HealthState

    if (config.trafficLevel === 'idle') {
      state = 'idle'
    } else if (capacityRatio < 0.5) {
      state = 'healthy'
    } else if (capacityRatio < 0.8) {
      state = 'degraded'
    } else if (capacityRatio < 1.0) {
      state = 'overloaded'
    } else {
      state = 'failed'
    }

    nodeHealth[node.id] = state

    // latencySpike: 10x latency on all nodes
    const latencyMultiplier =
      config.activeFailure?.type === 'latencySpike'
        ? 10
        : Math.max(1, capacityRatio * 1.5)

    p99 += token.baseLatencyMs * latencyMultiplier

    // Track bottleneck (node closest to or past capacity)
    if (capacityRatio > worstCapacityRatio) {
      worstCapacityRatio = capacityRatio
      bottleneck = node.nodeId
    }

    // Track minimum finite RPS capacity
    if (token.baseRpsCapacity < minRpsCapacity) {
      minRpsCapacity = token.baseRpsCapacity
    }
  }

  // Warnings based on detected patterns
  if (isSPOF) {
    warnings.push('Single point of failure — one api_server failure takes the system down')
  }
  if (patterns.includes('db-fan-out')) {
    warnings.push('3+ services connect directly to database — connection pool exhaustion risk')
  }
  if (patterns.includes('no-auth-layer')) {
    warnings.push('No rate limiter or API gateway — unprotected against traffic spikes and abuse')
  }

  // networkPartition: warn about cache being down
  if (config.activeFailure?.type === 'networkPartition') {
    warnings.push('Network partition: cache unreachable — all reads falling through to database')
  }

  const errorRate =
    worstCapacityRatio > 1.0
      ? Math.min(1.0, (worstCapacityRatio - 1.0) * 0.5)
      : 0

  const rpsCapacity = isFinite(minRpsCapacity) ? minRpsCapacity : 0

  // Score: start at 100, apply penalties
  let score = 100
  if (isSPOF) score -= 30
  if (patterns.includes('no-auth-layer')) score -= 20
  if (patterns.includes('db-fan-out')) score -= 15
  if (errorRate > 0) score -= Math.round(errorRate * 40)
  score = Math.max(0, score)

  return {
    nodeHealth,
    p99LatencyMs: Math.round(p99),
    rpsCapacity,
    errorRate,
    bottleneck,
    warnings,
    detectedPatterns: patterns,
    score,
  }
}
