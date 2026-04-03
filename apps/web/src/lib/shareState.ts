import type { Node, Edge } from '@xyflow/react'
import type { TemplateId } from '@/lib/store'

// Compact serialization to keep URLs short
interface CompactState {
  t: TemplateId
  n: Array<{ i: string; x: number; y: number }>
  e: Array<{ s: string; g: string }>
}

export function encodeState(templateId: TemplateId, nodes: Node[], edges: Edge[]): string {
  const compact: CompactState = {
    t: templateId,
    n: nodes.map(node => ({
      i: node.id,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    })),
    e: edges.map(edge => ({ s: edge.source, g: edge.target })),
  }
  const json = JSON.stringify(compact)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return encodeURIComponent(btoa(binary))
}

export function decodeState(encoded: string): { templateId: TemplateId; nodes: Node[]; edges: Edge[] } | null {
  try {
    const binary = atob(decodeURIComponent(encoded))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    const compact = JSON.parse(json) as CompactState

    if (!compact.t || !Array.isArray(compact.n) || !Array.isArray(compact.e)) return null

    const nodes: Node[] = compact.n.map(n => ({
      id: n.i,
      type: 'component',
      position: { x: n.x, y: n.y },
      data: { label: n.i.replace(/_/g, ' '), nodeId: n.i },
    }))

    const edges: Edge[] = compact.e.map((e, idx) => ({
      id: `shared-edge-${idx}`,
      source: e.s,
      target: e.g,
      type: 'health',
      style: { stroke: '#6366f1', strokeWidth: 2 },
      animated: true,
    }))

    return { templateId: compact.t, nodes, edges }
  } catch {
    return null
  }
}
