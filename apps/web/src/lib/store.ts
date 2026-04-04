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
import { getLessonContent } from '@/lib/content'
import type { TrafficLevel, Lesson } from '@/lib/validateContent'
import { type HealthState } from '@/lib/computeNodeHealth'
import { type FailureScenario } from '@/lib/FailureCascade'
import {
  deriveHealth as simDeriveHealth,
  type TrafficLevel as SimTrafficLevel,
  type HealthResult,
} from '@repo/simulation-engine'
import { urlShortenerTemplate } from '@/data/templates/url-shortener'
import { ecommerceTemplate } from '@/data/templates/ecommerce'
import { chatTemplate } from '@/data/templates/chat'
import { getEdgeLabel } from '@/lib/edgeLabels'
import { validateStep } from '@/lib/validateLesson'

export type TemplateId = 'url-shortener' | 'ecommerce' | 'chat'

const TEMPLATE_DATA: Record<TemplateId, { nodes: Node[]; edges: Edge[] }> = {
  'url-shortener': urlShortenerTemplate,
  ecommerce: ecommerceTemplate,
  chat: chatTemplate,
}

const TEMPLATE_MAP: Record<string, TemplateId> = {
  'url-shortener': 'url-shortener',
  'ecommerce-platform': 'ecommerce',
  'real-time-chat': 'chat',
}

interface CanvasSlice {
  nodes: Node[]
  edges: Edge[]
  currentStepIndex: number
  trafficLevel: TrafficLevel
  readRatio: 0.9 | 0.99
  activeScenario: FailureScenario | null
  templateId: TemplateId
}

interface ScaleCraftState {
  currentStepIndex: number
  activeLesson: Lesson | null
  activeLessonId: string | null
  canvasStates: Map<string, CanvasSlice>
  nodes: Node[]
  edges: Edge[]
  trafficLevel: TrafficLevel
  readRatio: 0.9 | 0.99
  isDraggingOver: boolean
  justPlaced: boolean
  nodeJustPlaced: boolean
  nodeHealth: Record<string, HealthState>
  healthResult: HealthResult
  activeScenario: FailureScenario | null
  templateId: TemplateId
  selectedNodeId: string | null
  lastConnectionResult: 'pass' | 'fail' | null
  hintsShown: Set<string>

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
  setSelectedNodeId: (id: string | null) => void
  setLastConnectionResult: (result: 'pass' | 'fail' | null) => void
  showHint: (stepId: string) => void
  loadTemplate: (id: TemplateId, nodes?: Node[], edges?: Edge[]) => void
  setLesson: (id: string) => void
  clearCanvas: () => void
  reset: () => void
}

const TRAFFIC_MAP: Record<TrafficLevel, SimTrafficLevel> = {
  idle: 'idle',
  low: 'low',
  med: 'moderate',
  high: 'high',
  spike: 'peak',
}

function computeHealth(
  nodes: Node[],
  edges: Edge[],
  trafficLevel: TrafficLevel,
  readRatio: 0.9 | 0.99,
  activeScenario: FailureScenario | null,
): HealthResult {
  const simNodes = nodes.map(n => ({ id: n.id, nodeId: n.data.nodeId as string }))
  const simEdges = edges.map(e => ({ source: e.source, target: e.target }))
  return simDeriveHealth(simNodes, simEdges, {
    trafficLevel: TRAFFIC_MAP[trafficLevel],
    readRatio,
    activeFailure: activeScenario,
  })
}

function snapshotCanvas(state: ScaleCraftState): CanvasSlice {
  return {
    nodes: state.nodes,
    edges: state.edges,
    currentStepIndex: state.currentStepIndex,
    trafficLevel: state.trafficLevel,
    readRatio: state.readRatio,
    activeScenario: state.activeScenario,
    templateId: state.templateId,
  }
}

const INITIAL_NODES: Node[] = [
  {
    id: 'client',
    type: 'component',
    position: { x: 100, y: 300 },
    data: { label: 'Client', nodeId: 'client' },
  },
]

const initialHealth = computeHealth(INITIAL_NODES, [], 'low', 0.9, null)

