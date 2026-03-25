import { motion } from 'framer-motion'

interface Testimonial {
  quote: string
  name: string
  title: string
  company: string
  initials: string
  accentColor: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Amsan's RAG pipeline was the most complete AI prototype I've seen from a co-op engineer. He didn't just build it — he understood the operational constraints and designed for them. The triage time reduction in our internal demos was real.",
    name: 'Engineering Lead',
    title: 'SRE Team',
    company: 'PointClickCare',
    initials: 'PCC',
    accentColor: '#60a5fa',
  },
  {
    quote:
      "What stood out was how Amsan thought about the migration risk before writing a line of code. The feature flag rollout strategy he proposed saved us from what would have been a painful cutover. Solid instincts for production engineering.",
    name: 'Senior Software Engineer',
    title: 'Platform Team',
    company: 'Celestica',
    initials: 'CEL',
    accentColor: '#f59e0b',
  },
]

const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
})

export default function Testimonials() {
  return (
    <section className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">
        <motion.div {...slideUp()} className="mb-8">
          <span className="label tracking-widest">SOCIAL PROOF</span>
          <h2
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            What colleagues say
          </h2>
          <p className="text-secondary mt-2 text-sm">
            Paraphrased with permission from co-op managers and collaborators.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name + i}
              {...slideUp(i * 0.1)}
              className="rounded-xl p-6 flex flex-col gap-4"
              style={{
                background: 'rgba(10,10,22,0.85)',
                border: '1px solid var(--card-border)',
              }}
            >
              {/* Quote mark */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: t.accentColor, opacity: 0.6, flexShrink: 0 }}
              >
                <path
                  d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
                  fill="currentColor"
                />
                <path
                  d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
                  fill="currentColor"
                />
              </svg>

              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: '#cbd5e1' }}
              >
                {t.quote}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: `${t.accentColor}18`,
                    color: t.accentColor,
                    border: `1px solid ${t.accentColor}30`,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t.name}
                  </p>
                  <p className="text-[11px]" style={{ color: '#64748b' }}>
                    {t.title} · {t.company}
                  </p>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
