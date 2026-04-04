'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { FAILURE_SCENARIOS, SCENARIO_NAMES } from '@/lib/FailureCascade'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { C } from '@/lib/tokens'

export function FailureScenarioPanel() {
  const { activeScenario, injectScenario, clearScenario } = useStore()
  const [remaining, setRemaining] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Manage countdown + auto-clear when scenario is active
  useEffect(() => {
    if (!activeScenario) {
      setRemaining(0)
      if (timerRef.current) clearInterval(timerRef.current)
      if (clearRef.current) clearTimeout(clearRef.current)
      return
    }

    setRemaining(activeScenario.durationMs)

    timerRef.current = setInterval(() => {
      setRemaining(r => Math.max(0, r - 200))
    }, 200)

    clearRef.current = setTimeout(() => {
      clearScenario()
    }, activeScenario.durationMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (clearRef.current) clearTimeout(clearRef.current)
    }
  }, [activeScenario, clearScenario])

  const progressPct = activeScenario ? (remaining / activeScenario.durationMs) * 100 : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold">Failure Scenarios</div>

      <div className="flex flex-col gap-2">
        {FAILURE_SCENARIOS.map(scenario => {
          const isActive = activeScenario?.id === scenario.id

          return (
            <button
              key={scenario.id}
              onClick={() => {
                if (isActive) {
                  if (clearRef.current) clearTimeout(clearRef.current)
                  if (timerRef.current) clearInterval(timerRef.current)
                  clearScenario()
                } else {
                  injectScenario(scenario)
                }
              }}
              className="text-left rounded-[8px] p-3 border transition-colors relative overflow-hidden"
              style={{
                background: isActive ? C.semantic.errorBg : '#1a1a1a',
                borderColor: isActive ? C.semantic.error + '66' : '#2a2a2a',
              }}
            >
              <div className="flex items-start gap-2">
                <Zap
                  size={12}
                  className="mt-[2px] shrink-0"
                  style={{ color: isActive ? C.semantic.error : '#666' }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[11px] font-semibold mb-1"
                    style={{ color: isActive ? C.semantic.error : '#ccc' }}
                  >
                    {SCENARIO_NAMES[scenario.id] ?? scenario.id}
                  </div>
                  <div className="text-[10px] leading-[1.5] text-[#555]">
                    {scenario.description}
                  </div>
                </div>
              </div>

              {/* Countdown bar */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2"
                  >
                    <div className="h-[3px] bg-[#222] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="text-[9px] mt-1 text-right" style={{ color: C.semantic.error }}>
                      {(remaining / 1000).toFixed(1)}s — click to cancel
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>
    </div>
  )
}
