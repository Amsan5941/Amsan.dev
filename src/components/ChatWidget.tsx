import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const PILLS = [
  { label: 'Work', prompt: "Tell me about Amsan's work experience" },
  { label: 'Skills', prompt: "What is Amsan's tech stack?" },
  { label: 'Projects', prompt: "What projects has Amsan built?" },
  { label: 'Hire', prompt: "Is Amsan available and what roles is he targeting?" },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setUnread(false)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, I could not generate a response right now.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(true)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Reach Amsan directly at amsan5941@gmail.com" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-widget-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--card-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(30,58,138,0.1)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(30,58,138,0.15), rgba(245,158,11,0.08))',
                borderBottom: '1px solid var(--card-border)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)' }}
                >
                  AN
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink leading-none">Amsan MCP</p>
                  <p className="text-[10px] text-muted leading-none mt-0.5">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-border)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Close chat"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="overflow-y-auto chat-scroll px-4"
              style={{ height: 280, paddingTop: '12px', paddingBottom: '8px' }}
            >
              {messages.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-muted text-xs">Ask me about Amsan's work, skills, or availability.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                        style={{
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, rgba(30,58,138,0.18), rgba(245,158,11,0.1))'
                            : 'var(--bg-elevated)',
                          border: msg.role === 'user'
                            ? '1px solid rgba(30,58,138,0.3)'
                            : '1px solid var(--card-border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl px-3.5 py-2.5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--card-border)' }}>
                        <div className="flex gap-1">
                          {[0, 150, 300].map(d => (
                            <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                              style={{ background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)', animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-1.5 px-4 py-2" style={{ borderTop: '1px solid var(--card-border)' }}>
              {PILLS.map(p => (
                <button
                  key={p.label}
                  onClick={() => send(p.prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-150 disabled:opacity-40"
                  style={{
                    color: 'var(--text-muted)',
                    border: '1px solid var(--card-border)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(30,58,138,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={e => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2 px-3 py-2.5 mx-3 mb-3 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--card-border)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-xs text-ink placeholder:text-muted disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)' }}
                aria-label="Send"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M10 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ───────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed z-[200] flex items-center justify-center"
        style={{
          bottom: 24,
          left: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)',
          boxShadow: open
            ? '0 4px 20px rgba(30,58,138,0.5)'
            : '0 4px 20px rgba(30,58,138,0.4), 0 0 0 0 rgba(30,58,138,0)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? 'Close chat' : 'Open Amsan MCP chat'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg key="close" width="18" height="18" viewBox="0 0 18 18" fill="none"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <path d="M2 2l14 14M16 2L2 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" width="22" height="22" viewBox="0 0 24 24" fill="none"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Unread dot */}
        {unread && !open && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </motion.button>
    </>
  )
}
