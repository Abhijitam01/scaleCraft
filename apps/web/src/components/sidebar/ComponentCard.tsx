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
      className="rounded-[7px] py-1.5 px-2.5 select-none transition-colors duration-150 flex items-center gap-2"
      style={{
        background: dragging ? '#1e1e2e' : C.bg.card,
        border: `1px solid ${dragging ? C.accent.primary : highlight ? C.accent.primary : C.border.card}`,
        boxShadow: dragging ? `0 0 14px ${C.accent.glow}` : highlight ? `0 0 8px ${C.accent.glow}` : 'none',
        cursor: disabled ? 'default' : 'grab',
        opacity: disabled ? 0.4 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.015, borderColor: C.accent.primary }}
      whileTap={disabled ? {} : { scale: 0.98, cursor: 'grabbing' }}
    >
      <div
        className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[9px] font-black tracking-wider shrink-0"
        style={{
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}33`,
          color: meta.color,
        }}
      >
        {meta.icon}
      </div>
      <span className="text-[12px] font-medium text-white capitalize leading-none">
        {nodeType.replace(/_/g, ' ')}
      </span>
      {highlight && (
        <span
          className="ml-auto text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-[3px]"
          style={{ background: C.accent.soft, color: C.accent.hover, border: `1px solid ${C.accent.primary}44` }}
        >
          Next
        </span>
      )}
    </motion.div>
  )
}
