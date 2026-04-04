'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { TrafficLevel } from '@/lib/validateContent'
import { C } from '@/lib/tokens'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Activity, Clock, Zap, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { FailureScenarioPanel } from '@/components/simulation/FailureScenarioPanel'
import { AIAdvisor } from '@/components/simulation/AIAdvisor'
import { COMPONENT_TOKENS, type PatternType } from '@repo/simulation-engine'

const TRAFFIC_LEVELS: TrafficLevel[] = ['idle', 'low', 'med', 'high', 'spike']
const TRAFFIC_LABELS: Record<TrafficLevel, string> = {
  idle: 'Idle',
  low: 'Low',
  med: 'Moderate',
  high: 'High',
  spike: 'Peak',
}

const PATTERN_META: Record<PatternType, { label: string; benefit: string; isWarning: boolean }> = {
  'load-balanced-cluster': {
    label: 'Load-Balanced Cluster',
    benefit: 'Traffic distributed across multiple API servers — no single server SPOF',
    isWarning: false,
  },
  'write-through-cache': {
    label: 'Write-Through Cache',
    benefit: 'Reads served from cache — database protected from read traffic',
    isWarning: false,
  },
  'db-replication': {
    label: 'DB Replication',
    benefit: 'Read replicas multiply read throughput linearly',
    isWarning: false,
  },
  'cdn-origin': {
    label: 'CDN + Origin',
    benefit: '95%+ of static requests served from edge PoPs — 20x capacity multiplier',
    isWarning: false,
  },
  'async-message-queue': {
    label: 'Async Message Queue',
    benefit: 'Workers decouple producers from slow operations — user not blocked',
    isWarning: false,
  },
  'single-point-of-failure': {
    label: 'Single Point of Failure',
    benefit: 'One node failure takes the entire system down',
    isWarning: true,
  },
  'no-auth-layer': {
    label: 'No Auth Layer',
    benefit: 'Unprotected against traffic spikes, brute force, and abuse',
    isWarning: true,
  },
  'db-fan-out': {
    label: 'DB Fan-Out',
    benefit: '3+ services connecting directly to database — connection pool exhaustion risk',
    isWarning: true,
  },
}

const ALL_PATTERNS: PatternType[] = [
  'load-balanced-cluster',
  'write-through-cache',
  'db-replication',
  'cdn-origin',
  'async-message-queue',
  'single-point-of-failure',
  'no-auth-layer',
  'db-fan-out',
]

const HEALTH_COLORS: Record<string, string> = {
  idle: '#555',
  healthy: C.semantic.success,
  degraded: '#fbbf24',
  overloaded: '#f97316',
  failed: C.semantic.error,
}

function MetricValue({ value, suffix = '', precision = 0 }: { value: number; suffix?: string; precision?: number }) {
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
  alert = false,
}: {
  label: string
  value: number
  suffix?: string
  icon: React.ElementType
  precision?: number
  alert?: boolean
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-[10px] p-3 border border-[#2a2a2a] relative overflow-hidden">
      {alert && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-3 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      )}
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={alert ? 'text-red-400' : 'text-[#888]'} />
        <span className="text-[10px] uppercase tracking-widest text-[#888] font-semibold">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>
        <MetricValue value={value} suffix={suffix} precision={precision} />
      </div>
    </div>
  )
}

function MetricsTab() {
  const trafficLevel = useStore(s => s.trafficLevel)
  const setTrafficLevel = useStore(s => s.setTrafficLevel)
  const healthResult = useStore(s => s.healthResult)

  const { p99LatencyMs, rpsCapacity, errorRate, bottleneck, warnings, score } = healthResult
  const errorRatePct = errorRate * 100
  const scoreColor = score >= 80 ? C.semantic.success : score >= 50 ? '#fbbf24' : C.semantic.error

  return (
    <div className="flex flex-col gap-5">
      {/* Traffic slider */}
      <div>
        <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold mb-2">Traffic Level</div>
        <div className="flex bg-[#1a1a1a] p-1 rounded-[8px] border border-[#2a2a2a]">
          {TRAFFIC_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setTrafficLevel(level)}
              className="flex-1 text-[10px] py-1.5 rounded-[5px] uppercase tracking-wider font-semibold transition-colors"
              style={
                trafficLevel === level
                  ? { background: C.accent.soft, color: C.accent.hover, border: `1px solid ${C.accent.primary}44` }
                  : { color: '#666' }
              }
            >
              {TRAFFIC_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="bg-[#1a1a1a] rounded-[10px] p-3 border border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-[#888] font-semibold">Architecture Score</span>
          <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{score}/100</span>
        </div>
        <div className="h-[4px] bg-[#222] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: scoreColor }}
          />
        </div>
      </div>

      {/* Bottleneck callout */}
      {bottleneck && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-[11px] border"
          style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.25)', color: '#f97316' }}
        >
          <AlertTriangle size={11} />
          <span>Bottleneck: <strong>{bottleneck.replace(/_/g, ' ')}</strong></span>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 rounded-[8px] text-[10px] border leading-[1.5]"
              style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}
            >
              <AlertTriangle size={10} className="mt-[1px] shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="p99 Latency"
          value={p99LatencyMs}
          suffix="ms"
          icon={Clock}
          alert={p99LatencyMs > 200}
        />
        <MetricCard
          label="Error Rate"
          value={errorRatePct}
          suffix="%"
          precision={1}
          icon={Activity}
          alert={errorRatePct > 2}
        />
        <MetricCard
          label="Capacity"
          value={rpsCapacity}
          suffix=" RPS"
          icon={Zap}
        />
        <MetricCard
          label="Nodes"
          value={Object.keys(healthResult.nodeHealth).length}
          icon={Server}
        />
      </div>

      {/* Failure Scenarios */}
      <FailureScenarioPanel />

      {/* AI Advisor */}
      <AIAdvisor />
    </div>
  )
}

