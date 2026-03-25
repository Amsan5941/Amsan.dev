import { motion } from 'framer-motion'

export default function RecruiterQuickPack() {
  return (
    <section id="recruiter-pack" className="relative z-10 section-pad">
      <hr className="rule" />

      <div className="wrap section-shell p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.45 }}
          className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start"
        >
          <div>
            <span className="label tracking-widest">RECRUITER QUICK PACK</span>
            <h2 className="section-h2 font-display font-bold text-ink mt-3 mb-4">
              Short version, fast decision support
            </h2>
            <p className="text-secondary leading-relaxed max-w-2xl">
              CS student (TMU, class of 2026) with four production co-ops across AI, platform, and full-stack teams.
              I focus on building reliable backend systems, practical AI features, and measurable product improvements.
            </p>
          </div>

          <div className="card-standard p-6">
            <p className="label mb-4">1-click links</p>
            <div className="flex flex-col gap-3">
              <a href="/resume.pdf" download="Amsan_Naheswaran_Resume.pdf" className="btn-primary justify-center">
                Download Resume
              </a>
              <a href="https://linkedin.com/in/amsan-naheswaran" target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center">
                LinkedIn
              </a>
              <a href="https://github.com/Amsan5941" target="_blank" rel="noopener noreferrer" className="btn-secondary justify-center">
                GitHub
              </a>
              <a href="mailto:amsan5941@gmail.com" className="btn-secondary justify-center">
                Email
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
