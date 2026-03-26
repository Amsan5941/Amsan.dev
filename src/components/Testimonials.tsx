import { useState } from 'react'
import { motion } from 'framer-motion'

const slideUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.55, delay, ease: 'easeOut' as const },
})

const METRICS = [
  { value: '4',     label: 'PRODUCTION CO-OPS' },
  { value: '30%',   label: 'INFRASTRUCTURE COST SAVED' },
  { value: '95%+',  label: 'DATA INTEGRITY ACHIEVED' },
  { value: '1000+', label: 'APP STORE USERS' },
]

export default function Testimonials() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section id="recognition" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">

        <motion.div {...slideUp()} className="mb-10">
          <span className="label tracking-widest">SOCIAL PROOF &amp; RECOGNITION</span>
          <h2 className="section-h2 font-display font-bold text-ink mt-3">
            Built, shipped, recognized.
          </h2>
        </motion.div>

        {/* ── Mosaic grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.55fr] gap-5 items-start" style={{ perspective: '1200px' }}>

          {/* LEFT: Testimonial + ForgeFit */}
          <div className="flex flex-col gap-5">

            {/* LinkedIn Recommendation — Lorand Sari */}
            <motion.a
              href="https://www.linkedin.com/in/amsan-naheswaran-243407231/"
              target="_blank"
              rel="noopener noreferrer"
              {...slideUp(0.08)}
              onMouseEnter={() => setHovered('quote')}
              onMouseLeave={() => setHovered(null)}
              className="dark-card rounded-2xl p-6 flex flex-col gap-4"
              style={{
                border: hovered === 'quote' ? '1px solid rgba(10,102,194,0.55)' : '1px solid rgba(10,102,194,0.2)',
                boxShadow: hovered === 'quote' ? '0 12px 40px rgba(10,102,194,0.12)' : '0 4px 24px rgba(0,0,0,0.15)',
                transform: hovered === 'quote' ? 'rotate(0deg) translateY(-4px)' : 'rotate(-1.8deg)',
                transition: 'transform 0.3s ease, border-color 0.2s, box-shadow 0.2s',
                transformOrigin: 'top left',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {/* LinkedIn header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#0a66c2' }}>LinkedIn Recommendation</span>
                </div>
                <span className="font-mono text-[9px]" style={{ color: '#475569' }}>View ↗</span>
              </div>

              <span className="text-4xl select-none leading-none" style={{ color: '#d4af37', fontFamily: 'Georgia, serif', lineHeight: 1 }} aria-hidden>
                &ldquo;
              </span>
              <p className="dc-body text-sm leading-relaxed flex-1">
                Amsan played a key role in transforming our ARMA Web AI Application into the TRACE MCP,
                reducing Error Review Meetings from <strong style={{ color: '#d4af37' }}>80 minutes to 20 minutes</strong> a week.
                Any engineering organization would be fortunate to have him — innovative, driven, and well on his way
                to becoming an outstanding engineer.
              </p>
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'rgba(10,102,194,0.12)', color: '#0a66c2', border: '1px solid rgba(10,102,194,0.3)' }}>
                  LS
                </div>
                <div>
                  <p className="dc-head text-xs font-semibold">Lorand Sari</p>
                  <p className="dc-muted text-[11px]">Senior Manager, AIops/SRE · PointClickCare · Dec 2025</p>
                </div>
              </div>
            </motion.a>

            {/* ForgeFit App Store card */}
            <motion.div
              {...slideUp(0.14)}
              onMouseEnter={() => setHovered('forgefit')}
              onMouseLeave={() => setHovered(null)}
              className="dark-card rounded-2xl p-6 flex flex-col gap-4"
              style={{
                border: hovered === 'forgefit' ? '1px solid rgba(212,175,55,0.45)' : undefined,
                boxShadow: hovered === 'forgefit' ? '0 12px 40px rgba(212,175,55,0.1)' : '0 4px 24px rgba(0,0,0,0.15)',
                transform: hovered === 'forgefit' ? 'rotate(0deg) translateY(-4px)' : 'rotate(1.2deg)',
                transition: 'transform 0.3s ease, border-color 0.2s, box-shadow 0.2s',
                transformOrigin: 'top right',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>Live on App Store</p>
                  <h3 className="dc-head font-display font-bold text-lg">ForgeFit</h3>
                </div>
                <span className="text-2xl">📱</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ value: '1000+', label: 'Downloads' }, { value: '4.2★', label: 'Rating' }, { value: '150+', label: 'Reviews' }].map(m => (
                  <div key={m.label} className="rounded-lg p-3 text-center"
                    style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <p className="font-display font-bold text-base" style={{ color: '#d4af37', lineHeight: 1.2 }}>{m.value}</p>
                    <p className="dc-muted font-mono text-[9px] uppercase tracking-wider mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['React Native', 'Expo', 'Firebase', 'OpenAI'].map(t => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(245,158,11,0.07)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.18)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Award card */}
          <motion.div
            {...slideUp(0.06)}
            onMouseEnter={() => setHovered('award')}
            onMouseLeave={() => setHovered(null)}
            className="dark-card relative rounded-2xl overflow-hidden p-8 md:p-9 flex flex-col gap-5"
            style={{
              border: hovered === 'award' ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(212,175,55,0.28)',
              boxShadow: hovered === 'award'
                ? '0 0 70px rgba(212,175,55,0.14), 0 16px 60px rgba(0,0,0,0.2)'
                : '0 0 40px rgba(212,175,55,0.07)',
              transform: hovered === 'award' ? 'rotate(0deg) translateY(-4px)' : 'rotate(0.6deg)',
              transition: 'transform 0.3s ease, border-color 0.2s, box-shadow 0.2s',
              transformOrigin: 'center top',
              minHeight: 340,
            }}
          >
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(30,58,138,0.18) 0%, transparent 70%)' }} />

            <div className="relative z-10 flex flex-col gap-5 h-full">
              <div className="flex items-center gap-2 text-3xl">
                <span>🏆</span>
                <span style={{ opacity: 0.65, fontSize: '1.5rem' }}>🥇</span>
                <span style={{ opacity: 0.35, fontSize: '1.2rem' }}>⭐</span>
              </div>
              <div>
                <h3 className="dc-head font-display font-bold leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
                  PCC AI Trailblazer Award
                </h3>
                <p className="font-display font-bold mt-1" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: '#d4af37' }}>
                  2025
                </p>
              </div>
              <p className="dc-body text-sm leading-relaxed">
                Led the ARMA team to win Operational Excellence at the PointClickCare internal
                hackathon — built an AI-powered root cause analysis system integrating MCP, RAG,
                and vector search, beating every competing intern team.
              </p>
              <div style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }} />
              <div className="flex flex-wrap items-center gap-3 mt-auto">
                <span className="dc-muted font-mono text-[10px] tracking-widest">
                  POINTCLICKCARE · INTERNAL HACKATHON · 2025
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded"
                  style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.35)', whiteSpace: 'nowrap' }}>
                  1ST PLACE – All Intern Teams
                </span>
                <a
                  href="https://www.linkedin.com/in/amsan-naheswaran-243407231/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded"
                  style={{ background: 'rgba(10,102,194,0.1)', color: '#0a66c2', border: '1px solid rgba(10,102,194,0.3)', whiteSpace: 'nowrap', textDecoration: 'none' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Proof ↗
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Metrics row ─────────────────────────────────── */}
        <motion.div {...slideUp(0.2)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {METRICS.map((m, i) => (
            <div key={m.label}
              onMouseEnter={() => setHovered(`m${i}`)} onMouseLeave={() => setHovered(null)}
              className="dark-card rounded-xl p-5 text-center"
              style={{
                border: hovered === `m${i}` ? '1px solid rgba(212,175,55,0.4)' : undefined,
                boxShadow: hovered === `m${i}` ? '0 8px 28px rgba(212,175,55,0.1)' : undefined,
                transform: hovered === `m${i}` ? 'translateY(-3px)' : undefined,
                transition: 'all 0.2s ease',
              }}
            >
              <p className="font-display font-bold mb-1"
                style={{
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: '#d4af37', lineHeight: 1,
                  textShadow: hovered === `m${i}` ? '0 0 18px rgba(212,175,55,0.35)' : 'none',
                  transition: 'text-shadow 0.2s',
                }}>
                {m.value}
              </p>
              <p className="dc-muted font-mono text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── LinkedIn Social Proof Links ─────────────────── */}
        <motion.div {...slideUp(0.24)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Recommendations */}
          <a
            href="https://www.linkedin.com/in/amsan-naheswaran-243407231/details/recommendations/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered('recommendations')}
            onMouseLeave={() => setHovered(null)}
            className="dark-card rounded-xl p-6 flex items-center justify-between cursor-pointer"
            style={{
              border: hovered === 'recommendations' ? '1.5px solid rgba(10,102,194,0.5)' : '1px solid rgba(10,102,194,0.25)',
              boxShadow: hovered === 'recommendations' ? '0 12px 40px rgba(10,102,194,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
              transform: hovered === 'recommendations' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
            }}
          >
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: '#0a66c2' }}>LinkedIn Recommendations</p>
              <p className="dc-body text-sm mt-1">View endorsements from colleagues</p>
            </div>
            <span className="text-xl ml-4">→</span>
          </a>

          {/* Certifications */}
          <a
            href="https://www.linkedin.com/in/amsan-naheswaran-243407231/details/certifications/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered('certifications')}
            onMouseLeave={() => setHovered(null)}
            className="dark-card rounded-xl p-6 flex items-center justify-between cursor-pointer"
            style={{
              border: hovered === 'certifications' ? '1.5px solid rgba(106,90,205,0.5)' : '1px solid rgba(106,90,205,0.25)',
              boxShadow: hovered === 'certifications' ? '0 12px 40px rgba(106,90,205,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
              transform: hovered === 'certifications' ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
            }}
          >
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6a5acd' }}>Licenses & Certifications</p>
              <p className="dc-body text-sm mt-1">View my professional credentials</p>
            </div>
            <span className="text-xl ml-4">→</span>
          </a>
        </motion.div>

      </div>
    </section>
  )
}
