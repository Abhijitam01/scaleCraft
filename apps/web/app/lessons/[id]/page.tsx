'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { GuidedCanvas } from '@/components/canvas/GuidedCanvas'
import { SimulationPanel } from '@/components/simulation/SimulationPanel'
import { TemplateGallery } from '@/components/TemplateGallery'
import { decodeState } from '@/lib/shareState'
import { useStore } from '@/lib/store'
import { getLessonById } from '@/data/lessons-catalog'
import { lesson } from '@/lib/content'

const INTERACTIVE_LESSON_IDS = new Set(['url-shortener', 'ecommerce-platform', 'real-time-chat'])

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showGallery, setShowGallery] = useState(false)
  const loadTemplate = useStore((s) => s.loadTemplate)

  const meta = getLessonById(id)
  if (!meta) notFound()

  const templateMap: Record<string, 'url-shortener' | 'ecommerce' | 'chat'> = {
    'url-shortener': 'url-shortener',
    'ecommerce-platform': 'ecommerce',
    'real-time-chat': 'chat',
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('d')
    if (encoded) {
      const parsed = decodeState(encoded)
      if (parsed) {
        loadTemplate(parsed.templateId, parsed.nodes, parsed.edges)
        return
      }
    }
    const tplId = templateMap[id]
    if (tplId) loadTemplate(tplId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const isInteractive = INTERACTIVE_LESSON_IDS.has(id)

  return (
    <div className="flex flex-col h-full font-mono bg-[#0a0a0a] overflow-hidden text-white">
      <TopBar
        lessonTitle={meta.title}
        isInteractive={isInteractive}
        totalSteps={isInteractive ? lesson.steps.length : 0}
        onShowGallery={() => setShowGallery(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar className="w-[280px] shrink-0 border-r border-[#222] bg-[#111]" />
        <div className="flex-1 relative bg-[#0a0a0a]">
          <GuidedCanvas freeDraw={!isInteractive} />
        </div>
        <SimulationPanel className="w-[300px] min-w-[200px] border-l border-[#222] bg-[#111] z-10" />
      </div>

      <TemplateGallery open={showGallery} onClose={() => setShowGallery(false)} />
    </div>
  )
}
