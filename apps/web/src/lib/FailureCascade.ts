import type { SimulationState } from '@/lib/validateContent'

export interface FailureScenario {
  id: string
  name: string
  description: string
  overrideState: Partial<SimulationState>
  durationMs: number
}

export const FAILURE_SCENARIOS: FailureScenario[] = [
  {
    id: 'db_connection_exhaustion',
    name: 'DB Connection Exhaustion',
    description: 'Too many concurrent queries saturate the connection pool. New requests queue or fail outright.',
    overrideState: {
      p99_latency_ms: 820,
      p50_latency_ms: 480,
      error_rate_pct: 15,
      rps_capacity: 80,
      cache_hit_rate_pct: 0,
    },
    durationMs: 10000,
  },
  {
    id: 'cache_invalidation_storm',
    name: 'Cache Invalidation Storm',
    description: 'A mass invalidation event empties the cache. Every request falls through to the database simultaneously.',
    overrideState: {
      p99_latency_ms: 640,
      p50_latency_ms: 310,
      error_rate_pct: 6,
      rps_capacity: 120,
      cache_hit_rate_pct: 5,
    },
    durationMs: 8000,
  },
  {
    id: 'api_memory_leak',
    name: 'API Memory Leak',
    description: 'API server memory grows unbounded. Response times climb until the process crashes and restarts.',
    overrideState: {
      p99_latency_ms: 950,
      p50_latency_ms: 520,
      error_rate_pct: 20,
      rps_capacity: 40,
      cache_hit_rate_pct: 0,
    },
    durationMs: 12000,
  },
]
