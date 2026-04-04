'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { simulationStates, ecSimStates, chatSimStates } from '@/lib/content'
import type { TrafficLevel } from '@/lib/validateContent'
import { C } from '@/lib/tokens'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Activity, Clock, Zap, ChevronDown } from 'lucide-react'
import { FailureScenarioPanel } from '@/components/simulation/FailureScenarioPanel'
import { AIAdvisor } from '@/components/simulation/AIAdvisor'

// Simple animated number counter 
function MetricValue({ value, suffix = '', precision = 0 }: { value: number; suffix?: string; precision?: number }) {
  // To be very robust with React 19 / generic framer motion, we'll just animate it slightly when it changes.
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-block"
    >
      {value.toFixed(precision)}{suffix}
    </motion.span>
  )
}

function MetricCard({ 
  label, 
  value, 
  suffix, 
  icon: Icon, 
  precision = 0,
  alert = false
}: { 
  label: string; 
  value: number; 
  suffix?: string; 
  icon: any; 
  precision?: number;
  alert?: boolean
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-[10px] p-3 border border-[#2a2a2a] relative overflow-hidden">
      {alert && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-3 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      )}
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={alert ? "text-red-400" : "text-[#888]"} />
        <span className="text-[10px] uppercase tracking-widest text-[#888] font-semibold">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>
        <MetricValue value={value} suffix={suffix} precision={precision} />
      </div>
    </div>
  )
}

