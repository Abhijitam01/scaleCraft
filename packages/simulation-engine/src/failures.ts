import type { FailureScenario } from './types'

export const FAILURE_SCENARIOS: FailureScenario[] = [
  {
    id: 'db-overload',
    type: 'nodeFailure',
    targetNodeId: 'database',
    description: 'Database fails — connection pool exhausted',
    durationMs: 30000,
  },
  {
    id: 'network-partition',
    type: 'networkPartition',
    description: 'Cache unreachable — all reads fall through to database',
    durationMs: 20000,
  },
  {
    id: 'latency-spike',
    type: 'latencySpike',
    description: 'p99 latency spikes 10x — slow downstream cascade',
    durationMs: 15000,
  },
  {
    id: 'traffic-surge',
    type: 'trafficSurge',
    description: '5x traffic surge — capacity limits exposed',
    durationMs: 10000,
  },
]
