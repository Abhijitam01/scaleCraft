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
import { C } from '@/lib/tokens'
import { lesson } from '@/lib/content'
import { ComponentNode } from '@/components/canvas/ComponentNode'
import { motion, AnimatePresence } from 'framer-motion'

const NODE_TYPES = { component: ComponentNode }

function CanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    currentStepIndex,
    completeStep,
    isDraggingOver,
    setIsDraggingOver,
    justPlaced,
    setJustPlaced,
    setNodes
  } = useStore()
  
  const { screenToFlowPosition } = useReactFlow()
  const flashTimer = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => () => { clearTimeout(flashTimer.current) }, [])

  const isValidConnection = useCallback<IsValidConnection>(
    (connection) => {
      const step = lesson.steps[currentStepIndex]
      if (!step) return false
      return (
        connection.source === step.allowedEdge.source &&
        connection.target === step.allowedEdge.target
      )
    },
    [currentStepIndex]
  )

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDraggingOver(false)

      const nodeType = event.dataTransfer.getData('nodeType')
      if (!nodeType) return

      const step = lesson.steps[currentStepIndex]
      if (!step || nodeType !== step.allowedNodeType) return

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })

      const newNode: Node = {
        id: nodeType,
        type: 'component',
        position,
        data: { label: nodeType.replace('_', ' '), nodeId: nodeType },
        draggable: false,
      }

      setNodes((prev) => [...prev, newNode])
      setJustPlaced(true)
      flashTimer.current = setTimeout(() => setJustPlaced(false), 700)
      completeStep()
    },
    [currentStepIndex, screenToFlowPosition, setNodes, setIsDraggingOver, completeStep, setJustPlaced]
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
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: C.accent.primary, strokeWidth: 2 },
          animated: true,
        }}
        className="bg-[#0a0a0a]"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#222" />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>

      {/* Drop Zone Overlay */}
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

      {/* Helper text if canvas is waiting for first step */}
      {nodes.length === 1 && !isDraggingOver && currentStepIndex === 0 && (
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

export function GuidedCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
      {/* Custom styles override for React Flow chrome */}
      <style>{`
        .react-flow__node-component {
          background: transparent !important; border: none !important; padding: 0 !important; border-radius: 0 !important; box-shadow: none !important;
        }
        .react-flow__edge-path { stroke: ${C.accent.primary} !important; stroke-width: 2 !important; }
        .react-flow__edge.selected .react-flow__edge-path { stroke: ${C.accent.hover} !important; stroke-width: 2.5 !important; }
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
