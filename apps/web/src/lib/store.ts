import { create } from 'zustand'
import {
  type Node,
  type Edge,
  type Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import { lesson, simulationStates, ecSimStates, chatSimStates } from '@/lib/content'
import type { TrafficLevel } from '@/lib/validateContent'
import { computeNodeHealth, type HealthState, type HealthInputState } from '@/lib/computeNodeHealth'
import { type FailureScenario } from '@/lib/FailureCascade'
import { urlShortenerTemplate } from '@/data/templates/url-shortener'
import { ecommerceTemplate } from '@/data/templates/ecommerce'
import { chatTemplate } from '@/data/templates/chat'

export type TemplateId = 'url-shortener' | 'ecommerce' | 'chat'

const TEMPLATE_DATA: Record<TemplateId, { nodes: Node[]; edges: Edge[] }> = {
  'url-shortener': urlShortenerTemplate,
  ecommerce: ecommerceTemplate,
  chat: chatTemplate,
}

interface ScaleCraftState {
  currentStepIndex: number
  nodes: Node[]
  edges: Edge[]
  trafficLevel: TrafficLevel
  readRatio: 0.9 | 0.99
  isDraggingOver: boolean
  justPlaced: boolean
  nodeJustPlaced: boolean
  nodeHealth: Record<string, HealthState>
  activeScenario: FailureScenario | null
  templateId: TemplateId

  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void

  markNodePlaced: () => void
  setIsDraggingOver: (isOver: boolean) => void
  setJustPlaced: (justPlaced: boolean) => void
  setTrafficLevel: (level: TrafficLevel) => void
  setReadRatio: (ratio: 0.9 | 0.99) => void
  injectScenario: (scenario: FailureScenario) => void
  clearScenario: () => void
  loadTemplate: (id: TemplateId, nodes?: Node[], edges?: Edge[]) => void
  clearCanvas: () => void
  reset: () => void
}

function deriveHealth(nodes: Node[], trafficLevel: TrafficLevel, readRatio: 0.9 | 0.99, templateId: TemplateId): Record<string, HealthState> {
  const caching = nodes.some(n => n.data.nodeId === 'cache')
  const connection_pooling = nodes.some(n => n.data.nodeId === 'load_balancer')
  const read_replicas = nodes.some(n => n.data.nodeId === 'read_replica')
  const cdn = nodes.some(n => n.data.nodeId === 'cdn')
  const rate_limiter = nodes.some(n => n.data.nodeId === 'rate_limiter')

  let healthInput: HealthInputState

  if (templateId === 'ecommerce') {
    const state = ecSimStates.find(
      s => s.caching === caching && s.cdn === cdn && s.traffic_level === trafficLevel
    ) ?? ecSimStates[0]!
    healthInput = {
      error_rate_pct: state.error_rate_pct,
      p99_latency_ms: state.p99_latency_ms,
      caching: state.caching,
      cache_hit_rate_pct: state.cache_hit_rate_pct,
      connection_pooling,
      read_replicas,
    }
  } else if (templateId === 'chat') {
    const state = chatSimStates.find(
      s => s.caching === caching && s.rate_limiter === rate_limiter && s.traffic_level === trafficLevel
    ) ?? chatSimStates[0]!
    healthInput = {
      error_rate_pct: state.error_rate_pct,
      p99_latency_ms: state.p99_latency_ms,
      caching: state.caching,
      cache_hit_rate_pct: state.cache_hit_rate_pct,
      connection_pooling,
      read_replicas,
    }
  } else {
    const state = simulationStates.find(
      s => s.caching === caching && s.read_replicas === read_replicas &&
           s.connection_pooling === connection_pooling && s.traffic_level === trafficLevel &&
           s.read_ratio === readRatio
    ) ?? simulationStates[0]!
    healthInput = {
      error_rate_pct: state.error_rate_pct,
      p99_latency_ms: state.p99_latency_ms,
      caching: state.caching,
      cache_hit_rate_pct: state.cache_hit_rate_pct,
      connection_pooling: state.connection_pooling,
      read_replicas: state.read_replicas,
    }
  }

  return computeNodeHealth(nodes.map(n => n.id), healthInput)
}

const INITIAL_NODES: Node[] = [
  {
    id: 'client',
    type: 'component',
    position: { x: 100, y: 300 },
    data: { label: 'Client', nodeId: 'client' },
  },
]

export const useStore = create<ScaleCraftState>((set, get) => ({
  currentStepIndex: 0,
  nodes: INITIAL_NODES,
  edges: [],
  trafficLevel: 'low',
  readRatio: 0.9,
  isDraggingOver: false,
  justPlaced: false,
  nodeJustPlaced: false,
  nodeHealth: deriveHealth(INITIAL_NODES, 'low', 0.9, 'url-shortener'),
  activeScenario: null,
  templateId: 'url-shortener' as TemplateId,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection) => {
    const { currentStepIndex, nodeJustPlaced, edges, nodes, trafficLevel, readRatio, templateId } = get()
    const step = lesson.steps[currentStepIndex]
    const isStepEdge =
      step !== undefined &&
      connection.source === step.allowedEdge.source &&
      connection.target === step.allowedEdge.target &&
      nodeJustPlaced
    const nextNodes = nodes
    set({
      edges: addEdge(
        { ...connection, style: { stroke: '#6366f1', strokeWidth: 2 }, animated: true },
        edges
      ),
      nodeHealth: deriveHealth(nextNodes, trafficLevel, readRatio, templateId),
      ...(isStepEdge ? { nodeJustPlaced: false, currentStepIndex: currentStepIndex + 1 } : {}),
    })
  },

  setNodes: (updater) => {
    const { trafficLevel, readRatio, nodes, templateId } = get()
    const nextNodes = typeof updater === 'function' ? updater(nodes) : updater
    set({
      nodes: nextNodes,
      nodeHealth: deriveHealth(nextNodes, trafficLevel, readRatio, templateId),
    })
  },

  setEdges: (updater) => {
    set({
      edges: typeof updater === 'function' ? updater(get().edges) : updater,
    })
  },

  markNodePlaced: () => set({ nodeJustPlaced: true }),

  setIsDraggingOver: (isDraggingOver) => set({ isDraggingOver }),

  setJustPlaced: (justPlaced) => set({ justPlaced }),

  setTrafficLevel: (trafficLevel) => {
    const { nodes, readRatio, templateId } = get()
    set({ trafficLevel, nodeHealth: deriveHealth(nodes, trafficLevel, readRatio, templateId) })
  },

  setReadRatio: (readRatio) => {
    const { nodes, trafficLevel, templateId } = get()
    set({ readRatio, nodeHealth: deriveHealth(nodes, trafficLevel, readRatio, templateId) })
  },

  injectScenario: (scenario) => set({ activeScenario: scenario }),

  clearScenario: () => set({ activeScenario: null }),

  loadTemplate: (id, nodes, edges) => {
    const { trafficLevel, readRatio } = get()
    const tpl = TEMPLATE_DATA[id]
    const resolvedNodes = nodes ?? tpl.nodes
    const resolvedEdges = edges ?? tpl.edges
    set({
      templateId: id,
      nodes: resolvedNodes,
      edges: resolvedEdges,
      currentStepIndex: lesson.steps.length,
      nodeJustPlaced: false,
      activeScenario: null,
      nodeHealth: deriveHealth(resolvedNodes, trafficLevel, readRatio, id),
    })
  },

  clearCanvas: () => {
    set({
      nodes: INITIAL_NODES,
      edges: [],
      currentStepIndex: lesson.steps.length,
      nodeJustPlaced: false,
      activeScenario: null,
      templateId: 'url-shortener',
      nodeHealth: deriveHealth(INITIAL_NODES, get().trafficLevel, get().readRatio, 'url-shortener'),
    })
  },

  reset: () => {
    set({
      currentStepIndex: 0,
      nodes: INITIAL_NODES,
      edges: [],
      trafficLevel: 'low',
      readRatio: 0.9,
      isDraggingOver: false,
      justPlaced: false,
      nodeJustPlaced: false,
      nodeHealth: deriveHealth(INITIAL_NODES, 'low', 0.9, 'url-shortener'),
      activeScenario: null,
      templateId: 'url-shortener',
    })
  }
}))
