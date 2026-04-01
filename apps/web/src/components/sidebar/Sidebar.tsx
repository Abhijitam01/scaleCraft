'use client'

import { useStore } from '@/lib/store'
import { lesson } from '@/lib/content'
import { C } from '@/lib/tokens'
import { ComponentCard } from '@/components/sidebar/ComponentCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

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
              background: done ? C.accent.primary : active ? C.accent.primary : '#2a2a2a',
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
        You've scaled from 100 RPS to 15,000 RPS. Review your simulation metrics or proceed to the quiz.
      </div>
    </motion.div>
  )
}

export function Sidebar({ className }: { className?: string }) {
  const currentStepIndex = useStore((s) => s.currentStepIndex)
  const isDone = currentStepIndex >= lesson.steps.length
  const step = lesson.steps[currentStepIndex]

  return (
    <div className={`flex flex-col p-4 gap-4 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[#444] text-[10px] uppercase tracking-widest font-semibold">
          Current Step
        </span>
        <StepPills currentStep={currentStepIndex} total={lesson.steps.length} />
      </div>

      <AnimatePresence mode="wait">
        {isDone || !step ? (
          <CompletionSidebar key="completion" />
        ) : (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Instruction Panel */}
            <div
              className="rounded-[8px] p-3 border"
              style={{ background: C.bg.inset, borderColor: '#2a2a3a' }}
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

            {/* Draggable Component Card */}
            <ComponentCard step={step} />

            {/* Edge Hint */}
            <div
              className="pt-3 border-t"
              style={{ borderColor: C.border.faint }}
            >
              <div className="text-[10px] text-[#555] uppercase tracking-widest mb-2 font-semibold">
                Then draw edge
              </div>
              <div
                className="bg-[#141414] rounded-[7px] p-2 flex items-center gap-2 border font-mono text-[12px]"
                style={{ borderColor: C.border.card }}
              >
                <span className="text-[#888]">{step.allowedEdge.source}</span>
                <span className="text-[14px]" style={{ color: C.accent.primary }}>
                  →
                </span>
                <span className="text-white">{step.allowedEdge.target}</span>
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
        )}
      </AnimatePresence>

      {/* Checklist / Tracker at Bottom */}
      <div className="mt-auto border-t pt-3" style={{ borderColor: C.border.faint }}>
        <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2 font-semibold">
          Progress
        </div>
        
        {/* Simplified checklist just for the UI logic tracking we want */}
        <div className="flex items-center gap-2 mb-2 transition-opacity">
          <div
            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
               true ? 'bg-[#4ade80]/10 border-[#4ade80]/25 text-[#4ade80]' : 'bg-[#161616] border-[#2a2a2a] text-[#444]'
            }`}
          >
            <Check size={10} />
          </div>
          <span className="text-[11px] text-[#888]">Drag & Drop active</span>
        </div>
      </div>
    </div>
  )
}
