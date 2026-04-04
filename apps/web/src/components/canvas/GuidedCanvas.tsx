'use client'

import { useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Connection,
  type IsValidConnection,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useStore } from '@/lib/store'
import { C, NODE_META } from '@/lib/tokens'
import { ComponentNode } from '@/components/canvas/ComponentNode'
import { HealthEdge } from '@/components/canvas/HealthEdge'
import { motion, AnimatePresence } from 'framer-motion'

const NODE_TYPES = { component: ComponentNode }
const EDGE_TYPES = { health: HealthEdge }

function CanvasInner({ freeDraw = false }: { freeDraw?: boolean }) {
  const nodes = useStore(s => s.nodes)
  const edges = useStore(s => s.edges)
  const onNodesChange = useStore(s => s.onNodesChange)
  const onEdgesChange = useStore(s => s.onEdgesChange)
  const onConnect = useStore(s => s.onConnect)
  const currentStepIndex = useStore(s => s.currentStepIndex)
  const markNodePlaced = useStore(s => s.markNodePlaced)
  const isDraggingOver = useStore(s => s.isDraggingOver)
  const setIsDraggingOver = useStore(s => s.setIsDraggingOver)
  const justPlaced = useStore(s => s.justPlaced)
  const setJustPlaced = useStore(s => s.setJustPlaced)
  const setNodes = useStore(s => s.setNodes)
  const activeLesson = useStore(s => s.activeLesson)
  
  const { screenToFlowPosition } = useReactFlow()
  const flashTimer = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => () => { clearTimeout(flashTimer.current) }, [])

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      if (freeDraw) return true
      const step = activeLesson?.steps[currentStepIndex]
      if (!step) return true
      return (
        connection.source === step.allowedEdge.source &&
        connection.target === step.allowedEdge.target
      )
    },
    [freeDraw, currentStepIndex, activeLesson]
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDraggingOver(false)

      const nodeType = event.dataTransfer.getData('nodeType')
      if (!nodeType || !NODE_META[nodeType]) return
      if (nodes.some((n) => n.id === nodeType)) return

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      const newNode: Node = {
        id: nodeType,
        type: 'component',
        position,
        data: { label: nodeType.replace(/_/g, ' '), nodeId: nodeType },
      }

      setNodes((prev) => [...prev, newNode])
      setJustPlaced(true)
      flashTimer.current = setTimeout(() => setJustPlaced(false), 700)

      const step = activeLesson?.steps[currentStepIndex]
      if (step && nodeType === step.allowedNodeType) {
        markNodePlaced()
      }
    },
    [currentStepIndex, activeLesson, nodes, screenToFlowPosition, setNodes, setIsDraggingOver, markNodePlaced, setJustPlaced]
  )

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDraggingOver(true)
  }, [setIsDraggingOver])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) {
      setIsDraggingOver(false)
    }
  }, [setIsDraggingOver])

  return (
    <div
      className="flex-1 h-full relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      style={{
        background: justPlaced ? C.semantic.successBg : 'transparent',
        transition: 'background 0.5s',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'health',
        }}
        className="bg-[#0a0a0a]"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#222" />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>

      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            style={{
              border: `2px dashed ${C.accent.primary}`,
              background: C.accent.soft,
            }}
          >
            <div
              className="bg-[#1e1e2e] rounded-[12px] px-[22px] py-[10px] text-[12px] uppercase tracking-widest font-mono font-bold"
              style={{
                border: `1px solid ${C.accent.primary}55`,
                color: C.accent.hover,
                boxShadow: `0 0 20px ${C.accent.glow}`,
              }}
            >
              Drop to place
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!freeDraw && nodes.length === 1 && !isDraggingOver && currentStepIndex === 0 && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-widest text-[#555] pointer-events-none uppercase"
        >
          Drag a component from the sidebar
        </motion.div>
      )}
    </div>
  )
}

export function GuidedCanvas({ freeDraw = false }: { freeDraw?: boolean }) {
  return (
    <ReactFlowProvider>
      <CanvasInner freeDraw={freeDraw} />
      <style>{`
        .react-flow__node-component {
          background: transparent !important; border: none !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important;
        }
        .react-flow__connection-path { stroke: ${C.accent.hover} !important; stroke-width: 2 !important; stroke-dasharray: 6 4; }
        .react-flow__handle { transition: transform 0.15s, background 0.15s !important; }
        .react-flow__handle:hover { transform: scale(1.4) !important; }
        .react-flow__controls { background: #1a1a1a !important; border: 1px solid #2a2a2a !important; border-radius: 10px !important; box-shadow: none !important; }
        .react-flow__controls-button { background: #1a1a1a !important; border-bottom: 1px solid #222 !important; fill: #666 !important; }
        .react-flow__controls-button:hover { background: #222 !important; fill: #ccc !important; }
        .react-flow__controls-button:last-child { border-bottom: none !important; }
        .react-flow__background pattern circle { fill: #2a2a2a !important; }
      `}</style>
    </ReactFlowProvider>
  )
}
