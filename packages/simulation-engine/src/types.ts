export type TrafficLevel = 'idle' | 'low' | 'moderate' | 'high' | 'peak'

export type HealthState = 'idle' | 'healthy' | 'degraded' | 'overloaded' | 'failed'

export type FailureType = 'nodeFailure' | 'networkPartition' | 'latencySpike' | 'trafficSurge'

export type PatternType =
  | 'single-point-of-failure'
  | 'load-balanced-cluster'
  | 'write-through-cache'
  | 'db-replication'
  | 'cdn-origin'
  | 'async-message-queue'
  | 'no-auth-layer'
  | 'db-fan-out'

export interface SimNode {
  id: string
  nodeId: string
}

export interface SimEdge {
  source: string
  target: string
  data?: { label?: string }
}

export interface ComponentToken {
  nodeId: string
  baseLatencyMs: number
  baseRpsCapacity: number
  scaleFactor: number
  failureMode: string
  tradeoffs: string[]
  capacityNote: string
  realWorldExample: string
}

export interface HealthResult {
  nodeHealth: Record<string, HealthState>
  p99LatencyMs: number
  rpsCapacity: number
  errorRate: number
  bottleneck: string | null
  warnings: string[]
  detectedPatterns: PatternType[]
  score: number
}

export interface FailureScenario {
  id: string
  type: FailureType
  targetNodeId?: string
  description: string
  durationMs: number
}

export interface SimConfig {
  trafficLevel: TrafficLevel
  readRatio: 0.9 | 0.99
  activeFailure: FailureScenario | null
}
