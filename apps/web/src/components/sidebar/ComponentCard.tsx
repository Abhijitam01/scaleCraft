'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { C, NODE_META } from '@/lib/tokens'

export function ComponentCard({
  nodeType,
  highlight = false,
  disabled = false,
}: {
  nodeType: string
  highlight?: boolean
  disabled?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const meta = NODE_META[nodeType] || { icon: '?', color: C.accent.primary, sublabel: '' }

  return (
    <motion.div
      draggable={!disabled}
      onDragStart={(e: any) => {
        e.dataTransfer.setData('nodeType', nodeType)
        e.dataTransfer.effectAllowed = 'move'
        setDragging(true)
      }}
      onDragEnd={() => setDragging(false)}
      className="rounded-[10px] p-3 select-none transition-colors duration-150 relative"
      style={{
        background: dragging ? '#1e1e2e' : C.bg.card,
        border: `1px solid ${dragging ? C.accent.primary : highlight ? C.accent.primary : C.border.card}`,
        boxShadow: dragging ? `0 0 20px ${C.accent.glow}` : highlight ? `0 0 10px ${C.accent.glow}` : 'none',
        cursor: disabled ? 'default' : 'grab',
        opacity: disabled ? 0.4 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.02, borderColor: C.accent.primary }}
      whileTap={disabled ? {} : { scale: 0.98, cursor: 'grabbing' }}
    >
      {highlight && (
        <div
          className="absolute top-2 right-2 text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-[4px]"
          style={{ background: C.accent.soft, color: C.accent.hover, border: `1px solid ${C.accent.primary}44` }}
        >
          Required
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[9px] flex items-center justify-center text-[10px] font-black tracking-wider shrink-0"
          style={{
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}33`,
            color: meta.color,
          }}
        >
          {meta.icon}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-0.5 capitalize">
            {nodeType.replace(/_/g, ' ')}
          </div>
          <div className="text-[11px] text-[#888] leading-[1.4]">
            {meta.sublabel}
          </div>
        </div>
      </div>

      <div
        className="mt-3 pt-2 border-t flex items-center gap-1.5"
        style={{ borderColor: C.border.faint }}
      >
        <div className="w-4 h-[1px] opacity-50" style={{ background: C.accent.primary }} />
        <span className="text-[10px] text-[#444]">{disabled ? 'already placed' : 'drag to canvas'}</span>
      </div>
    </motion.div>
  )
}
