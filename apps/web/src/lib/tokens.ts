export const C = {
  bg:       { app: '#0a0a0a', panel: '#111111', topbar: '#141414', node: '#1c1c1c', card: '#1a1a1a', inset: '#161620' },
  border:   { default: '#222222', card: '#2a2a2a', node: '#333333', panel: '#1e1e1e', faint: '#1a1a1a' },
  accent:   { primary: '#6366f1', hover: '#818cf8', soft: 'rgba(99,102,241,0.08)', glow: 'rgba(99,102,241,0.25)' },
  text:     { primary: '#ffffff', body: '#cccccc', secondary: '#888888', muted: '#555555', label: '#444444' },
  semantic: { success: '#4ade80', successBg: 'rgba(74,222,128,0.08)', successBorder: 'rgba(74,222,128,0.25)' },
  purple:   { soft: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
} as const;

export const NODE_META: Record<string, { icon: string; color: string; sublabel: string }> = {
  client:        { icon: 'CLT', color: '#6b7280', sublabel: 'browser / user' },
  api_server:    { icon: 'API', color: '#6366f1', sublabel: 'handles requests' },
  database:      { icon: 'DB',  color: '#8b5cf6', sublabel: 'stores data' },
  load_balancer: { icon: 'LB',  color: '#eab308', sublabel: 'distributes traffic' },
  cache:         { icon: 'RED', color: '#ef4444', sublabel: 'in-memory data' },
  read_replica:  { icon: 'REP', color: '#d946ef', sublabel: 'read-only db' },
  cdn:           { icon: 'CDN', color: '#0ea5e9', sublabel: 'edge caching' },
  rate_limiter:  { icon: 'RAT', color: '#f97316', sublabel: 'throttles requests' },
  monitoring:    { icon: 'MON', color: '#10b981', sublabel: 'observability' },
}
