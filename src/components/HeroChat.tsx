import { motion } from 'framer-motion'
import profileImg from './images/Gemini_Generated_Image_tki0bptki0bptki0.png'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: 'easeOut' as const },
})

export default function HeroChat() {
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

      <motion.div {...fade(0.32)} className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-mono font-semibold uppercase tracking-widest"
          style={{ color: '#10b981' }}>Available May 2026</span>
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
        AI systems, cloud infrastructure, and full-stack products — across healthcare, manufacturing, and hospitality. CS grad, TMU, Spring 2026.
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
        {...fade(1.2)}
        className="mt-4 flex flex-col items-center scroll-bounce"
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
