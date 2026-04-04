'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ChevronDown, RefreshCw, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

const RATE_LIMIT_MS = 30_000

type Status = 'idle' | 'loading' | 'done' | 'unavailable' | 'error'

interface CritiqueResult {
  criticalFlaw: string | null
  improvements: string[]
  positiveObservation: string | null
}

export function AIAdvisor() {
  const { nodes, edges } = useStore()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<CritiqueResult | null>(null)
  const [lastCallAt, setLastCallAt] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      abortRef.current?.abort()
    }
  }, [])

  function startCountdown(from: number) {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(from)
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 200) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return c - 200
      })
    }, 200)
  }

  async function runCritique() {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setResult(null)
    setStatus('loading')

    const topology = {
      template: 'custom',
      nodes: nodes.map(n => n.id),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
    }

    try {
      const res = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topology }),
        signal: controller.signal,
      })

      if (res.status === 503) {
        setStatus('unavailable')
        return
      }

      if (!res.ok || !res.body) {
        setStatus('error')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
      }

      try {
        const parsed = JSON.parse(text) as CritiqueResult
        setResult(parsed)
        setStatus('done')
      } catch {
        // Fallback: treat as plain text critique
        setResult({ criticalFlaw: text, improvements: [], positiveObservation: null })
        setStatus('done')
      }

      const now = Date.now()
      setLastCallAt(now)
      startCountdown(RATE_LIMIT_MS)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setStatus('error')
    }
  }

  const hasNodes = nodes.filter(n => n.id !== 'client').length > 0
  const isRateLimited = lastCallAt !== null && countdown > 0
  const isLoading = status === 'loading'
  const disabled = !hasNodes || isLoading || isRateLimited

  return (
    <div className="rounded-[10px] border border-[#2a2a2a] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#1a1a1a]"
      >
        <div className="flex items-center gap-2">
          <Bot size={13} className="text-[#6366f1]" />
          <span className="text-[11px] uppercase tracking-widest text-[#888] font-semibold">AI Advisor</span>
          <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold px-1.5 py-0.5 rounded-full bg-[#1e1e2e] border border-[#2a2a2a]">
            beta
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-[#555]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-3 border-t border-[#222] flex flex-col gap-3">
              <button
                onClick={runCritique}
                disabled={disabled}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-[7px] text-[11px] font-semibold transition-colors border"
                style={{
                  background: !disabled ? 'rgba(99,102,241,0.10)' : '#1a1a1a',
                  borderColor: !disabled ? 'rgba(99,102,241,0.25)' : '#2a2a2a',
                  color: !disabled ? '#818cf8' : '#555',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    Analyzing...
                  </>
                ) : isRateLimited ? (
                  <>
                    <span>Ready in {(countdown / 1000).toFixed(0)}s</span>
                  </>
                ) : (
                  <>
                    {status === 'done' && <RefreshCw size={11} />}
                    {status === 'done' ? 'Re-analyze' : 'Analyze Architecture'}
                  </>
                )}
              </button>

              {!hasNodes && status === 'idle' && (
                <p className="text-[11px] text-[#444] text-center">
                  Place at least one component to get a critique.
                </p>
              )}

              {status === 'unavailable' && (
                <div className="text-[11px] text-[#555] leading-relaxed bg-[#111] rounded-[7px] p-3 border border-[#222]">
                  AI critique unavailable. Set{' '}
                  <code className="text-[#6366f1] bg-[#1a1a1a] px-1 py-0.5 rounded text-[10px]">
                    ANTHROPIC_API_KEY
                  </code>{' '}
                  in{' '}
                  <code className="text-[#6366f1] bg-[#1a1a1a] px-1 py-0.5 rounded text-[10px]">.env.local</code>.
                </div>
              )}

              {status === 'error' && (
                <p className="text-[11px] text-[#ef4444]">Something went wrong. Try again.</p>
              )}

              {status === 'done' && result && (
                <div className="flex flex-col gap-2">
                  {result.criticalFlaw && (
                    <div className="border-l-2 border-red-500 pl-3 py-1 text-[11px] leading-[1.6] text-red-400">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-red-600 block mb-0.5">Critical</span>
                      {result.criticalFlaw}
                    </div>
                  )}
                  {result.improvements && result.improvements.length > 0 && (
                    <div className="border-l-2 border-amber-500 pl-3 py-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600 block mb-1">Improvements</span>
                      <div className="flex flex-col gap-1">
                        {result.improvements.map((imp, i) => (
                          <div key={i} className="text-[11px] leading-[1.5] text-[#999]">
                            · {imp}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.positiveObservation && (
                    <div className="border-l-2 border-emerald-500 pl-3 py-1 text-[11px] leading-[1.6] text-emerald-400">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-600 block mb-0.5">Strength</span>
                      {result.positiveObservation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
