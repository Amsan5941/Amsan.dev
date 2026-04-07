import { motion } from 'framer-motion'

const slideUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.5, delay, ease: 'easeOut' as const },
})

const BRIEF: [string, string][] = [
  ['role',      'SRE · Platform Engineering · AI Engineering'],
  ['available', 'May 2026 · Full-time · Open to relocation'],
  ['degree',    'Bachelor of Science in Computer Science · TMU · Class of 2026'],
  ['co-ops',    '4 production — PointClickCare · Celestica · Weston · Avolta'],
  ['award',     'PCC AI Trailblazer Award 2025 — 1st Place, All Intern Teams'],
  ['stack',     'Python · TypeScript · Kubernetes · FastAPI · RAG · LLMs'],
  ['location',  'Toronto, ON · open to relocation or remote'],
]

const STATS = [
  { n: '4',     l: 'Co-ops' },
  { n: 'May 26', l: 'Available' },
  { n: 'Beta', l: 'ForgeFit' },
  { n: '1st',   l: 'Hackathon' },
]

export default function RecruiterQuickPack() {
  return (
    <section id="recruiter-pack" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">

        <motion.div {...slideUp()} className="mb-10">
          <span className="label tracking-widest">RECRUITER QUICK PACK</span>
          <h2 className="section-h2 font-display font-bold text-ink mt-3">
            Everything you need, in one place.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

          {/* ── Terminal window ───────────────────────────── */}
          <motion.div {...slideUp(0.08)} className="dark-card terminal-card rounded-2xl overflow-hidden">
            {/* Chrome bar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="font-mono text-[11px] ml-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                hiring-brief.sh
              </span>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="font-mono text-sm mb-5" style={{ color: '#10b981' }}>
                $ hiring-brief --candidate amsan-naheswaran
              </p>
              <div className="space-y-2.5">
                {BRIEF.map(([key, val], i) => (
                  <motion.div
                    key={key}
                    {...slideUp(0.12 + i * 0.04)}
                    className="flex gap-3 font-mono text-xs leading-relaxed"
                  >
                    <span className="shrink-0 w-[68px] text-right" style={{ color: '#d4af37' }}>
                      {key}
                    </span>
                    <span style={{ color: 'rgba(148,163,184,0.35)' }}>│</span>
                    <span style={{ color: '#cbd5e1' }}>{val}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-1 font-mono text-sm">
                <span style={{ color: '#10b981' }}>$</span>
                <span
                  className="inline-block w-2 h-[14px] ml-1.5 align-middle animate-pulse"
                  style={{ background: '#10b981' }}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Right column ─────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Quick stats */}
            <motion.div {...slideUp(0.1)} className="dark-card rounded-2xl p-5 grid grid-cols-2 gap-4">
              {STATS.map(({ n, l }) => (
                <div key={l} className="text-center py-2">
                  <p
                    className="font-display font-bold"
                    style={{ fontSize: '1.6rem', color: '#d4af37', lineHeight: 1 }}
                  >
                    {n}
                  </p>
                  <p
                    className="font-mono text-[9px] uppercase tracking-widest mt-1"
                    style={{ color: '#64748b' }}
                  >
                    {l}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* 1-click links */}
            <motion.div {...slideUp(0.14)} className="dark-card rounded-2xl p-6">
              <p className="label mb-4">1-click access</p>
              <div className="flex flex-col gap-2.5">
                <a
                  href="/resume.pdf"
                  download="Amsan_Naheswaran_Resume.pdf"
                  className="btn-primary text-center justify-center"
                >
                  Download Resume
                </a>
                <a
                  href="https://www.linkedin.com/in/amsan-naheswaran-243407231/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center flex items-center gap-2"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Amsan5941"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary justify-center flex items-center gap-2"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="mailto:amsan5941@gmail.com"
                  className="btn-secondary text-center justify-center"
                >
                  Email
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
