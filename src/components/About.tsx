import { useState } from 'react'
import { motion } from 'framer-motion'

const CARDS = [
  {
    icon: '🎓',
    title: 'University',
    subtitle: 'Toronto Metropolitan',
    description:
      "Pursuing Honours BSc in Computer Science — focused on AI, systems programming, and software engineering at one of Canada's top programs.",
    detail: 'Class of 2026',
    color: '#1e3a8a',
  },
  {
    icon: '💼',
    title: 'Experience',
    subtitle: '4 Production Co-ops',
    description:
      'Built AI systems at PointClickCare, migrated cloud infra at Celestica, designed data pipelines at Weston Foods, and engineered banking platforms at TD Digital Banking.',
    detail: '3+ years',
    color: '#f59e0b',
  },
  {
    icon: '🏆',
    title: 'Competitions',
    subtitle: 'AI Trailblazer Award',
    description:
      '1st place at PointClickCare internal hackathon — built an AI-powered root cause analysis system with MCP, RAG, and vector search.',
    detail: 'Winner',
    color: '#1e3a8a',
  },
]

const secFade = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-80px' as const },
  transition:  { duration: 0.6, delay, ease: 'easeOut' as const },
})

export default function About() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="about" className="relative z-10 section-pad">
      <div className="wrap">
        <motion.div {...secFade()} className="mb-6 text-center">
          <span className="label text-purple tracking-widest">ABOUT</span>
          <h2
            className="font-display font-bold text-ink leading-tight heading-bar"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 64px)', marginTop: 6 }}
          >
            Building more than{' '}
            <span className="grad-static">software</span>
          </h2>
        </motion.div>

        <p className="section-lead mb-7">
          I combine product sense with strong engineering fundamentals to build systems that are reliable,
          scalable, and meaningful for real users.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              {...secFade(i * 0.1)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative rounded-2xl p-8 overflow-hidden transition-all duration-200 ui-panel"
              style={{
                border: `1.5px solid ${
                  hovered === i ? card.color + '66' : 'var(--card-border)'
                }`,
                transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered === i
                  ? `0 12px 40px ${card.color}20, 0 0 0 1px ${card.color}15`
                  : 'none',
              }}
            >
              {/* Top glow */}
              <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, ${card.color}20 0%, transparent 70%)`,
                  opacity: hovered === i ? 1 : 0,
                }}
              />

              <div className="relative z-10">
                <span className="text-3xl block mb-5">{card.icon}</span>

                <h3
                  className="font-display font-semibold text-xl mb-2 transition-colors duration-200"
                  style={{ color: hovered === i ? card.color : 'var(--text-primary)' }}
                >
                  {card.title}
                </h3>

                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-4 transition-colors duration-200"
                  style={{ color: hovered === i ? card.color : 'var(--text-muted)' }}
                >
                  {card.subtitle}
                </p>

                <p className="text-sm leading-relaxed text-secondary">
                  {card.description}
                </p>

                {/* Hover reveal */}
                <div
                  className="mt-6 flex items-center gap-2 transition-all duration-200"
                  style={{
                    opacity: hovered === i ? 1 : 0,
                    transform: hovered === i ? 'translateY(0)' : 'translateY(8px)',
                  }}
                >
                  <span
                    className="w-8 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: card.color }}
                  >
                    {card.detail}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
