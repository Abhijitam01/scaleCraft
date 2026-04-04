import { colors } from '@repo/ui/tokens'

// Re-export the design system tokens as `C` for backward compat
export const C = {
  bg:       colors.bg,
  border:   colors.border,
  accent:   colors.accent,
  text:     colors.text,
  semantic: colors.semantic,
} as const

// All nodes use a neutral gray — icon abbreviation (LB, DB, etc.) is the visual differentiator.
// The accent color is reserved for highlighted/required state only.
const NODE_COLOR = '#3f3f3f'

export const NODE_META: Record<string, { icon: string; color: string; sublabel: string }> = {
  client:        { icon: 'CLT', color: NODE_COLOR, sublabel: 'browser / user' },
  api_server:    { icon: 'API', color: NODE_COLOR, sublabel: 'handles requests' },
  database:      { icon: 'DB',  color: NODE_COLOR, sublabel: 'stores data' },
  load_balancer: { icon: 'LB',  color: NODE_COLOR, sublabel: 'distributes traffic' },
  cache:         { icon: 'RED', color: NODE_COLOR, sublabel: 'in-memory data' },
  read_replica:  { icon: 'REP', color: NODE_COLOR, sublabel: 'read-only db' },
  cdn:           { icon: 'CDN', color: NODE_COLOR, sublabel: 'edge caching' },
  rate_limiter:  { icon: 'RAT', color: NODE_COLOR, sublabel: 'throttles requests' },
  monitoring:    { icon: 'MON', color: NODE_COLOR, sublabel: 'observability' },
  server:        { icon: 'SRV', color: NODE_COLOR, sublabel: 'compute node' },
  worker:        { icon: 'WRK', color: NODE_COLOR, sublabel: 'background job' },
  container:     { icon: 'CTR', color: NODE_COLOR, sublabel: 'docker container' },
  function:      { icon: 'FN',  color: NODE_COLOR, sublabel: 'serverless fn' },
  blob_storage:  { icon: 'S3',  color: NODE_COLOR, sublabel: 'object store' },
  message_queue: { icon: 'MQ',  color: NODE_COLOR, sublabel: 'async queue' },
  api_gateway:   { icon: 'GW',  color: NODE_COLOR, sublabel: 'gateway / proxy' },
  search:        { icon: 'ES',  color: NODE_COLOR, sublabel: 'search index' },
  stream:        { icon: 'KFK', color: NODE_COLOR, sublabel: 'event stream' },
}