function NodeTab() {
  const selectedNodeId = useStore(s => s.selectedNodeId)
  const healthResult = useStore(s => s.healthResult)

  if (!selectedNodeId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-[#333] text-[11px] uppercase tracking-widest font-semibold">No node selected</div>
        <div className="text-[#444] text-[11px] mt-1">Click any node on the canvas to inspect it</div>
      </div>
    )
  }

  const token = COMPONENT_TOKENS[selectedNodeId]
  if (!token) {
    return (
      <div className="text-[#555] text-[11px] py-8 text-center">Unknown node type: {selectedNodeId}</div>
    )
  }

  const healthState = healthResult.nodeHealth[selectedNodeId] ?? 'idle'
  const healthColor = HEALTH_COLORS[healthState] ?? '#555'

  return (
    <div className="flex flex-col gap-5">
      {/* Node header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-bold text-white capitalize">{selectedNodeId.replace(/_/g, ' ')}</div>
          <div className="text-[10px] text-[#555] mt-0.5 uppercase tracking-widest">Component</div>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{ color: healthColor, borderColor: `${healthColor}44`, background: `${healthColor}11` }}
        >
          {healthState}
        </div>
      </div>

      {/* Capacity note */}
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-1.5">Capacity</div>
        <div className="text-[11px] text-[#aaa] leading-[1.6] bg-[#141414] rounded-[8px] p-3 border border-[#222]">
          {token.capacityNote}
        </div>
      </div>

      {/* Tradeoffs */}
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-1.5">Tradeoffs</div>
        <div className="flex flex-col gap-1.5">
          {token.tradeoffs.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[#999] leading-[1.5]">
              <span className="text-[#444] mt-[2px] shrink-0">·</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Failure mode */}
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-1.5">If this fails</div>
        <div
          className="text-[11px] leading-[1.6] px-3 py-2 rounded-[8px] border"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
        >
          {token.failureMode}
        </div>
      </div>

      {/* Real world */}
      {token.realWorldExample && (
        <div>
          <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-1.5">Real world</div>
          <div className="text-[11px] text-[#666] leading-[1.6] italic">{token.realWorldExample}</div>
        </div>
      )}
    </div>
  )
}

function PatternsTab() {
  const healthResult = useStore(s => s.healthResult)
  const detected = new Set(healthResult.detectedPatterns)

  const goodPatterns = ALL_PATTERNS.filter(p => !PATTERN_META[p].isWarning)
  const warningPatterns = ALL_PATTERNS.filter(p => PATTERN_META[p].isWarning)

  return (
    <div className="flex flex-col gap-5">
      {/* Good patterns */}
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-2">Resilience Patterns</div>
        <div className="flex flex-col gap-2">
          {goodPatterns.map(pattern => {
            const meta = PATTERN_META[pattern]
            const isDetected = detected.has(pattern)
            return (
              <div
                key={pattern}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] border"
                style={{
                  background: isDetected ? `${C.accent.primary}0a` : '#141414',
                  borderColor: isDetected ? `${C.accent.primary}33` : '#222',
                }}
              >
                {isDetected ? (
                  <CheckCircle2 size={13} className="shrink-0 mt-[1px]" style={{ color: C.accent.primary }} />
                ) : (
                  <Circle size={13} className="shrink-0 mt-[1px] text-[#333]" />
                )}
                <div>
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: isDetected ? C.accent.hover : '#555' }}
                  >
                    {meta.label}
                  </div>
                  <div className="text-[10px] mt-0.5 leading-[1.5]" style={{ color: isDetected ? '#777' : '#444' }}>
                    {meta.benefit}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Warning patterns */}
      <div>
        <div className="text-[10px] text-[#555] uppercase tracking-widest font-semibold mb-2">Anti-Patterns Detected</div>
        <div className="flex flex-col gap-2">
          {warningPatterns.map(pattern => {
            const meta = PATTERN_META[pattern]
            const isDetected = detected.has(pattern)
            if (!isDetected) return null
            return (
              <div
                key={pattern}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] border"
                style={{
                  background: 'rgba(251,191,36,0.05)',
                  borderColor: 'rgba(251,191,36,0.2)',
                }}
              >
                <AlertTriangle size={13} className="shrink-0 mt-[1px] text-amber-400" />
                <div>
                  <div className="text-[11px] font-semibold text-amber-400">{meta.label}</div>
                  <div className="text-[10px] mt-0.5 leading-[1.5] text-[#777]">{meta.benefit}</div>
                </div>
              </div>
            )
          })}
          {warningPatterns.every(p => !detected.has(p)) && (
            <div className="text-[11px] text-[#444] px-3 py-2.5">No anti-patterns detected</div>
          )}
        </div>
      </div>
    </div>
  )
}

type Tab = 'metrics' | 'node' | 'patterns'

export function SimulationPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>('metrics')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'metrics', label: 'Metrics' },
    { id: 'node', label: 'Node' },
    { id: 'patterns', label: 'Patterns' },
  ]

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="h-[52px] border-b border-[#222] flex items-center px-5 shrink-0">
        <div className="text-[12px] uppercase tracking-widest text-[#888] font-bold">Simulation</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222] shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 text-[11px] py-2.5 uppercase tracking-widest font-semibold transition-colors"
            style={{
              color: tab === t.id ? C.accent.hover : '#555',
              borderBottom: tab === t.id ? `2px solid ${C.accent.primary}` : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 flex flex-col gap-0 overflow-y-auto custom-scrollbar flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'metrics' && <MetricsTab />}
            {tab === 'node' && <NodeTab />}
            {tab === 'patterns' && <PatternsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
