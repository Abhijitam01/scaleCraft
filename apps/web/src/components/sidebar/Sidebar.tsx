'use client'

import { useStore } from '@/lib/store'
import { C, NODE_META } from '@/lib/tokens'
import { ComponentCard } from '@/components/sidebar/ComponentCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ShieldAlert, Globe, Zap, CheckCircle2 } from 'lucide-react'

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
            className="h-[4px] rounded-[2px] transition-all duration-300 ease-out"
            style={{
              width: done ? 16 : active ? 12 : 6,
              background: (done || active) ? C.accent.primary : '#2a2a2a',
              opacity: done ? 0.8 : active ? 1 : 0.4,
              boxShadow: active ? `0 0 8px ${C.accent.glow}` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

import { Quiz } from '@/components/simulation/Quiz'

function CompletionSidebar() {
  const activeLesson = useStore(s => s.activeLesson)
  if (!activeLesson) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-[12px] border bg-[#0f0f0f]"
      style={{ borderColor: '#222' }}
    >
      <div className="flex items-center gap-2 mb-4 text-emerald-400">
        <CheckCircle2 size={18} />
        <span className="text-[14px] font-bold uppercase tracking-widest">Architecture Complete</span>
      </div>
      
      <div className="pt-4 border-t border-[#1a1a1a]">
        <Quiz questions={activeLesson.quiz.questions} onComplete={(score) => {
          console.log('Quiz complete:', score)
        }} />
      </div>
    </motion.div>
  )
}

export function Sidebar({ className }: { className?: string }) {
  const currentStepIndex = useStore(s => s.currentStepIndex)
  const nodes = useStore(s => s.nodes)
  const activeLesson = useStore(s => s.activeLesson)
  
  if (!activeLesson) return null

  const isDone = currentStepIndex >= activeLesson.steps.length
  const step = activeLesson.steps[currentStepIndex]
  const placedNodeIds = new Set(nodes.map((n) => n.data.nodeId))

  return (
    <div className={`flex flex-col p-4 gap-4 overflow-y-auto ${className}`} style={{ background: '#0d0d0d' }}>
      {!isDone && step && (
        <>
          <div className="flex items-center justify-between shrink-0 mb-1">
            <span className="text-[#666] text-[9px] uppercase tracking-[0.15em] font-bold">
              Progress
            </span>
            <StepPills currentStep={currentStepIndex} total={activeLesson.steps.length} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 shrink-0"
            >
              {/* Main Instruction */}
              <div className="rounded-[10px] p-4 border relative overflow-hidden" style={{ background: '#141414', borderColor: '#222' }}>
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Info size={40} />
                </div>
                <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1.5 font-bold">
                  Step {step.stepNumber}
                </div>
                <div className="text-white text-[13px] font-medium leading-[1.5] mb-1">
                  {step.instruction}
                </div>
                <div className="text-[#888] text-[11px] leading-[1.5]">
                  {step.detail}
                </div>
              </div>

              {/* Edge/Action Hint */}
              <div className="px-1">
                <div className="text-[9px] text-[#555] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                  <div className="h-[1px] flex-1 bg-[#222]" />
                  Required Action
                  <div className="h-[1px] flex-1 bg-[#222]" />
                </div>
                <div className="bg-[#0a0a0a] rounded-[8px] p-3 border flex items-center justify-center gap-3 font-mono text-[11px]" style={{ borderColor: '#1a1a1a' }}>
                  <span className="text-[#666]">{step.allowedEdge.source.replace(/_/g, ' ')}</span>
                  <div className="h-[1px] w-4 bg-indigo-500/50" />
                  <span className="text-white border-b border-indigo-500/30 pb-0.5">{step.allowedEdge.target.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* High-Fidelity Explanations */}
              <div className="flex flex-col gap-3 mt-1">
                <section>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/80 uppercase tracking-wider font-bold mb-1.5">
                    <Zap size={10} /> The Why
                  </div>
                  <p className="text-[#999] text-[11px] leading-[1.6] pl-3 border-l border-emerald-500/20">
                    {step.explanation.why}
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400/80 uppercase tracking-wider font-bold mb-1.5">
                    <ShieldAlert size={10} /> Tradeoffs
                  </div>
                  <p className="text-[#999] text-[11px] leading-[1.6] pl-3 border-l border-amber-500/20">
                    {step.explanation.tradeoff}
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-1.5 text-[10px] text-sky-400/80 uppercase tracking-wider font-bold mb-1.5">
                    <Globe size={10} /> Real World
                  </div>
                  <p className="text-[#999] text-[11px] leading-[1.6] pl-3 border-l border-sky-500/20 italic">
                    &quot;{step.explanation.realWorld}&quot;
                  </p>
                </section>

                <section>
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-400/80 uppercase tracking-wider font-bold mb-1.5">
                    <Info size={10} /> Capacity
                  </div>
                  <div className="bg-purple-500/5 rounded p-2 text-[10px] text-purple-300 font-mono border border-purple-500/10">
                    {step.explanation.capacity}
                  </div>
                </section>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {isDone && <CompletionSidebar />}

      {/* Component Palette */}
      <div className="flex flex-col gap-4 mt-4 shrink-0">
        <div className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-bold pt-4 border-t border-[#1a1a1a]">
          System Components
        </div>

        {PALETTE_CATEGORIES.map(({ label, nodes: catNodes }) => {
          const available = catNodes.filter(n => NODE_META[n])
          if (available.length === 0) return null
          return (
            <div key={label} className="flex flex-col gap-2">
              <div className="text-[8px] text-[#333] uppercase tracking-widest font-black">{label}</div>
              <div className="flex flex-col gap-1">
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
