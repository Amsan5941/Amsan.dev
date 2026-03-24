import { motion } from 'framer-motion'

const secFade = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-80px' as const },
  transition:  { duration: 0.6, delay, ease: 'easeOut' as const },
})

const TECH = [
  { name: 'Next.js',     pill: 'pill-frontend' },
  { name: 'React',       pill: 'pill-frontend' },
  { name: 'TypeScript',  pill: 'pill-frontend' },
  { name: 'Python',      pill: 'pill-backend' },
  { name: 'FastAPI',     pill: 'pill-backend' },
  { name: 'AWS',         pill: 'pill-devops' },
  { name: 'Docker',      pill: 'pill-devops' },
  { name: 'PostgreSQL',  pill: 'pill-database' },
]

export default function Craft() {
  return (
    <section className="relative z-10 section-pad">
      <hr className="rule" />

      <div className="wrap pt-20 section-shell p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div {...secFade()}>
            <span className="label text-purple tracking-widest">THE CRAFT</span>
            <h2
              className="font-display font-bold text-ink mt-4 leading-[1.1]"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 60px)' }}
            >
              Building scalable{' '}
              <span className="grad-static">AI systems</span>
            </h2>
          </motion.div>

          <motion.div {...secFade(0.15)}>
            {/* Color-coded skill pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {TECH.map(t => (
                <span
                  key={t.name}
                  className={`${t.pill} px-3 py-1.5 rounded-full text-xs font-semibold
                              uppercase tracking-wider border transition-all duration-200
                              hover:scale-105`}
                >
                  {t.name}
                </span>
              ))}
            </div>

            <p className="text-secondary leading-relaxed mb-10 text-[17px]">
              I find &amp; deliver the best tech solution — from AI-powered APIs
              and microservices to cross-platform apps and cloud infrastructure
              that scales.
            </p>

            <div
              className="flex items-center gap-3 pt-6 rounded-lg px-4 py-3 ui-panel"
              style={{
                border: '1px solid var(--card-border)',
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)' }} />
              <span className="font-mono text-xs text-secondary">
                Toronto, Canada · 43.6532° N, 79.3832° W · EST
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
