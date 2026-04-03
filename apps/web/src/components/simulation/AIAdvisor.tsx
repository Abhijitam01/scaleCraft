'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ChevronDown, RefreshCw, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'unavailable' | 'error'

export function AIAdvisor() {
  const { nodes, edges, templateId } = useStore()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [critique, setCritique] = useState('')
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  async function runCritique() {
    // Cancel any in-flight stream
    if (readerRef.current) {
      await readerRef.current.cancel()
      readerRef.current = null
    }

    setCritique('')
    setStatus('loading')

    const topology = {
      template: templateId,
      nodes: nodes.map(n => n.id),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
    }

    try {
      const res = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topology }),
      })

      if (res.status === 503) {
        setStatus('unavailable')
        return
      }

      if (!res.ok || !res.body) {
        setStatus('error')
        return
      }

      setStatus('streaming')
      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setCritique(text)
      }

      readerRef.current = null
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const hasNodes = nodes.filter(n => n.id !== 'client').length > 0

  return (
    <div className="rounded-[10px] border border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#1a1a1a]"
      >
        <div className="flex items-center gap-2">
          <Bot size={13} className="text-[#6366f1]" />
          <span className="text-[11px] uppercase tracking-widest text-[#888] font-semibold">
            AI Design Critic
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold px-1.5 py-0.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a]">
            beta
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-[#555]" />
        </motion.div>
      </button>

      {/* Body */}
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

              {/* Analyze button */}
              <button
                onClick={runCritique}
                disabled={status === 'loading' || status === 'streaming' || !hasNodes}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-[7px] text-[11px] font-semibold transition-colors border"
                style={{
                  background: hasNodes ? 'rgba(99,102,241,0.10)' : '#1a1a1a',
                  borderColor: hasNodes ? 'rgba(99,102,241,0.25)' : '#2a2a2a',
                  color: hasNodes ? '#818cf8' : '#555',
                  cursor: (!hasNodes || status === 'loading' || status === 'streaming') ? 'not-allowed' : 'pointer',
                  opacity: (status === 'loading' || status === 'streaming') ? 0.7 : 1,
                }}
              >
                {(status === 'loading' || status === 'streaming') ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    Analyzing...
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

              {/* Unavailable state */}
              {status === 'unavailable' && (
                <div className="text-[11px] text-[#555] leading-relaxed bg-[#111] rounded-[7px] p-3 border border-[#222]">
                  AI critique unavailable. Set{' '}
                  <code className="text-[#6366f1] bg-[#1a1a1a] px-1 py-0.5 rounded text-[10px]">
                    ANTHROPIC_API_KEY
                  </code>{' '}
                  in <code className="text-[#6366f1] bg-[#1a1a1a] px-1 py-0.5 rounded text-[10px]">.env.local</code>.
                </div>
              )}

              {/* Error state */}
              {status === 'error' && (
                <p className="text-[11px] text-[#ef4444]">
                  Something went wrong. Try again.
                </p>
              )}

              {/* Critique output */}
              {(status === 'streaming' || status === 'done') && critique && (
                <div className="text-[12px] leading-[1.65] text-[#ccc] bg-[#111] rounded-[7px] p-3 border border-[#222] whitespace-pre-wrap">
                  {critique}
                  {status === 'streaming' && (
                    <span className="inline-block w-[6px] h-[14px] bg-[#6366f1] ml-0.5 align-middle animate-pulse rounded-[1px]" />
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
