'use client'

import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { lesson } from '@/lib/content'
import { C, NODE_META } from '@/lib/tokens'
import { ComponentCard } from '@/components/sidebar/ComponentCard'
import { motion, AnimatePresence } from 'framer-motion'

// Node categories for palette grouping
const PALETTE_CATEGORIES = [
  {
    label: 'Networking',
    nodes: ['load_balancer', 'cdn', 'rate_limiter', 'api_gateway'],
  },
  {
    label: 'Compute',
    nodes: ['api_server', 'server', 'worker', 'function', 'container'],
  },
  {
    label: 'Storage',
    nodes: ['database', 'read_replica', 'cache', 'blob_storage', 'search'],
  },
  {
    label: 'Messaging',
    nodes: ['message_queue', 'stream'],
  },
  {
    label: 'Observability',
    nodes: ['monitoring'],
  },
] as const

// Step progress pills
function StepPills({ currentStep, total }: { currentStep: number; total: number }) {
  return (
    <div className="flex gap-[4px] items-center">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div
            key={i}
            className="h-[5px] rounded-[3px] transition-all duration-300 ease-out"
            style={{
              width: done ? 22 : active ? 10 : 6,
              background: (done || active) ? C.accent.primary : '#2a2a2a',
              opacity: done ? 1 : active ? 1 : 0.5,
              boxShadow: active ? `0 0 6px ${C.accent.glow}` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

function CompletionSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-[18px] px-4 rounded-[12px] border"
      style={{ background: C.semantic.successBg, border: `1px solid ${C.semantic.successBorder}` }}
    >
      <div className="text-[22px] mb-2 text-[#4ade80]">✓</div>
      <div className="text-[#4ade80] text-[14px] font-bold mb-1">
        Architecture Complete
      </div>
      <div className="text-[#4ade80]/70 text-[11px] leading-[1.6]">
        You&apos;ve scaled from 100 RPS to 15,000 RPS. Review your simulation metrics or proceed to the quiz.
      </div>
    </motion.div>
  )
}

export function Sidebar({ className }: { className?: string }) {
  const { currentStepIndex, nodes } = useStore(useShallow((s) => ({ currentStepIndex: s.currentStepIndex, nodes: s.nodes })))
  const isDone = currentStepIndex >= lesson.steps.length
  const step = lesson.steps[currentStepIndex]
  const placedNodeIds = new Set(nodes.map((n) => n.id))

  return (
    <div className={`flex flex-col p-4 gap-4 overflow-y-auto ${className}`}>
      {/* Guided lesson panel (only when in active step mode) */}
      {!isDone && step && (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-[#444] text-[10px] uppercase tracking-widest font-semibold">
              Current Step
            </span>
            <StepPills currentStep={currentStepIndex} total={lesson.steps.length} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 shrink-0"
            >
              {/* Instruction Panel */}
              <div
                className="rounded-[8px] p-3 border"
                style={{ background: C.bg.inset, borderColor: C.border.card }}
              >
                <div
                  className="text-[10px] uppercase tracking-widest mb-1.5 font-semibold"
                  style={{ color: C.accent.hover }}
                >
                  Step {step.stepNumber}
                </div>
                <div className="text-[#ccc] text-[12px] leading-[1.6]">
                  {step.instruction}
                </div>
              </div>

              {/* Edge Hint */}
              <div>
                <div className="text-[10px] text-[#555] uppercase tracking-widest mb-2 font-semibold">
                  Then draw edge
                </div>
                <div
                  className="bg-[#141414] rounded-[7px] p-2 flex items-center gap-2 border font-mono text-[12px]"
                  style={{ borderColor: C.border.card }}
                >
                  <span className="text-[#888]">{step.allowedEdge.source.replace(/_/g, ' ')}</span>
                  <span className="text-[14px]" style={{ color: C.accent.primary }}>→</span>
                  <span className="text-white">{step.allowedEdge.target.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Component Explanation */}
              <div className="pt-3 border-t flex flex-col gap-3" style={{ borderColor: C.border.faint }}>
                <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold">
                  The Why
                </div>
                <p className="text-[#ccc] text-[11px] leading-[1.6]">
                  <strong className="text-white font-semibold block mb-1">What:</strong>
                  {step.explanation.what}
                </p>
                <p className="text-[#ccc] text-[11px] leading-[1.6]">
                  <strong className="text-white font-semibold block mb-1">Why:</strong>
                  {step.explanation.why}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {isDone && <CompletionSidebar />}

      {/* Component Palette — categorized */}
      <div className="flex flex-col gap-4 shrink-0">
        <div
          className="text-[10px] text-[#444] uppercase tracking-widest font-semibold pt-2 border-t"
          style={{ borderColor: C.border.faint }}
        >
          Components
        </div>

        {PALETTE_CATEGORIES.map(({ label, nodes: catNodes }) => {
          // Only show categories where at least one node type is in NODE_META
          const available = catNodes.filter(n => NODE_META[n])
          if (available.length === 0) return null
          return (
            <div key={label}>
              <div className="text-[9px] text-[#333] uppercase tracking-[0.12em] font-bold mb-2">{label}</div>
              <div className="flex flex-col gap-1.5">
                {available.map((nodeType) => (
                  <ComponentCard
                    key={nodeType}
                    nodeType={nodeType}
                    highlight={step?.allowedNodeType === nodeType && !placedNodeIds.has(nodeType)}
                    disabled={placedNodeIds.has(nodeType)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
