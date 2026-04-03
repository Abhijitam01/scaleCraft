'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, ShoppingCart, MessageSquare } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { TemplateId } from '@/lib/store'
import { urlShortenerTemplate } from '@/data/templates/url-shortener'
import { ecommerceTemplate } from '@/data/templates/ecommerce'
import { chatTemplate } from '@/data/templates/chat'

interface TemplateCardProps {
  id: TemplateId
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  nodeCount: number
  icon: React.ReactNode
  onSelect: () => void
}

function TemplateCard({ title, description, difficulty, nodeCount, icon, onSelect }: TemplateCardProps) {
  const difficultyColor =
    difficulty === 'Beginner' ? '#4ade80' : difficulty === 'Intermediate' ? '#fbbf24' : '#f97316'

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] p-5 hover:border-[#6366f1] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-[8px] bg-[#222] border border-[#333] flex items-center justify-center text-[#6366f1] group-hover:bg-[#2a2a3a] transition-colors">
          {icon}
        </div>
        <span
          className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
          style={{ color: difficultyColor, background: `${difficultyColor}18` }}
        >
          {difficulty}
        </span>
      </div>
      <div className="text-[14px] font-semibold text-white mb-1">{title}</div>
      <div className="text-[12px] text-[#888] leading-relaxed mb-3">{description}</div>
      <div className="text-[11px] text-[#555]">{nodeCount} components</div>
    </button>
  )
}

interface TemplateGalleryProps {
  open: boolean
  onClose: () => void
}

export function TemplateGallery({ open, onClose }: TemplateGalleryProps) {
  const loadTemplate = useStore(s => s.loadTemplate)

  function handleSelect(id: TemplateId) {
    const templates = {
      'url-shortener': urlShortenerTemplate,
      ecommerce: ecommerceTemplate,
      chat: chatTemplate,
    }
    const t = templates[id]
    loadTemplate(id, t.nodes, t.edges)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] mx-4"
          >
            <div className="bg-[#111] border border-[#222] rounded-[16px] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
                <div>
                  <div className="text-[14px] font-semibold text-white">Template Gallery</div>
                  <div className="text-[11px] text-[#555] mt-0.5">Load a pre-built architecture to explore</div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#555] hover:text-white hover:border-[#444] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Cards */}
              <div className="p-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <TemplateCard
                  id="url-shortener"
                  title="URL Shortener"
                  description="The classic scaling lesson. One database, then caching, then read replicas."
                  difficulty="Beginner"
                  nodeCount={6}
                  icon={<Link2 size={18} />}
                  onSelect={() => handleSelect('url-shortener')}
                />
                <TemplateCard
                  id="ecommerce"
                  title="E-commerce"
                  description="Product catalog, shopping cart, and checkout. CDN is the key unlock."
                  difficulty="Intermediate"
                  nodeCount={9}
                  icon={<ShoppingCart size={18} />}
                  onSelect={() => handleSelect('ecommerce')}
                />
                <TemplateCard
                  id="chat"
                  title="Chat App"
                  description="Real-time messaging. Write-heavy, bursty traffic. Rate limiting saves you."
                  difficulty="Intermediate"
                  nodeCount={7}
                  icon={<MessageSquare size={18} />}
                  onSelect={() => handleSelect('chat')}
                />
              </div>

              <div className="px-6 py-3 border-t border-[#1e1e1e] text-[11px] text-[#444]">
                Loading a template resets the canvas. Your current layout will be replaced.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
