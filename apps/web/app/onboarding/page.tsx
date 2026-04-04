'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Server, Database, Zap, Globe, CheckCircle2 } from 'lucide-react'
import { C } from '@/lib/tokens'

const FIRST_LESSONS = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    description: 'Start here. Cache + database. Real Bitly numbers.',
    badge: 'Beginner',
    time: '45 min',
    icon: Globe,
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    description: 'Token bucket algorithm. Protect APIs from abuse.',
    badge: 'Beginner',
    time: '30 min',
    icon: Zap,
  },
  {
    id: 'cdn-design',
    title: 'Content Delivery Network',
    description: 'Edge caching. Anycast routing. How Cloudflare works.',
    badge: 'Beginner',
    time: '30 min',
    icon: Server,
  },
]

const steps = [
  {
    id: 'what',
    title: 'System design is the missing class',
    body: "School teaches you to write code. System design teaches you where that code runs — how services talk, where data lives, and why your product stays up when things break. It's what separates engineers who can build a feature from engineers who can build a company.",
    cta: 'Got it',
  },
  {
    id: 'how',
    title: 'How ScaleCraft works',
    body: null,
    cta: 'Try it yourself',
  },
  {
    id: 'pick',
    title: 'Pick your first lesson',
    body: 'Each one takes 30-60 minutes. You will drag real components, wire real connections, and see real numbers — the same ones engineers at Stripe, Twitter, and Cloudflare use.',
    cta: null,
  },
]

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const router = useRouter()

  const currentStep = steps[stepIndex]!


  function markOnboardedAndGo(lessonId: string) {
    localStorage.setItem('scalecraft_onboarded', '1')
    router.push(`/lessons/${lessonId}`)
  }

  function advance() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: C.bg.app }}
    >
      {/* Logo / wordmark */}
      <div className="mb-12 flex items-center gap-2">
        <Database size={18} style={{ color: C.accent.primary }} />
        <span className="text-white font-bold text-[15px] tracking-tight">ScaleCraft</span>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-10">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === stepIndex ? 20 : 6,
              height: 6,
              background: i === stepIndex ? C.accent.primary : '#333',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[560px]"
        >
          <h1 className="text-[28px] font-bold text-white leading-tight mb-5 text-center">
            {currentStep.title}
          </h1>

          {currentStep.body && (
            <p
              className="text-[15px] leading-[1.7] text-center mb-8"
              style={{ color: C.text.secondary }}
            >
              {currentStep.body}
            </p>
          )}

          {/* Step 2: How it works illustration */}
          {currentStep.id === 'how' && (
            <div
              className="rounded-[14px] p-6 mb-8 border"
              style={{ background: C.bg.panel, borderColor: C.border.card }}
            >
              <div className="flex items-start gap-5">
                {[
                  { num: '1', label: 'Drag a component', sub: 'from the sidebar onto the canvas' },
                  { num: '2', label: 'Connect with an arrow', sub: 'draw the data flow between services' },
                  { num: '3', label: 'Watch the simulation', sub: 'see latency, RPS, and failure modes in real time' },
                ].map(({ num, label, sub }) => (
                  <div key={num} className="flex-1 text-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold mx-auto mb-3"
                      style={{ background: `${C.accent.primary}20`, color: C.accent.primary, border: `1px solid ${C.accent.primary}40` }}
                    >
                      {num}
                    </div>
                    <div className="text-white text-[12px] font-semibold mb-1">{label}</div>
                    <div className="text-[11px] leading-relaxed" style={{ color: C.text.muted }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Lesson picker */}
          {currentStep.id === 'pick' && (
            <div className="flex flex-col gap-3 mb-8">
              {FIRST_LESSONS.map(({ id, title, description, badge, time, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileHover={{ x: 4 }}
                  onClick={() => markOnboardedAndGo(id)}
                  className="text-left rounded-[12px] p-4 border flex items-center gap-4 group transition-colors"
                  style={{
                    background: C.bg.panel,
                    borderColor: C.border.card,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: `${C.accent.primary}15` }}
                  >
                    <Icon size={18} style={{ color: C.accent.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-semibold text-white">{title}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                        style={{ background: `${C.accent.primary}18`, color: C.accent.primary }}
                      >
                        {badge}
                      </span>
                      <span className="text-[10px]" style={{ color: C.text.muted }}>{time}</span>
                    </div>
                    <p className="text-[11px] truncate" style={{ color: C.text.secondary }}>{description}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 group-hover:translate-x-1 transition-transform"
                    style={{ color: C.text.muted }}
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* CTA button for steps 1 + 2 */}
          {currentStep.cta && (
            <div className="flex justify-center">
              <button
                onClick={advance}
                className="flex items-center gap-2 px-6 py-3 rounded-[10px] text-[13px] font-semibold text-white transition-all"
                style={{ background: C.accent.primary }}
              >
                {currentStep.cta}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Skip link */}
      <button
        onClick={() => markOnboardedAndGo('url-shortener')}
        className="mt-10 text-[11px] transition-colors"
        style={{ color: C.text.muted }}
      >
        Skip intro
      </button>
    </div>
  )
}
