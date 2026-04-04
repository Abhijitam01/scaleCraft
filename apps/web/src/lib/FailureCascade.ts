export type { FailureScenario } from '@repo/simulation-engine'
export { FAILURE_SCENARIOS } from '@repo/simulation-engine'

export const SCENARIO_NAMES: Record<string, string> = {
  'db-overload': 'DB Overload',
  'network-partition': 'Network Partition',
  'latency-spike': 'Latency Spike',
  'traffic-surge': 'Traffic Surge',
}
