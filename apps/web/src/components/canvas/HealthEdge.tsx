'use client'

import { getBezierPath, type EdgeProps } from '@xyflow/react'
import { useStore } from '@/lib/store'
import { HEALTH_COLORS } from '@/lib/computeNodeHealth'

export function HealthEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const health = useStore(s => s.nodeHealth[source] ?? 'idle')
  const color = HEALTH_COLORS[health]

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Animate faster for degraded/overloaded/failed states — urgency matters
  const animDuration = health === 'failed' ? '0.6s'
    : health === 'overloaded' ? '0.9s'
    : health === 'degraded' ? '1.2s'
    : '1.8s'

  return (
    <>
      {/* Glow layer — same path, wider, more transparent */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.08}
        strokeLinecap="round"
      />
      {/* Animated dashed foreground */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="6 4"
        style={{
          animation: `health-edge-flow ${animDuration} linear infinite`,
        }}
      />
    </>
  )
}
