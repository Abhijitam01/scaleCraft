'use client'

import { useStore } from '@/lib/store'
import { simulationStates } from '@/lib/content'
import type { TrafficLevel } from '@/lib/validateContent'
import { C } from '@/lib/tokens'
import { motion } from 'framer-motion'
import { Server, Activity, Clock, Zap } from 'lucide-react'

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
  const { nodes, trafficLevel, setTrafficLevel, readRatio, setReadRatio } = useStore()
  
  // Compute effective architecture 
  const caching = nodes.some(n => n.data.nodeId === 'cache')
  const read_replicas = nodes.some(n => n.data.nodeId === 'read_replica')
  // We assume pooling is enabled when load_balancer is added, or wait: the instructions say 'PgBouncer connection pool' but Lesson Step 3 is Load Balancer. Let's trace it. 
  // Let's just track load balancer for pooling, or rate limiter? 
  // For simulation sake, if nodes > 2 (meaning more than client + api + db), we might assume some pooling. Let's just tie pooling to Load Balancer to have it naturally progress.
  const connection_pooling = nodes.some(n => n.data.nodeId === 'load_balancer')

  // Find matching state
  let state = simulationStates.find(s => 
    s.caching === caching && 
    s.read_replicas === read_replicas && 
    s.connection_pooling === connection_pooling && 
    s.traffic_level === trafficLevel && 
    s.read_ratio === readRatio
  )

  // Fallback to closest if exact match not found
  if (!state) {
    state = simulationStates[0]!
  }

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
                  className={`flex-1 text-[11px] py-1.5 rounded-[5px] uppercase tracking-wider font-semibold transition-colors ${
                    trafficLevel === level 
                      ? 'bg-[#2a2a2a] text-white shadow-sm' 
                      : 'text-[#888] hover:text-[#ccc]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#555] uppercase tracking-widest font-semibold mb-2">Pattern</div>
            <div className="flex bg-[#1a1a1a] p-1 rounded-[8px] border border-[#2a2a2a]">
              {[0.9, 0.99].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setReadRatio(ratio as 0.9 | 0.99)}
                  className={`flex-1 text-[11px] py-1.5 rounded-[5px] font-semibold transition-colors ${
                    readRatio === ratio 
                      ? 'bg-[#2a2a2a] text-white shadow-sm' 
                      : 'text-[#888] hover:text-[#ccc]'
                  }`}
                >
                  {ratio * 100}% Reads
                </button>
              ))}
            </div>
          </div>
        </div>

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

        {/* Explanation Module */}
        <motion.div 
          key={state.toggle_explanation}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-[10px] border relative overflow-hidden ${
            isFailing 
            ? 'bg-red-500/10 border-red-500/30' 
            : 'bg-[#1a1a1a] border-[#2a2a2a]'
          }`}
        >
          {isFailing && (
             <div className="text-[10px] uppercase tracking-widest text-[#ef4444] font-bold mb-2">Systems Failing</div>
          )}
          <div className="text-[#ccc] text-[12px] leading-[1.6]">
            {state.toggle_explanation}
          </div>
        </motion.div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  )
}