export const useStore = create<ScaleCraftState>((set, get) => ({
  currentStepIndex: 0,
  activeLesson: null,
  activeLessonId: null,
  canvasStates: new Map(),
  nodes: INITIAL_NODES,
  edges: [],
  trafficLevel: 'low',
  readRatio: 0.9,
  isDraggingOver: false,
  justPlaced: false,
  nodeJustPlaced: false,
  nodeHealth: initialHealth.nodeHealth as Record<string, HealthState>,
  healthResult: initialHealth,
  activeScenario: null,
  templateId: 'url-shortener' as TemplateId,
  selectedNodeId: null,
  lastConnectionResult: null,
  hintsShown: new Set<string>(),

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
    const { currentStepIndex, nodeJustPlaced, edges, nodes, trafficLevel, readRatio, activeScenario, templateId, activeLesson } = get()
    const step = activeLesson?.steps[currentStepIndex]
    const isStepEdge =
      step !== undefined &&
      connection.source === step.allowedEdge.source &&
      connection.target === step.allowedEdge.target &&
      nodeJustPlaced

    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)
    const label = getEdgeLabel(
      (sourceNode?.data.nodeId as string) ?? '',
      (targetNode?.data.nodeId as string) ?? ''
    )

    const newEdges = addEdge(
      {
        ...connection,
        type: 'health',
        style: { stroke: '#10b981', strokeWidth: 2 },
        animated: true,
        data: { label },
      },
      edges
    )
    const result = computeHealth(nodes, newEdges, trafficLevel, readRatio, activeScenario)

    if (isStepEdge) {
      const rules = step.validationRules ?? []
      const validation = validateStep(rules, nodes, newEdges, result)
      if (validation.passed) {
        set({
          edges: newEdges,
          nodeHealth: result.nodeHealth as Record<string, HealthState>,
          healthResult: result,
          nodeJustPlaced: false,
          currentStepIndex: currentStepIndex + 1,
          lastConnectionResult: 'pass',
        })
      } else {
        set({
          edges: newEdges,
          nodeHealth: result.nodeHealth as Record<string, HealthState>,
          healthResult: result,
          lastConnectionResult: 'fail',
        })
      }
    } else {
      set({
        edges: newEdges,
        nodeHealth: result.nodeHealth as Record<string, HealthState>,
        healthResult: result,
      })
    }
  },

  setNodes: (updater) => {
    const { trafficLevel, readRatio, activeScenario, nodes, edges } = get()
    const nextNodes = typeof updater === 'function' ? updater(nodes) : updater
    const result = computeHealth(nextNodes, edges, trafficLevel, readRatio, activeScenario)
    set({
      nodes: nextNodes,
      nodeHealth: result.nodeHealth as Record<string, HealthState>,
      healthResult: result,
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
    const { nodes, edges, readRatio, activeScenario } = get()
    const result = computeHealth(nodes, edges, trafficLevel, readRatio, activeScenario)
    set({ trafficLevel, nodeHealth: result.nodeHealth as Record<string, HealthState>, healthResult: result })
  },

  setReadRatio: (readRatio) => {
    const { nodes, edges, trafficLevel, activeScenario } = get()
    const result = computeHealth(nodes, edges, trafficLevel, readRatio, activeScenario)
    set({ readRatio, nodeHealth: result.nodeHealth as Record<string, HealthState>, healthResult: result })
  },

  injectScenario: (scenario) => {
    const { nodes, edges, trafficLevel, readRatio } = get()
    const result = computeHealth(nodes, edges, trafficLevel, readRatio, scenario)
    set({ activeScenario: scenario, nodeHealth: result.nodeHealth as Record<string, HealthState>, healthResult: result })
  },

  clearScenario: () => {
    const { nodes, edges, trafficLevel, readRatio } = get()
    const result = computeHealth(nodes, edges, trafficLevel, readRatio, null)
    set({ activeScenario: null, nodeHealth: result.nodeHealth as Record<string, HealthState>, healthResult: result })
  },

  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  setLastConnectionResult: (lastConnectionResult) => set({ lastConnectionResult }),

  showHint: (stepId) => set(s => ({ hintsShown: new Set([...s.hintsShown, stepId]) })),

  loadTemplate: (id, nodes, edges) => {
    const { trafficLevel, readRatio, activeLesson } = get()
    const tpl = TEMPLATE_DATA[id]
    const resolvedNodes = nodes ?? tpl.nodes
    const resolvedEdges = edges ?? tpl.edges
    const result = computeHealth(resolvedNodes, resolvedEdges, trafficLevel, readRatio, null)
    set({
      templateId: id,
      nodes: resolvedNodes,
      edges: resolvedEdges,
      currentStepIndex: activeLesson?.steps.length ?? 0,
      nodeJustPlaced: false,
      activeScenario: null,
      nodeHealth: result.nodeHealth as Record<string, HealthState>,
      healthResult: result,
    })
  },

  setLesson: (id) => {
    const state = get()

    // Save current canvas state before switching
    const savedKey = state.activeLessonId ?? '__free__'
    const nextCanvasStates = new Map(state.canvasStates)
    nextCanvasStates.set(savedKey, snapshotCanvas(state))

    const activeLesson = getLessonContent(id)

    // Restore or initialize fresh canvas for this lesson
    const saved = nextCanvasStates.get(id)
    if (saved) {
      const result = computeHealth(saved.nodes, saved.edges, saved.trafficLevel, saved.readRatio, saved.activeScenario)
      set({
        activeLesson,
        activeLessonId: id,
        canvasStates: nextCanvasStates,
        nodes: saved.nodes,
        edges: saved.edges,
        currentStepIndex: saved.currentStepIndex,
        trafficLevel: saved.trafficLevel,
        readRatio: saved.readRatio,
        activeScenario: saved.activeScenario,
        templateId: saved.templateId,
        nodeJustPlaced: false,
        nodeHealth: result.nodeHealth as Record<string, HealthState>,
        healthResult: result,
      })
    } else {
      // Fresh start for this lesson
      const tplId = TEMPLATE_MAP[id]
      if (tplId) {
        const tpl = TEMPLATE_DATA[tplId]
        const result = computeHealth(tpl.nodes, tpl.edges, 'low', 0.9, null)
        set({
          activeLesson,
          activeLessonId: id,
          canvasStates: nextCanvasStates,
          templateId: tplId,
          nodes: tpl.nodes,
          edges: tpl.edges,
          currentStepIndex: 0,
          trafficLevel: 'low',
          readRatio: 0.9,
          activeScenario: null,
          nodeJustPlaced: false,
          nodeHealth: result.nodeHealth as Record<string, HealthState>,
          healthResult: result,
        })
      } else {
        const result = computeHealth(INITIAL_NODES, [], 'low', 0.9, null)
        set({
          activeLesson,
          activeLessonId: id,
          canvasStates: nextCanvasStates,
          nodes: INITIAL_NODES,
          edges: [],
          currentStepIndex: 0,
          trafficLevel: 'low',
          readRatio: 0.9,
          activeScenario: null,
          nodeJustPlaced: false,
          templateId: 'url-shortener',
          nodeHealth: result.nodeHealth as Record<string, HealthState>,
          healthResult: result,
        })
      }
    }
  },

  clearCanvas: () => {
    const state = get()

    // Save current canvas state before clearing
    const savedKey = state.activeLessonId ?? '__free__'
    const nextCanvasStates = new Map(state.canvasStates)
    nextCanvasStates.set(savedKey, snapshotCanvas(state))

    // Restore free canvas or start fresh
    const saved = nextCanvasStates.get('__free__')
    if (saved && state.activeLessonId !== null) {
      const result = computeHealth(saved.nodes, saved.edges, saved.trafficLevel, saved.readRatio, saved.activeScenario)
      set({
        activeLesson: null,
        activeLessonId: null,
        canvasStates: nextCanvasStates,
        nodes: saved.nodes,
        edges: saved.edges,
        currentStepIndex: saved.currentStepIndex,
        trafficLevel: saved.trafficLevel,
        readRatio: saved.readRatio,
        activeScenario: saved.activeScenario,
        templateId: saved.templateId,
        nodeJustPlaced: false,
        nodeHealth: result.nodeHealth as Record<string, HealthState>,
        healthResult: result,
      })
    } else {
      const { trafficLevel, readRatio } = get()
      const result = computeHealth(INITIAL_NODES, [], trafficLevel, readRatio, null)
      set({
        nodes: INITIAL_NODES,
        edges: [],
        currentStepIndex: 0,
        activeLesson: null,
        activeLessonId: null,
        canvasStates: nextCanvasStates,
        nodeJustPlaced: false,
        activeScenario: null,
        templateId: 'url-shortener',
        nodeHealth: result.nodeHealth as Record<string, HealthState>,
        healthResult: result,
      })
    }
  },

  reset: () => {
    const result = computeHealth(INITIAL_NODES, [], 'low', 0.9, null)
    set({
      currentStepIndex: 0,
      activeLesson: null,
      activeLessonId: null,
      canvasStates: new Map(),
      nodes: INITIAL_NODES,
      edges: [],
      trafficLevel: 'low',
      readRatio: 0.9,
      isDraggingOver: false,
      justPlaced: false,
      nodeJustPlaced: false,
      nodeHealth: result.nodeHealth as Record<string, HealthState>,
      healthResult: result,
      activeScenario: null,
      templateId: 'url-shortener',
      selectedNodeId: null,
    })
  }
}))
