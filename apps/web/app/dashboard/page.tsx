'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Compass, Zap, TrendingUp, Clock, Star, ArrowRight, ChevronRight, Play } from 'lucide-react'
import { C } from '@/lib/tokens'
import { LESSONS, getLessonsByDifficulty } from '@/data/lessons-catalog'

interface ProgressEntry {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationMin: number
}

const STATS = [
  { label: 'Lessons', value: '65', icon: BookOpen },
  { label: 'Patterns', value: '12', icon: Zap },
  { label: 'Avg time', value: '~25m', icon: Clock },
  { label: 'Topics', value: '8', icon: TrendingUp },
]

const FEATURED = LESSONS.filter(l =>
  ['url-shortener', 'rate-limiter', 'consistent-hashing', 'cdn-design'].includes(l.id)
)

const QUICK_START = getLessonsByDifficulty('beginner').slice(0, 3)

const DIFF_COLOR: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#eab308',
  advanced: '#ef4444',
}

const TOPICS = [
  { label: 'Fundamentals', count: 8, path: '/lessons?category=fundamentals' },
  { label: 'Databases', count: 10, path: '/lessons?category=databases' },
  { label: 'Caching', count: 7, path: '/lessons?category=caching' },
  { label: 'Messaging', count: 6, path: '/lessons?category=messaging' },
  { label: 'Networking', count: 8, path: '/lessons?category=networking' },
  { label: 'Streaming', count: 5, path: '/lessons?category=streaming' },
  { label: 'Storage', count: 6, path: '/lessons?category=storage' },
  { label: 'Case Studies', count: 15, path: '/lessons?category=case-studies' },
]

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressEntry | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scalecraft_progress')
      if (raw) setProgress(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg.app }}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Home</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-4 gap-4 mb-10"
        >
          {STATS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[12px] p-5"
              style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: C.accent.soft }}
                >
                  <Icon size={16} style={{ color: C.accent.primary }} />
                </div>
              </div>
              <div className="text-[24px] font-bold text-white">{value}</div>
              <div className="text-[12px] mt-0.5" style={{ color: C.text.secondary }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-6"
          >
            <h2 className="text-[16px] font-semibold text-white mb-3">Continue learning</h2>
            <Link href={`/lessons/${progress.id}`}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-4 p-4 rounded-[12px] cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${C.accent.primary}12, ${C.bg.panel})`,
                  border: `1px solid ${C.accent.primary}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: `${C.accent.primary}20` }}
                >
                  <Play size={16} style={{ color: C.accent.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-white truncate">{progress.title}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: C.text.secondary }}>
                    {progress.durationMin}m · <span
                      className="font-semibold uppercase tracking-wide text-[10px]"
                      style={{ color: DIFF_COLOR[progress.difficulty] }}
                    >{progress.difficulty}</span>
                  </div>
                </div>
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-semibold shrink-0"
                  style={{ background: `${C.accent.primary}20`, color: C.accent.primary }}
                >
                  Resume
                </span>
              </motion.div>
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-white">Start here</h2>
              <Link
                href="/lessons"
                className="text-[12px] flex items-center gap-1"
                style={{ color: C.accent.primary }}
              >
                All lessons <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {QUICK_START.map((lesson, i) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-4 p-4 rounded-[12px] cursor-pointer"
                    style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
                  >
                    <div
                      className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold shrink-0"
                      style={{ background: `${C.accent.primary}18`, color: C.accent.primary }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-white truncate">{lesson.title}</div>
                      <div className="text-[12px] mt-0.5 truncate" style={{ color: C.text.secondary }}>
                        {lesson.durationMin}m · {lesson.tags.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    {lesson.isInteractive && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                        style={{
                          background: `${C.accent.primary}18`,
                          color: C.accent.primary,
                          border: `1px solid ${C.accent.primary}30`,
                        }}
                      >
                        Interactive
                      </span>
                    )}
                    <ChevronRight size={14} style={{ color: C.text.muted }} className="shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            <Link href="/explore">
              <div
                className="rounded-[12px] p-5 cursor-pointer group"
                style={{
                  background: `linear-gradient(135deg, ${C.accent.primary}20, #8b5cf620)`,
                  border: `1px solid ${C.accent.primary}30`,
                }}
              >
                <Compass size={22} style={{ color: C.accent.primary }} className="mb-3" />
                <div className="text-[14px] font-semibold text-white mb-1">Free canvas</div>
                <div className="text-[12px]" style={{ color: C.text.secondary }}>
                  Draw from scratch
                </div>
                <ArrowRight
                  size={14}
                  style={{ color: C.accent.primary }}
                  className="mt-3 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>

            <div
              className="rounded-[12px] p-4"
              style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star size={13} style={{ color: C.text.secondary }} />
                <span className="text-[12px] font-semibold" style={{ color: C.text.body }}>Featured</span>
              </div>
              <div className="space-y-2">
                {FEATURED.map(l => (
                  <Link key={l.id} href={`/lessons/${l.id}`}>
                    <div
                      className="flex items-center justify-between py-2 cursor-pointer group"
                      style={{ borderBottom: `1px solid ${C.border.faint}` }}
                    >
                      <div>
                        <div className="text-[13px] font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {l.title}
                        </div>
                        <div
                          className="text-[10px] mt-0.5 font-semibold uppercase tracking-wide"
                          style={{ color: DIFF_COLOR[l.difficulty] }}
                        >
                          {l.difficulty}
                        </div>
                      </div>
                      <ChevronRight size={12} style={{ color: C.text.muted }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-[16px] font-semibold text-white mb-4">Browse by topic</h2>
          <div className="grid grid-cols-4 gap-3">
            {TOPICS.map(({ label, count, path }) => (
              <Link key={label} href={path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 rounded-[10px] cursor-pointer"
                  style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
                >
                  <div className="w-2 h-2 rounded-full mb-3" style={{ background: C.text.label }} />
                  <div className="text-[13px] font-semibold text-white">{label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: C.text.secondary }}>{count} lessons</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
