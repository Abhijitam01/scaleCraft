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
import { lesson, simulationStates } from '@/lib/content'
import type { LessonStep, TrafficLevel } from '@/lib/validateContent'

// Find simulation state matching current architecture
function findSimulationState(
  nodes: Node[],
  trafficLevel: TrafficLevel,
  readRatio: 0.9 | 0.99
) {
  const hasCache = nodes.some((n) => n.data.nodeId === 'cache')
  const hasReadReplica = nodes.some((n) => n.data.nodeId === 'read_replica')
  // We'll consider pooling "enabled" implicitly if API server isn't dying, or if a specific node is added. 
  // Let's check lesson. The lesson has no 'pgbouncer' node type, but step 2's simulation logic in the prompt's `simulationStates` mentions pooling. Wait, `caching`, `read_replicas`, and `connection_pooling` are the booleans. Let's see if there's a connection_pooling type in lesson. Step 7 is rate_limiter. 
  // Actually, connection pooling might be implicit or maybe not every step maps 1:1 to a boolean. Let's look at `simulationStates`.
  // The simulation is an abstraction. The user dragged "Load Balancer" (Step 3). Maybe we assume pooling = true once LB is added? 
  // Wait, let's keep it simple: connection_pooling is true if nodes include API Server? No, the simulation states distinguish it. For now, let's just match what we have.
  // We'll update this matching logic thoroughly based on the lesson steps.
}

interface ScaleCraftState {
  currentStepIndex: number
  nodes: Node[]
  edges: Edge[]
  trafficLevel: TrafficLevel
  readRatio: 0.9 | 0.99
  isDraggingOver: boolean
  justPlaced: boolean
  
  // Actions
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void
  
  completeStep: () => void
  setIsDraggingOver: (isOver: boolean) => void
  setJustPlaced: (justPlaced: boolean) => void
  setTrafficLevel: (level: TrafficLevel) => void
  setReadRatio: (ratio: 0.9 | 0.99) => void
  reset: () => void
}

const INITIAL_NODES: Node[] = [
  {
    id: 'client',
    type: 'component',
    position: { x: 100, y: 300 },
    data: { label: 'Client', nodeId: 'client' },
    draggable: false,
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
    set({
      edges: addEdge(
        {
          ...connection,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          animated: true,
        },
        get().edges
      ),
    })
  },

  setNodes: (updater) => {
    set({
      nodes: typeof updater === 'function' ? updater(get().nodes) : updater,
    })
  },
  
  setEdges: (updater) => {
    set({
      edges: typeof updater === 'function' ? updater(get().edges) : updater,
    })
  },

  completeStep: () => {
    set((state) => ({ currentStepIndex: state.currentStepIndex + 1 }))
  },

  setIsDraggingOver: (isDraggingOver) => set({ isDraggingOver }),
  
  setJustPlaced: (justPlaced) => set({ justPlaced }),

  setTrafficLevel: (trafficLevel) => set({ trafficLevel }),
  
  setReadRatio: (readRatio) => set({ readRatio }),

  reset: () => {
    set({
      currentStepIndex: 0,
      nodes: INITIAL_NODES,
      edges: [],
      trafficLevel: 'low',
      readRatio: 0.9,
      isDraggingOver: false,
      justPlaced: false
    })
  }
}))
