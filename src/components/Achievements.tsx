import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const secFade = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.55, delay, ease: 'easeOut' as const },
})

/* Count-up animation hook */
function useCountUp(target: string, duration = 1500) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !hasRun.current) {
          hasRun.current = true

          // Extract numeric part
          const num = parseFloat(target.replace(/[^0-9.]/g, ''))
          const suffix = target.replace(/[0-9.]/g, '')
          const start = performance.now()

          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(eased * num)
            setDisplay(current + suffix)
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { ref, display }
}

const STATS = [
  { target: '4',    label: 'Production co-ops',         color: '#1e3a8a' },
  { target: '30%',  label: 'Infrastructure cost saved',  color: '#f59e0b' },
  { target: '95%+', label: 'Data integrity achieved',    color: '#1e3a8a' },
]

export default function Achievements() {
  const counters = STATS.map(s => useCountUp(s.target))

  return (
    <section id="achievements" className="relative z-10 section-pad">
      <hr className="rule" />

      <div className="wrap">
        <div className="pt-8 md:pt-14 grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 lg:gap-20">
          <motion.div {...secFade()}>
            <span className="label text-purple tracking-widest">RECOGNITION</span>
          </motion.div>

          <motion.div {...secFade(0.1)}>
            {/* Award card */}
            <div
              className="relative rounded-2xl p-8 md:p-10 overflow-hidden section-shell"
              style={{
                background: 'linear-gradient(135deg, rgba(30,58,138,0.12) 0%, var(--bg-surface) 70%)',
                border: '1.5px solid rgba(30,58,138,0.25)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(30,58,138,0.16) 0%, transparent 70%)',
                }}
              />

              <div
                aria-hidden="true"
                className="font-display leading-none select-none relative z-10 mb-1"
                style={{
                  fontSize: '7rem',
                  fontWeight: 800,
                  lineHeight: 0.75,
                }}
              >
                <span className="grad-purple">"</span>
              </div>

              <h3
                className="font-display text-ink mb-4 leading-tight relative z-10"
                style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700 }}
              >
                PCC AI Trailblazer Award{' '}
                <span className="grad-static">2025</span>
              </h3>

              <p className="text-secondary leading-relaxed max-w-xl mb-8 relative z-10">
                Led the ARMA team to win Operational Excellence at the
                PointClickCare internal hackathon — built an AI-powered root
                cause analysis system integrating MCP, RAG, and vector search,
                beating every competing intern team.
              </p>

              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 border-t relative z-10"
                style={{ borderColor: 'rgba(30,58,138,0.2)' }}
              >
                <span className="label">PointClickCare</span>
                <span className="text-muted text-xs" aria-hidden>·</span>
                <span className="label">Internal Hackathon</span>
                <span className="text-muted text-xs" aria-hidden>·</span>
                <span className="label">2025</span>
                <span className="text-muted text-xs" aria-hidden>·</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple">
                  1st place — all intern teams
                </span>
              </div>
            </div>

            {/* Stats with count-up */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 mt-4 rounded-xl overflow-hidden"
              style={{ border: '1.5px solid var(--card-border)' }}
            >
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  ref={counters[i].ref}
                  className="p-6 text-center"
                  style={{
                    background: 'var(--bg-surface)',
                    borderRight: i < 2 ? '1.5px solid var(--card-border)' : 'none',
                  }}
                >
                  <div
                    className="font-display mb-1"
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: s.color,
                      lineHeight: 1,
                      textShadow: `0 0 30px ${s.color}40`,
                    }}
                  >
                    {counters[i].display}
                  </div>
                  <p className="label leading-snug" style={{ fontSize: '0.6rem' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
