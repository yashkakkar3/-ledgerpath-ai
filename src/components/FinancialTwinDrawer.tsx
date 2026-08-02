'use client'

import { useState, useRef, useEffect } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface FinancialTwinDrawerProps {
  financialProfile: any
}

export default function FinancialTwinDrawer({ financialProfile }: FinancialTwinDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    role: 'assistant',
    content: `Hey! I'm your LedgerPath AI Financial Twin. I'm synced with your Month #${financialProfile?.month_number || 1} profile (${financialProfile?.job || 'Career'}). Ask me any hypothetical scenario or money question!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input
    if (!textToSend.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    if (!customText) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/financial-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          financialProfile,
          chatHistory: updatedMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm here to help analyze your financial profile!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.warn('Financial Twin Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered a temporary connection glitch, but keep executing your financial plan!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'What if my salary increases by 50%?',
    'What if my savings dropped to 0?',
    'How does compound interest work?',
    'How should I manage my debt?',
  ]

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 btn-primary px-5 py-3.5 rounded-full text-white font-extrabold shadow-2xl shadow-indigo-500/40 flex items-center gap-2.5 hover:scale-105 transition-all duration-300 group border border-indigo-400/30"
        aria-label="Open AI Financial Twin"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform duration-300">♊</span>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">AI Financial Twin</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      </button>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsOpen(false)}></div>

          {/* Drawer Body */}
          <div className="w-full max-w-md bg-[#0b0f19] border-l border-white/10 shadow-2xl flex flex-col h-full animate-slideLeft">
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-indigo-500/30">
                  ♊
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    AI Financial Twin
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      Synced
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {financialProfile?.job || 'Simulation'} • Month #{financialProfile?.month_number || 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-sm transition-all"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestions Bar */}
            <div className="p-3 border-b border-white/5 bg-white/[0.01] flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-[11px] font-medium text-indigo-300 whitespace-nowrap transition-all disabled:opacity-50"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                        : 'bg-slate-900/90 text-gray-100 border border-white/10 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 font-mono px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium p-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-gray-400 text-[11px] font-mono ml-1">Analyzing profile math...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/10 bg-[#080b11]">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your Twin anything about your profile..."
                  disabled={loading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="btn-primary p-3 rounded-2xl text-white disabled:opacity-40 transition-all shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
