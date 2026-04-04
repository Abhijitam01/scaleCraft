import { z } from 'zod'
import type { HealthResult } from '@repo/simulation-engine'
import type { Node, Edge } from '@xyflow/react'

// ─── Rule schemas (Zod) ───────────────────────────────────────────────────────

export const ValidationRuleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('requires-component'), nodeId: z.string() }),
  z.object({ type: z.literal('forbids-spof') }),
  z.object({ type: z.literal('requires-pattern'), pattern: z.string() }),
  z.object({ type: z.literal('latency-budget'), maxMs: z.number().positive() }),
  z.object({ type: z.literal('error-budget'), maxRate: z.number().min(0).max(1) }),
  z.object({ type: z.literal('requires-edge-type'), from: z.string(), to: z.string() }),
  z.object({ type: z.literal('forbids-direct-connection'), from: z.string(), to: z.string() }),
])

export type ValidationRule = z.infer<typeof ValidationRuleSchema>

// ─── Result ───────────────────────────────────────────────────────────────────

export interface StepValidationResult {
  passed: boolean
  violations: string[]
}

// ─── Pure validator ───────────────────────────────────────────────────────────

export function validateStep(
  rules: ValidationRule[],
  nodes: Node[],
  edges: Edge[],
  health: HealthResult,
): StepValidationResult {
  if (rules.length === 0) return { passed: true, violations: [] }

  const violations: string[] = []
  const nodeIds = new Set(nodes.map(n => n.data.nodeId as string))

  for (const rule of rules) {
    switch (rule.type) {
      case 'requires-component': {
        if (!nodeIds.has(rule.nodeId)) {
          violations.push(`Missing required component: ${rule.nodeId.replace(/_/g, ' ')}`)
        }
        break
      }

      case 'forbids-spof': {
        if (health.detectedPatterns.includes('single-point-of-failure')) {
          violations.push('Architecture has a single point of failure — add redundancy')
        }
        break
      }

      case 'requires-pattern': {
        if (!health.detectedPatterns.includes(rule.pattern as never)) {
          violations.push(`Required pattern not detected: ${rule.pattern.replace(/-/g, ' ')}`)
        }
        break
      }

      case 'latency-budget': {
        if (health.p99LatencyMs > rule.maxMs) {
          violations.push(
            `p99 latency ${health.p99LatencyMs}ms exceeds budget of ${rule.maxMs}ms`,
          )
        }
        break
      }

      case 'error-budget': {
        if (health.errorRate > rule.maxRate) {
          violations.push(
            `Error rate ${(health.errorRate * 100).toFixed(1)}% exceeds budget of ${(rule.maxRate * 100).toFixed(1)}%`,
          )
        }
        break
      }

      case 'requires-edge-type': {
        const hasEdge = edges.some(
          e =>
            (e.source === rule.from && e.target === rule.to) ||
            (nodes.find(n => n.id === e.source)?.data.nodeId === rule.from &&
              nodes.find(n => n.id === e.target)?.data.nodeId === rule.to),
        )
        if (!hasEdge) {
          violations.push(
            `Required connection missing: ${rule.from.replace(/_/g, ' ')} → ${rule.to.replace(/_/g, ' ')}`,
          )
        }
        break
      }

      case 'forbids-direct-connection': {
        const hasDirectEdge = edges.some(
          e =>
            (e.source === rule.from && e.target === rule.to) ||
            (nodes.find(n => n.id === e.source)?.data.nodeId === rule.from &&
              nodes.find(n => n.id === e.target)?.data.nodeId === rule.to),
        )
        if (hasDirectEdge) {
          violations.push(
            `Direct connection forbidden: ${rule.from.replace(/_/g, ' ')} → ${rule.to.replace(/_/g, ' ')}`,
          )
        }
        break
      }
    }
  }

  return { passed: violations.length === 0, violations }
}
