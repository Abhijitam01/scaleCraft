'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { QuizQuestion } from '@/lib/validateContent'

interface QuizProps {
  questions: QuizQuestion[]
  onComplete: (score: number) => void
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const question = questions[currentIdx]
  if (!question) return null

  function handleAnswer() {
    if (!selectedId || !question) return
    const isCorrect = selectedId === question.correctOptionId
    if (isCorrect) setScore(s => s + 1)
    setShowResult(true)
  }

  function handleNext() {
    if (!question) return
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setSelectedId(null)
      setShowResult(false)
    } else {
      setIsFinished(true)
      onComplete(score + (selectedId === question.correctOptionId ? 1 : 0))
    }
  }

  if (isFinished) {
    const passed = score >= questions.length / 2 // Simple pass logic
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-6 text-center"
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {passed ? <CheckCircle2 size={32} /> : <RotateCcw size={32} />}
        </div>
        <h3 className="text-[18px] font-bold text-white mb-2">{passed ? 'Quiz Passed!' : 'Try Again?'}</h3>
        <p className="text-[13px] text-[#888] mb-6">You got {score} out of {questions.length} questions correct.</p>
        <button
          onClick={() => {
            setCurrentIdx(0)
            setSelectedId(null)
            setShowResult(false)
            setScore(0)
            setIsFinished(false)
          }}
          className="px-6 py-2 rounded-full bg-indigo-500 text-white text-[13px] font-bold hover:bg-indigo-600 transition-colors"
        >
          Restart Quiz
        </button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Question {currentIdx + 1} / {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 w-4 rounded-full ${i <= currentIdx ? 'bg-indigo-500' : 'bg-[#222]'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-[14px] font-semibold text-white leading-relaxed">{question.question}</h3>

      <div className="flex flex-col gap-2 mt-2">
        {question.options.map(opt => {
          const isSelected = selectedId === opt.id
          const isCorrect = opt.id === question.correctOptionId
          const status = showResult ? (isCorrect ? 'correct' : (isSelected ? 'wrong' : 'idle')) : (isSelected ? 'selected' : 'idle')

          return (
            <button
              key={opt.id}
              disabled={showResult}
              onClick={() => setSelectedId(opt.id)}
              className={`w-full text-left p-3 rounded-[10px] border text-[12px] transition-all duration-200 ${
                status === 'correct' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                status === 'wrong' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' :
                status === 'selected' ? 'bg-indigo-500/10 border-indigo-500 text-white' :
                'bg-[#111] border-[#222] text-[#888] hover:border-[#444]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt.text}</span>
                {showResult && isCorrect && <CheckCircle2 size={14} />}
                {showResult && isSelected && !isCorrect && <XCircle size={14} />}
              </div>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-[8px] text-[11px] leading-relaxed mb-2 ${selectedId === question.correctOptionId ? 'bg-emerald-500/5 text-emerald-400/80' : 'bg-rose-500/5 text-rose-400/80'}`}
          >
            <div className="font-bold mb-1">{selectedId === question.correctOptionId ? 'Correct!' : 'Not quite...'}</div>
            {selectedId === question.correctOptionId ? question.explanation.correct : (selectedId ? question.explanation.wrongAnswers[selectedId] : '')}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2 text-right">
        {!showResult ? (
          <button
            disabled={!selectedId}
            onClick={handleAnswer}
            className="px-6 py-2 rounded-full bg-indigo-500 text-white text-[12px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 ml-auto px-6 py-2 rounded-full bg-white text-black text-[12px] font-bold hover:bg-[#eee] transition-colors"
          >
            {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
