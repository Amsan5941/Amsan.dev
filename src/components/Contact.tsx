import { useState } from 'react'
import { motion } from 'framer-motion'

const slideUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.5, delay, ease: 'easeOut' as const },
})

const METHODS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'amsan-naheswaran',
    cta: 'Connect with me',
    href: 'https://www.linkedin.com/in/amsan-naheswaran-243407231/',
    color: '#0a66c2',
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: 'Amsan5941',
    cta: 'View my repos',
    href: 'https://github.com/Amsan5941',
    color: '#6b7280',
    external: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
]

export default function Contact() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'success' | 'error'>('idle')
  const [sendMsg, setSendMsg] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSendState('error')
      setSendMsg('Please fill out name, email, and message.')
      return
    }

    try {
      setSending(true)
      setSendState('idle')
      setSendMsg('')

      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Unable to send message right now.')
      }

      setSendState('success')
      setSendMsg('Message sent successfully. I will get back to you soon.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setSendState('error')
      setSendMsg(err instanceof Error ? err.message : 'Unable to send message right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">

        <motion.div {...slideUp()} className="mb-10">
          <span className="label tracking-widest">CONTACT</span>
          <h2 className="section-h2 font-display font-bold text-ink mt-3">
            Let's build something.
          </h2>
          <p className="text-secondary mt-2 max-w-xl" style={{ fontSize: '0.95rem' }}>
            Seeking full-time SRE · Platform · AI Engineering roles from May 2026.
            Based in Toronto — open to relocation or remote.
          </p>
        </motion.div>

        {/* Contact method cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {METHODS.map((m, i) => (
            <motion.a
              key={m.id}
              {...slideUp(0.08 + i * 0.07)}
              href={m.href}
              target={m.external ? '_blank' : undefined}
              rel={m.external ? 'noopener noreferrer' : undefined}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              className="dark-card rounded-2xl p-7 flex flex-col gap-5"
              style={{
                border: hovered === m.id ? `1px solid ${m.color}55` : `1px solid ${m.color}18`,
                boxShadow: hovered === m.id
                  ? `0 16px 48px ${m.color}12, 0 4px 24px rgba(0,0,0,0.15)`
                  : '0 4px 24px rgba(0,0,0,0.12)',
                transform: hovered === m.id ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `${m.color}12`,
                  border: `1px solid ${m.color}22`,
                  color: m.color,
                }}
              >
                {m.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: m.color }}>
                  {m.label}
                </p>
                <p className="dc-head font-semibold text-sm leading-snug break-all">
                  {m.handle}
                </p>
              </div>

              {/* CTA */}
              <div>
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded inline-flex items-center gap-1.5"
                  style={{
                    background: `${m.color}10`,
                    color: m.color,
                    border: `1px solid ${m.color}28`,
                  }}
                >
                  {m.cta} ↗
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.form
          {...slideUp(0.2)}
          onSubmit={onSubmit}
          className="dark-card rounded-2xl p-6 md:p-7 mb-8"
          style={{ border: '1px solid var(--card-border)' }}
        >
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#d4af37' }}>
              Send Direct Email
            </p>
            <p className="dc-body text-sm mt-1">Use this form to send a message directly to amsan5941@gmail.com.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              type="email"
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Your message"
            rows={5}
            className="w-full rounded-xl px-4 py-3 text-sm mb-4"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-primary)',
              resize: 'vertical',
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={sending}
              className="btn-primary"
              style={{ opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            {sendState !== 'idle' && (
              <span
                className="font-mono text-[11px]"
                style={{ color: sendState === 'success' ? '#10b981' : '#ef4444' }}
              >
                {sendMsg}
              </span>
            )}
          </div>
        </motion.form>

        {/* Status bar */}
        <motion.div {...slideUp(0.28)} className="flex flex-wrap items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10b981' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#10b981' }} />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#10b981' }}>
            Available May 2026
          </span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>·</span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Toronto, ON · Open to relocation
          </span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>·</span>
          <a
            href="/resume.pdf"
            download="Amsan_Naheswaran_Resume.pdf"
            className="font-mono text-[11px] font-semibold"
            style={{ color: '#d4af37', textDecoration: 'none' }}
          >
            Download Resume ↓
          </a>
        </motion.div>

      </div>
    </section>
  )
}
