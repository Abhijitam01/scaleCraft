export type HealthState = 'idle' | 'active' | 'degraded' | 'overloaded' | 'failed'

/**
 * Structural subset of sim state fields needed for health derivation.
 * All SimulationState, EcommerceSimulationState, and ChatSimulationState
 * satisfy this interface structurally (TypeScript duck typing).
 * For template states, connection_pooling and read_replicas are derived
 * from node placement before calling this function.
 */
export interface HealthInputState {
  error_rate_pct: number
  p99_latency_ms: number
  caching: boolean
  cache_hit_rate_pct: number
  connection_pooling: boolean
  read_replicas: boolean
}

/**
 * Derives per-node health state from the current simulation state.
 * Pure function — no React, no store, no side effects.
 */
export function computeNodeHealth(
  placedNodeIds: string[],
  state: HealthInputState
): Record<string, HealthState> {
  const health: Record<string, HealthState> = {}

  for (const id of placedNodeIds) {
    switch (id) {
      case 'client':
        health[id] = 'active'
        break

      case 'database': {
        if (state.error_rate_pct > 10) health[id] = 'failed'
        else if (state.error_rate_pct > 5) health[id] = 'overloaded'
        else if (state.error_rate_pct > 2 || state.p99_latency_ms > 300) health[id] = 'degraded'
        else health[id] = 'active'
        break
      }

      case 'api_server': {
        if (state.error_rate_pct > 8) health[id] = 'failed'
        else if (state.error_rate_pct > 3) health[id] = 'overloaded'
        else if (state.error_rate_pct > 1) health[id] = 'degraded'
        else health[id] = 'active'
        break
      }

      case 'cache': {
        if (!state.caching) health[id] = 'idle'
        else if (state.cache_hit_rate_pct > 80) health[id] = 'active'
        else health[id] = 'degraded'
        break
      }

      case 'load_balancer': {
        health[id] = state.connection_pooling ? 'active' : 'idle'
        break
      }

      case 'read_replica': {
        health[id] = state.read_replicas ? 'active' : 'idle'
        break
      }

      case 'cdn':
      case 'rate_limiter':
      case 'monitoring':
        health[id] = 'active'
        break

      default:
        health[id] = 'idle'
    }
  }

  return health
}

export const HEALTH_COLORS: Record<HealthState, string> = {
  idle:      '#333333',
  active:    '#4ade80',
  degraded:  '#fbbf24',
  overloaded: '#f97316',
  failed:    '#ef4444',
}
