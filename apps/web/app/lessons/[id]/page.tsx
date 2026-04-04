'use client'

import { useState, useEffect, useRef, use } from 'react'
import { notFound } from 'next/navigation'
import confetti from 'canvas-confetti'
import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { GuidedCanvas } from '@/components/canvas/GuidedCanvas'
import { SimulationPanel } from '@/components/simulation/SimulationPanel'
import { TemplateGallery } from '@/components/TemplateGallery'
import { decodeState } from '@/lib/shareState'
import { useStore } from '@/lib/store'
import { getLessonById } from '@/data/lessons-catalog'

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showGallery, setShowGallery] = useState(false)
  const loadTemplate = useStore((s) => s.loadTemplate)
  const setLesson = useStore((s) => s.setLesson)
  const activeLesson = useStore((s) => s.activeLesson)
  const currentStepIndex = useStore((s) => s.currentStepIndex)
  const confettiFired = useRef(false)

  const meta = getLessonById(id)
  if (!meta) notFound()

  useEffect(() => {
    setLesson(id)
    confettiFired.current = false

    // Track last visited lesson for dashboard "Continue learning"
    localStorage.setItem('scalecraft_progress', JSON.stringify({
      id: meta.id,
      title: meta.title,
      difficulty: meta.difficulty,
      durationMin: meta.durationMin,
    }))

    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('d')
    if (encoded) {
      const parsed = decodeState(encoded)
      if (parsed) {
        loadTemplate(parsed.templateId, parsed.nodes, parsed.edges)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const totalSteps = activeLesson?.steps.length ?? 0
  const isDone = totalSteps > 0 && currentStepIndex >= totalSteps

  useEffect(() => {
    if (isDone && !confettiFired.current) {
      confettiFired.current = true
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#6ee7b7', '#fff'] })
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#34d399'] })
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#34d399'] })
      }, 300)
    }
  }, [isDone])

  const isInteractive = !!activeLesson

  return (
    <div className="flex flex-col h-full font-mono bg-[#0a0a0a] overflow-hidden text-white">
      <TopBar
        lessonTitle={meta.title}
        isInteractive={isInteractive}
        totalSteps={totalSteps}
        difficulty={meta.difficulty}
        durationMin={meta.durationMin}
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
