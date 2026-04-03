'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Pencil, Zap, Database, Globe, MessageSquare, ArrowRight, LayoutGrid } from 'lucide-react'
import { C } from '@/lib/tokens'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  {
    id: 'url-shortener' as const,
    name: 'URL Shortener',
    description: 'Cache + DB with read replicas.',
    icon: Globe,
    color: '#6366f1',
    nodes: 6,
    tags: ['Cache', 'Database', 'Read Replica'],
    lessonId: 'url-shortener',
  },
  {
    id: 'ecommerce' as const,
    name: 'E-Commerce',
    description: 'CDN, load balancer, API, cache, database.',
    icon: LayoutGrid,
    color: '#0ea5e9',
    nodes: 9,
    tags: ['CDN', 'Load Balancer', 'Rate Limiter'],
    lessonId: 'ecommerce-platform',
  },
  {
    id: 'chat' as const,
    name: 'Real-Time Chat',
    description: 'API server with rate limiting and cache.',
    icon: MessageSquare,
    color: '#8b5cf6',
    nodes: 7,
    tags: ['WebSocket', 'Cache', 'Monitoring'],
    lessonId: 'real-time-chat',
  },
]

const STARTERS = [
  { label: 'Blank canvas', description: 'Start with nothing.', icon: Pencil, color: C.accent.primary },
  { label: 'Microservices', description: 'Service mesh skeleton.', icon: Zap, color: '#f97316', comingSoon: true },
  { label: 'Data pipeline', description: 'Ingestion → processing → storage.', icon: Database, color: '#10b981', comingSoon: true },
]

export default function ExplorePage() {
  const loadTemplate = useStore(s => s.loadTemplate)
  const clearCanvas = useStore(s => s.clearCanvas)
  const router = useRouter()

  function handleTemplate(id: 'url-shortener' | 'ecommerce' | 'chat', lessonId: string) {
    loadTemplate(id)
    router.push(`/lessons/${lessonId}`)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg.app }}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Explore</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-10"
        >
          <h2 className="text-[16px] font-semibold text-white mb-4">Start fresh</h2>
          <div className="grid grid-cols-3 gap-4">
            {STARTERS.map(({ label, description, icon: Icon, color, comingSoon }) => (
              <motion.button
                key={label}
                whileHover={!comingSoon ? { y: -2 } : undefined}
                onClick={!comingSoon ? () => { clearCanvas(); router.push('/lessons/url-shortener') } : undefined}
                disabled={!!comingSoon}
                className="text-left rounded-[12px] p-5 group"
                style={{
                  background: C.bg.panel,
                  border: `1px solid ${C.border.card}`,
                  opacity: comingSoon ? 0.5 : 1,
                  cursor: comingSoon ? 'default' : 'pointer',
                }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="text-[14px] font-semibold text-white mb-1 flex items-center gap-2">
                  {label}
                  {comingSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#ffffff10', color: C.text.muted }}>
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: C.text.secondary }}>
                  {description}
                </p>
                {!comingSoon && (
                  <div className="flex items-center gap-1 mt-3" style={{ color }}>
                    <span className="text-[12px] font-medium">Open</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-[16px] font-semibold text-white mb-4">Templates</h2>
          <div className="grid grid-cols-3 gap-4">
            {TEMPLATES.map(({ id, name, description, icon: Icon, color, nodes, tags, lessonId }) => (
              <motion.div
                key={id}
                whileHover={{ y: -2 }}
                className="rounded-[12px] overflow-hidden cursor-pointer group"
                style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
                onClick={() => handleTemplate(id, lessonId)}
              >
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{ background: `${color}08`, borderBottom: `1px solid ${C.border.faint}` }}
                >
                  <div className="w-16 h-16 rounded-full opacity-20" style={{ background: color }} />
                  <Icon
                    size={28}
                    style={{ color, position: 'absolute' }}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <div
                    className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                  >
                    {nodes} nodes
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                    {name}
                  </h3>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: C.text.secondary }}>
                    {description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
