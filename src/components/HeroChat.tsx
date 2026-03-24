import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import profileImg from './images/Gemini_Generated_Image_tki0bptki0bptki0.png'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const PILLS = [
  { label: 'Work', prompt: "Tell me about Amsan's work experience and co-ops" },
  { label: 'About me', prompt: 'Who is Amsan and what is he about?' },
  { label: 'Skills', prompt: "What is Amsan's tech stack and skills?" },
  { label: 'Contact', prompt: 'How can I get in touch with Amsan?' },
]

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: 'easeOut' as const },
})

export default function HeroChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => setIsLightMode(document.body.classList.contains('light'))
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, loading])

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
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error('API error')

      const data = await res.json()
      const reply = data.reply || 'Sorry, I could not generate a response right now.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later or reach out directly at amsan5941@gmail.com",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 z-10">
      <motion.div
        {...fade(0.2)}
        className="relative rounded-full mb-8"
        style={{
          width: 336,
          height: 336,
          border: '2px solid rgba(30,58,138,0.4)',
          boxShadow: '0 0 40px rgba(30,58,138,0.25), 0 0 80px rgba(30,58,138,0.1)',
        }}
      >
        <img
          src={profileImg}
          alt="Amsan Naheswaran"
          className="w-full h-full object-cover rounded-full"
        />
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            border: '1px solid rgba(30,58,138,0.2)',
            animationDuration: '3s',
          }}
        />
      </motion.div>

      <motion.h1
        {...fade(0.4)}
        className="font-display font-bold text-center mb-5 leading-[1.1] text-ink"
        style={{ fontSize: 'clamp(34px, 6vw, 64px)', maxWidth: '1020px' }}
      >
        Building AI & backend systems that ship to production.
      </motion.h1>

      <motion.p
        {...fade(0.5)}
        className="text-center text-secondary mb-8 font-medium"
        style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', maxWidth: '820px' }}
      >
        4 production co-ops across AI, platform, and full-stack teams. Shipped systems used by real users and available for full-time roles starting May 2026.
      </motion.p>

      <motion.div {...fade(0.55)} className="flex flex-wrap justify-center items-center gap-3 mb-10">
        <span className="hero-proof-pill">PointClickCare AI Trailblazer Award</span>
        <span className="hero-proof-pill">150+ daily users supported</span>
        <span className="hero-proof-pill">30% infrastructure cost reduction</span>
      </motion.div>

      <motion.div {...fade(0.6)} className="flex flex-wrap items-center justify-center gap-4 mb-14">
        <a href="#projects" className="btn-primary">
          View Projects
        </a>
        <a href="/resume.pdf" download="Amsan_Naheswaran_Resume.pdf" className="btn-secondary">
          Download Resume
        </a>
        <a href="#contact" className="btn-secondary">
          Contact
        </a>
      </motion.div>

      <motion.div
        {...fade(0.6)}
        className="w-full max-w-[780px] glass-card p-6 sm:p-8"
        style={{
          boxShadow: '0 0 50px rgba(30,58,138,0.12), 0 0 90px rgba(245,158,11,0.06)',
          minHeight: '380px',
        }}
      >
        <div className="mb-4">
          <p className="label">Amsan MCP</p>
          <p className="text-secondary text-sm mt-2">
            Ask for work history, projects, skills, and role fit in plain language.
          </p>
        </div>

        <div
          ref={chatRef}
          className="min-h-[180px] max-h-[280px] overflow-y-auto mb-5 chat-scroll"
        >
          {messages.length === 0 && !loading ? (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-muted text-sm text-center select-none">
                Ask me anything about Amsan...
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-ink'
                        : 'text-secondary'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(30,58,138,0.18), rgba(245,158,11,0.1))'
                          : 'var(--bg-surface)',
                      border:
                        msg.role === 'user'
                          ? '1px solid rgba(30,58,138,0.34)'
                          : '1px solid var(--card-border)',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map(delay => (
                        <span
                          key={delay}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)',
                            animationDelay: `${delay}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {PILLS.map(p => (
            <button
              key={p.label}
              onClick={() => send(p.prompt)}
              disabled={loading}
              className="group px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-wider
                         text-secondary border border-white/[0.15]
                         hover:text-white hover:border-transparent
                         transition-all duration-200
                         disabled:opacity-40 disabled:pointer-events-none"
              style={{ background: isLightMode ? 'rgba(30,58,138,0.06)' : 'rgba(255,255,255,0.03)' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-200"
          style={{
            background: isLightMode ? 'rgba(255,255,255,0.9)' : 'rgba(8,8,18,0.6)',
            border: inputFocused
              ? '1.5px solid rgba(30,58,138,0.5)'
              : isLightMode ? '1.5px solid rgba(30,58,138,0.2)' : '1.5px solid rgba(255,255,255,0.08)',
            boxShadow: inputFocused
              ? '0 0 20px rgba(30,58,138,0.15), inset 0 0 20px rgba(30,58,138,0.03)'
              : isLightMode ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask anything about Amsan..."
            disabled={loading}
            className="flex-1 bg-transparent outline-none text-sm text-ink
                       placeholder:text-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                       transition-all duration-200
                       disabled:opacity-30 disabled:pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)',
              boxShadow: !loading && input.trim()
                ? '0 0 16px rgba(30,58,138,0.4)'
                : 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-label="Send"
            >
              <path
                d="M2 8h12M10 4l4 4-4 4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </motion.div>

      <motion.div
        {...fade(1.2)}
        className="mt-12 flex flex-col items-center scroll-bounce"
      >
        <span className="label text-muted mb-2">Scroll to explore</span>
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          className="text-muted"
        >
          <path
            d="M7 1v12M1 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </section>
  )
}
