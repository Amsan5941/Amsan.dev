import { motion } from 'framer-motion'

const secFade = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.55, delay, ease: 'easeOut' as const },
})

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 section-pad">
      <hr className="rule" />

      <div className="wrap section-shell p-8 md:p-12">
        <div className="pt-20 grid md:grid-cols-[200px_1fr] gap-12 lg:gap-20">
          <motion.div {...secFade()}>
            <span className="label text-purple tracking-widest">CONTACT</span>
          </motion.div>

          <motion.div {...secFade(0.1)}>
            <h2
              className="font-display leading-tight mb-6 grad-purple heading-bar"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 64px)', fontWeight: 700 }}
            >
              Let's work together.
            </h2>

            <p className="text-secondary leading-relaxed max-w-xl mb-10 text-[17px]">
              Seeking full-time roles from May 2026 in AI engineering, backend
              systems, or platform engineering. If you're building something that
              matters, I'd like to hear about it.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href="mailto:amsan5941@gmail.com" className="btn-primary">
                Email Me
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M9 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="/resume.pdf"
                download="Amsan_Naheswaran_Resume.pdf"
                className="btn-secondary"
              >
                Download Resume
              </a>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm pt-8 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <a
                href="https://linkedin.com/in/amsan-naheswaran"
                target="_blank"
                rel="noopener noreferrer"
                className="lnk font-medium"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://github.com/Amsan5941"
                target="_blank"
                rel="noopener noreferrer"
                className="lnk font-medium"
              >
                GitHub ↗
              </a>
            </div>

            <div className="flex items-center gap-2.5 mt-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#1e3a8a' }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#1e3a8a' }} />
              </span>
              <span className="label text-secondary">
                Toronto, Ontario · Open to relocation
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
