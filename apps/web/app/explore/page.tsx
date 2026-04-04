'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { GuidedCanvas } from '@/components/canvas/GuidedCanvas'
import { SimulationPanel } from '@/components/simulation/SimulationPanel'
import { TemplateGallery } from '@/components/TemplateGallery'

export default function SandboxPage() {
  const [showGallery, setShowGallery] = useState(false)

  return (
    <div className="flex flex-col h-full font-mono bg-[#0a0a0a] overflow-hidden text-white">
      <TopBar
        lessonTitle="Sandbox"
        isInteractive={false}
        totalSteps={0}
        onShowGallery={() => setShowGallery(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar className="w-[280px] shrink-0 border-r border-[#222] bg-[#111]" />
        <div className="flex-1 relative bg-[#0a0a0a]">
          <GuidedCanvas freeDraw={true} />
        </div>
        <SimulationPanel className="w-[300px] min-w-[200px] border-l border-[#222] bg-[#111] z-10" />
      </div>

      <TemplateGallery open={showGallery} onClose={() => setShowGallery(false)} />
    </div>
  )
}
