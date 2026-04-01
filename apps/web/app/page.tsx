import { TopBar } from '@/components/layout/TopBar'
import { Sidebar } from '@/components/sidebar/Sideba'
import { GuidedCanvas } from '@/components/canvas/GuidedCanva'
import { SimulationPanel } from '@/components/simulation/SimulationPanel'
import { lesson } from '@/lib/content'

export default function ScaleCraftPage() {
  return (
    <div className="flex flex-col h-screen font-mono bg-[#0a0a0a] overflow-hidden text-white">
      <TopBar totalSteps={lesson.steps.length} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Left */}
        <Sidebar className="w-[280px] shrink-0 border-r border-[#222] bg-[#111]" />

        {/* Canvas Middle */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          <GuidedCanvas />
        </div>

        {/* Simulation Panel Right */}
        <SimulationPanel className="w-[320px] shrink-0 border-l border-[#222] bg-[#111] z-10" />
      </div>
    </div>
  )
}
