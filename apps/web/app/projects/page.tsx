'use client'

import { motion } from 'framer-motion'
import { FolderOpen, Plus } from 'lucide-react'
import { C } from '@/lib/tokens'

export default function ProjectsPage() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg.app }}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Projects</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24"
          style={{ color: C.text.muted }}
        >
          <div
            className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-5"
            style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
          >
            <FolderOpen size={26} />
          </div>
          <h2 className="text-[18px] font-semibold text-white mb-2">No saved projects</h2>
          <p className="text-[14px] text-center max-w-sm" style={{ color: C.text.secondary }}>
            Projects you save from the canvas will appear here. Coming soon.
          </p>
          <button
            className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold transition-colors"
            style={{
              background: C.accent.soft,
              color: C.accent.primary,
              border: `1px solid ${C.accent.primary}30`,
            }}
          >
            <Plus size={14} />
            New Project
          </button>
        </motion.div>
      </div>
    </div>
  )
}
