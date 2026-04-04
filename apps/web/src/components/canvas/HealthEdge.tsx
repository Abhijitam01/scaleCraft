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
  data,
}: EdgeProps) {
  const health = useStore(s => s.nodeHealth[source] ?? 'idle')
  const color = HEALTH_COLORS[health]

  const [edgePath, labelX, labelY] = getBezierPath({
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

  const label = data?.label as string | undefined

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
      {/* Protocol label at midpoint */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-18}
            y={-8}
            width={36}
            height={14}
            rx={3}
            fill="#0a0a0a"
            stroke={color}
            strokeOpacity={0.25}
            strokeWidth={1}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="#555"
            fontSize={7}
            letterSpacing={0.8}
            fontFamily="monospace"
            style={{ textTransform: 'uppercase', pointerEvents: 'none', userSelect: 'none' }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  )
}