export function SimulationPanel({ className }: { className?: string }) {
  const nodes = useStore(s => s.nodes)
  const trafficLevel = useStore(s => s.trafficLevel)
  const setTrafficLevel = useStore(s => s.setTrafficLevel)
  const readRatio = useStore(s => s.readRatio)
  const setReadRatio = useStore(s => s.setReadRatio)
  const activeScenario = useStore(s => s.activeScenario)
  const templateId = useStore(s => s.templateId)
  const [open, setOpen] = useState(false)

  // Compute effective architecture flags from placed nodes
  const caching = nodes.some(n => n.data.nodeId === 'cache')
  const read_replicas = nodes.some(n => n.data.nodeId === 'read_replica')
  const connection_pooling = nodes.some(n => n.data.nodeId === 'load_balancer')
  const cdn = nodes.some(n => n.data.nodeId === 'cdn')
  const rate_limiter = nodes.some(n => n.data.nodeId === 'rate_limiter')

  // Template-specific state lookup
  let state =
    templateId === 'ecommerce'
      ? (ecSimStates.find(s => s.caching === caching && s.cdn === cdn && s.traffic_level === trafficLevel) ?? ecSimStates[0]!)
      : templateId === 'chat'
      ? (chatSimStates.find(s => s.caching === caching && s.rate_limiter === rate_limiter && s.traffic_level === trafficLevel) ?? chatSimStates[0]!)
      : (simulationStates.find(s =>
          s.caching === caching &&
          s.read_replicas === read_replicas &&
          s.connection_pooling === connection_pooling &&
          s.traffic_level === trafficLevel &&
          s.read_ratio === readRatio
        ) ?? simulationStates[0]!)

  // Apply failure scenario overrides when active
  if (activeScenario) {
    state = { ...state, ...activeScenario.overrideState }
  }

  // Template-specific architecture indicators
  const archIndicators =
    templateId === 'ecommerce'
      ? [
          { label: 'Cache', active: caching },
          { label: 'CDN', active: cdn },
          { label: 'Load Balancer', active: connection_pooling },
        ]
      : templateId === 'chat'
      ? [
          { label: 'Cache', active: caching },
          { label: 'Rate Limiter', active: rate_limiter },
          { label: 'Load Balancer', active: connection_pooling },
        ]
      : [
          { label: 'Cache', active: caching },
          { label: 'Read Replica', active: read_replicas },
          { label: 'Load Balancer', active: connection_pooling },
        ]

  // Template-specific redundancy for health score
  const redundancy =
    templateId === 'ecommerce'
      ? (caching ? 0.33 : 0) + (cdn ? 0.33 : 0) + (connection_pooling ? 0.34 : 0)
      : templateId === 'chat'
      ? (caching ? 0.33 : 0) + (rate_limiter ? 0.33 : 0) + (connection_pooling ? 0.34 : 0)
      : (caching ? 0.33 : 0) + (read_replicas ? 0.33 : 0) + (connection_pooling ? 0.34 : 0)

  const isFailing = state.error_rate_pct > 5

  return (
    <div className={`flex flex-col ${className}`}>
      
      {/* Header */}
      <div className="h-[52px] border-b border-[#222] flex items-center px-5 shrink-0">
        <div className="text-[12px] uppercase tracking-widest text-[#888] font-bold">Simulation</div>
      </div>

      <div className="p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold mb-2">Traffic Level</div>
            <div className="flex bg-[#1a1a1a] p-1 rounded-[8px] border border-[#2a2a2a]">
              {(['low', 'med', 'high', 'spike'] as TrafficLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setTrafficLevel(level)}
                  className="flex-1 text-[11px] py-1.5 rounded-[5px] uppercase tracking-wider font-semibold transition-colors"
                  style={
                    trafficLevel === level
                      ? { background: C.accent.soft, color: C.accent.hover, border: `1px solid ${C.accent.primary}44` }
                      : { color: '#666' }
                  }
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {templateId === 'url-shortener' && (
            <div>
              <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold mb-2">Pattern</div>
              <div className="flex bg-[#1a1a1a] p-1 rounded-[8px] border border-[#2a2a2a]">
                {[0.9, 0.99].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setReadRatio(ratio as 0.9 | 0.99)}
                    className="flex-1 text-[11px] py-1.5 rounded-[5px] font-semibold transition-colors"
                    style={
                      readRatio === ratio
                        ? { background: C.accent.soft, color: C.accent.hover, border: `1px solid ${C.accent.primary}44` }
                        : { color: '#666' }
                    }
                  >
                    {ratio * 100}% Reads
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Architecture */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold">Active Architecture</div>
          <div className="flex gap-2 flex-wrap">
            {archIndicators.map(({ label, active }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                style={{
                  background: active ? C.accent.soft : '#1a1a1a',
                  borderColor: active ? `${C.accent.primary}44` : '#2a2a2a',
                  color: active ? C.accent.hover : '#555',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: active ? C.accent.primary : '#333' }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Health Score */}
        {(() => {
          const latency_score = Math.max(0, 1 - state.p99_latency_ms / 500)
          const error_score = Math.max(0, 1 - state.error_rate_pct / 10)
          const score = Math.round((redundancy * 0.4 + latency_score * 0.3 + error_score * 0.3) * 100)
          const scoreColor = score >= 70 ? C.semantic.success : score >= 40 ? '#fbbf24' : C.semantic.error
          return (
            <div className="bg-[#1a1a1a] rounded-[10px] p-3 border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#888] font-semibold">Architecture Health</span>
                <span className="text-[10px] text-[#555]">illustrative</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
                <div className="flex-1 h-[4px] bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, background: scoreColor }}
                  />
                </div>
              </div>
            </div>
          )
        })()}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            label="p99 Latency" 
            value={state.p99_latency_ms} 
            suffix="ms" 
            icon={Clock} 
            alert={state.p99_latency_ms > 200} 
          />
          <MetricCard 
            label="Error Rate" 
            value={state.error_rate_pct} 
            suffix="%" 
            precision={1}
            icon={Activity} 
            alert={state.error_rate_pct > 2} 
          />
          <MetricCard 
            label="Capacity" 
            value={state.rps_capacity} 
            suffix=" RPS" 
            icon={Zap} 
          />
          <MetricCard 
            label="Cache Hit" 
            value={state.cache_hit_rate_pct} 
            suffix="%" 
            icon={Server} 
          />
        </div>

        {/* Failure Scenarios */}
        <FailureScenarioPanel />

        {/* Behind the Numbers — collapsible */}
        <div className={`rounded-[10px] border overflow-hidden ${isFailing ? 'border-red-500/30' : 'border-[#2a2a2a]'}`}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            style={{ background: isFailing ? C.semantic.errorBg : '#1a1a1a' }}
          >
            <div className="flex items-center gap-2">
              {isFailing && (
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: C.semantic.error }}>Systems Failing ·</span>
              )}
              <span className="text-[11px] uppercase tracking-widest text-[#888] font-semibold">Behind the Numbers</span>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="text-[#555]" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="explanation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="px-4 pb-4 pt-1 text-[12px] leading-[1.6] text-[#ccc]"
                  style={{ borderTop: `1px solid ${isFailing ? C.semantic.errorBorder : '#222'}` }}
                >
                  {state.toggle_explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Design Critic */}
        <AIAdvisor />

      </div>

    </div>
  )
}
