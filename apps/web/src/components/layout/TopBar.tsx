'use client'

import { useStore } from '@/lib/store'
import { C } from '@/lib/tokens'
import { motion } from 'framer-motion'

export function TopBar({ totalSteps }: { totalSteps: number }) {
  const currentStepIndex = useStore((s) => s.currentStepIndex)
  const pct = Math.min(100, (currentStepIndex / totalSteps) * 100)
  const displayStep = Math.min(currentStepIndex + 1, totalSteps)

  return (
    <div
      style={{
        height: 52,
        background: C.bg.topbar,
        borderBottom: `1px solid ${C.border.panel}`,
      }}
      className="flex items-center px-6 gap-6 shrink-0 relative z-20"
    >
      <div className="text-[15px] font-bold tracking-tight shrink-0">
        Scale<span style={{ color: C.accent.primary }}>Craft</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[320px] h-[3px] bg-[#1e1e1e] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${C.accent.primary}, ${C.accent.hover})`,
              boxShadow: pct > 0 ? `0 0 10px ${C.accent.glow}` : 'none',
            }}
          />
        </div>
      </div>

      <div className="text-[12px] text-[#888] shrink-0 flex items-center space-x-2">
        <span>Step {displayStep}</span>
        <span className="text-[#444]">of {totalSteps}</span>
      </div>
    </div>
  )
}
