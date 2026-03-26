import { motion } from 'framer-motion'
import profileWebP from './images/profile-image.webp'
import profilePNG from './images/profile-image.png'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: 'easeOut' as const },
})

// Inline blur placeholder — shows instantly while image loads
const BLUR_PLACEHOLDER = 'data:image/webp;base64,UklGRqYBAABXRUJQVlA4IJoBAACwCACdASooACgAPtFkqVAoJaOipzgJIQAaCUAYfWYywA0tDPJqCnTH/MdEYqlXMIZHnBL21Lgjx3xy+0rWWmIp9mIhahAseaGcCIJdKkAA9wgWAFB/KOfyV2WsS3eTktHKG8b7V1zWaCTQlWI9f8Xt71U1h0mfH7ckq1eOOQQHmoUAHjc/b4wQMcug/P+9ZBuJyAiMoClvuIdcuc3gE5HWsCQE5YEjve4K4PZNKwEFh/192OF4Lz1iAhP64yC0IRHAHoNq/YA2m11VwU9E+pQf0jlBByBei3mEYFEqx0d5H5WnXnz7LLwPpvv9ZEQOLwadOm8War7UB3NiVHndtpduATTeWROjmmXgJR2zXVip6tiTsdDoIr5OGj/Fs2735dD23hE8JHhOETIGRKJKiTMupyQ9yBNWxiZBan+m4qutD3w9Gd7HvmBEi2djk70SNZKZgCos2hj8inYseyb/0wTC6zsqaT6ezMyGzkWV3E+UvDRqHI16cR3dKmmD4SoJf4hlIKy43Vua4BTmf5tYsBct1PbO7lCD1AAAAA=='

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
        <picture>
          <source srcSet={profileWebP} type="image/webp" />
          <img
            src={profilePNG}
            alt="Amsan Naheswaran"
            className="w-full h-full object-cover rounded-full"
            style={{ backgroundImage: `url('${BLUR_PLACEHOLDER}')`, backgroundSize: 'cover' }}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width={336}
            height={336}
          />
        </picture>
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
          style={{ color: '#10b981' }}>Open To Work</span>
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
        AI systems, cloud infrastructure, and full-stack products. Across healthcare, manufacturing, and hospitality. CS grad, TMU, Spring 2026.
      </motion.p>

      <motion.div {...fade(0.55)} className="flex flex-wrap justify-center items-center gap-3 mb-10">
        <span className="hero-proof-pill">PointClickCare AI Trailblazer Award</span>
        <span className="hero-proof-pill">150+ daily users supported</span>
        <span className="hero-proof-pill">30% infrastructure cost reduction</span>
      </motion.div>

      <motion.p
        {...fade(0.57)}
        className="text-center font-medium mb-8"
        style={{ fontSize: 'clamp(13px, 1.2vw, 15px)', maxWidth: '700px', color: 'var(--text-muted)', lineHeight: 1.75 }}
      >
        Targeting SRE, Platform Engineering, or AI Infrastructure roles — teams that run Kubernetes at scale,
        build internal developer platforms, or take LLM pipelines from prototype to production.
      </motion.p>

      <motion.div {...fade(0.6)} className="flex flex-wrap items-center justify-center gap-4 mb-6">
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

      {/* Social links */}
      <motion.div {...fade(0.65)} className="flex items-center gap-5 mb-14">
        <a
          href="https://www.linkedin.com/in/amsan-naheswaran-243407231/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-xs font-semibold transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#0a66c2')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </a>
        <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>|</span>
        <a
          href="https://github.com/Amsan5941"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-xs font-semibold transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
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
