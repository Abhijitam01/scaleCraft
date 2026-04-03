'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { C } from '@/lib/tokens'
import { motion } from 'framer-motion'
import { LayoutGrid, Link as LinkIcon, ChevronLeft, Activity } from 'lucide-react'
import { encodeState } from '@/lib/shareState'

interface TopBarProps {
  totalSteps?: number
  lessonTitle?: string
  isInteractive?: boolean
  onShowGallery?: () => void
}

export function TopBar({ totalSteps = 0, lessonTitle, isInteractive = false, onShowGallery }: TopBarProps) {
  const currentStepIndex = useStore((s) => s.currentStepIndex)
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const templateId = useStore((s) => s.templateId)
  const trafficLevel = useStore((s) => s.trafficLevel)
  const [copied, setCopied] = useState(false)
  const isSimulating = nodes.length > 1 && trafficLevel !== 'low'

  const pct = totalSteps > 0 ? Math.min(100, (currentStepIndex / totalSteps) * 100) : 0
  const displayStep = totalSteps > 0 ? Math.min(currentStepIndex + 1, totalSteps) : 0

  function handleShare() {
    const encoded = encodeState(templateId, nodes, edges)
    const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      style={{
        height: 52,
        background: C.bg.topbar,
        borderBottom: `1px solid ${C.border.panel}`,
      }}
      className="flex items-center px-4 gap-4 shrink-0 relative z-20"
    >
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/lessons"
          className="flex items-center gap-1 text-[12px] transition-colors rounded-[6px] px-2 py-1"
          style={{ color: C.text.secondary }}
        >
          <ChevronLeft size={14} />
          <span>Lessons</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center gap-4">
        {lessonTitle && (
          <span className="text-[13px] font-semibold text-white truncate max-w-[260px]">
            {lessonTitle}
          </span>
        )}

        {isInteractive && totalSteps > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-[200px] h-[3px] bg-[#1e1e1e] rounded-full overflow-hidden">
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
            <span className="text-[11px] shrink-0" style={{ color: C.text.secondary }}>
              {displayStep} / {totalSteps}
            </span>
          </div>
        )}

        {isSimulating && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: C.semantic.successBg,
              color: C.semantic.success,
              border: `1px solid ${C.semantic.successBorder}`,
            }}
          >
            <Activity size={10} className="animate-pulse" />
            Simulating
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-semibold border transition-colors"
          style={{
            background: copied ? C.semantic.successBg : '#1a1a1a',
            borderColor: copied ? C.semantic.successBorder : '#2a2a2a',
            color: copied ? C.semantic.success : '#888',
          }}
        >
          <LinkIcon size={11} />
          {copied ? 'Copied!' : 'Share'}
        </button>

        {onShowGallery && (
          <button
            onClick={onShowGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-semibold text-[#888] border border-[#2a2a2a] bg-[#1a1a1a] hover:text-white hover:border-[#444] transition-colors"
          >
            <LayoutGrid size={11} />
            Templates
          </button>
        )}
      </div>
    </div>
  )
}
