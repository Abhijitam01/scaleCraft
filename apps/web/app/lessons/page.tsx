'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Clock, ChevronRight, Filter } from 'lucide-react'
import { C } from '@/lib/tokens'
import { LESSONS, ALL_CATEGORIES, type Difficulty, type LessonMeta } from '@/data/lessons-catalog'

const DIFFICULTIES: Array<{ value: Difficulty | 'all'; label: string; color: string }> = [
  { value: 'all', label: 'All', color: C.text.secondary },
  { value: 'beginner', label: 'Beginner', color: '#4ade80' },
  { value: 'intermediate', label: 'Intermediate', color: '#eab308' },
  { value: 'advanced', label: 'Advanced', color: '#ef4444' },
]

const DIFF_COLORS: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#eab308',
  advanced: '#ef4444',
}

const DIFF_BG: Record<string, string> = {
  beginner: 'rgba(74,222,128,0.08)',
  intermediate: 'rgba(234,179,8,0.08)',
  advanced: 'rgba(239,68,68,0.08)',
}

function LessonCard({ lesson, index }: { lesson: LessonMeta; index: number }) {
  return (
    <Link href={`/lessons/${lesson.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
        whileHover={{ y: -2 }}
        className="group rounded-[12px] p-5 cursor-pointer h-full flex flex-col"
        style={{ background: C.bg.panel, border: `1px solid ${C.border.card}` }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: DIFF_COLORS[lesson.difficulty],
              background: DIFF_BG[lesson.difficulty],
              border: `1px solid ${DIFF_COLORS[lesson.difficulty]}30`,
            }}
          >
            {lesson.difficulty}
          </span>
          {lesson.isInteractive && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: C.accent.primary,
                background: C.accent.soft,
                border: `1px solid ${C.accent.primary}30`,
              }}
            >
              Interactive
            </span>
          )}
        </div>

        <h3 className="text-[14px] font-semibold text-white leading-snug mb-1.5 group-hover:text-indigo-300 transition-colors">
          {lesson.title}
        </h3>

        <p className="text-[12px] leading-relaxed flex-1" style={{ color: C.text.secondary }}>
          {lesson.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${C.border.faint}` }}>
          <div className="flex items-center gap-1.5" style={{ color: C.text.muted }}>
            <Clock size={11} />
            <span className="text-[11px]">{lesson.durationMin}m</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: C.text.muted }}>
            <span className="text-[11px]">Open</span>
            <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function LessonsContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all')

  const filtered = useMemo(() =>
    LESSONS.filter(l => {
      const q = query.toLowerCase()
      return (
        (difficulty === 'all' || l.difficulty === difficulty) &&
        (category === 'all' || l.category === category) &&
        (!q || l.title.toLowerCase().includes(q) || l.tags.some(t => t.includes(q)))
      )
    }),
    [query, difficulty, category]
  )

  const counts = useMemo(() => ({
    all: LESSONS.length,
    beginner: LESSONS.filter(l => l.difficulty === 'beginner').length,
    intermediate: LESSONS.filter(l => l.difficulty === 'intermediate').length,
    advanced: LESSONS.filter(l => l.difficulty === 'advanced').length,
  }), [])

  return (
    <div className="h-full overflow-y-auto" style={{ background: C.bg.app }}>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-white mb-2">Lessons</h1>
          <p className="text-[15px]" style={{ color: C.text.secondary }}>
            {LESSONS.length} lessons
          </p>
        </div>

        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.text.muted }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 rounded-[8px] text-[13px] outline-none"
              style={{
                background: C.bg.panel,
                border: `1px solid ${C.border.card}`,
                color: C.text.body,
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: C.text.muted }} />
            {DIFFICULTIES.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                style={{
                  background: difficulty === value ? `${color}18` : C.bg.panel,
                  color: difficulty === value ? color : C.text.secondary,
                  border: `1px solid ${difficulty === value ? `${color}40` : C.border.card}`,
                }}
              >
                {label}
                <span className="ml-1.5 opacity-60 font-normal">
                  {counts[value as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setCategory('all')}
            className="shrink-0 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors"
            style={{
              background: category === 'all' ? C.accent.soft : 'transparent',
              color: category === 'all' ? C.accent.primary : C.text.secondary,
              border: `1px solid ${category === 'all' ? `${C.accent.primary}30` : 'transparent'}`,
            }}
          >
            All
          </button>
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="shrink-0 px-3 py-1.5 rounded-[6px] text-[12px] font-medium capitalize transition-colors"
              style={{
                background: category === cat ? C.accent.soft : 'transparent',
                color: category === cat ? C.accent.primary : C.text.secondary,
                border: `1px solid ${category === cat ? `${C.accent.primary}30` : 'transparent'}`,
              }}
            >
              {cat.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        <p className="text-[12px] mb-5" style={{ color: C.text.muted }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
              style={{ color: C.text.muted }}
            >
              <Search size={28} className="mb-3 opacity-40" />
              <p className="text-[14px]">No results</p>
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-3 gap-4">
              {filtered.map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function LessonsPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center" style={{ background: C.bg.app }}>
        <div className="text-[14px]" style={{ color: C.text.muted }}>Loading...</div>
      </div>
    }>
      <LessonsContent />
    </Suspense>
  )
}
