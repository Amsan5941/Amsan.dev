import { useState } from 'react'
import { motion } from 'framer-motion'

interface Job {
  id: string
  company: string
  role: string
  period: string
  achievement: string
  bullets: string[]
}

const JOBS: Job[] = [
  {
    id: 'pcc',
    company: 'PointClickCare',
    role: 'SRE / AI Engineer Co-op',
    period: 'May 2024 – Aug 2024',
    achievement: '🏆 AI Trailblazer Award',
    bullets: [
      'Built Python and FastAPI pipelines for anomaly detection in millions of logs',
      'Designed AI/ML infrastructure with Elastic vector storage and RAG',
      'Crafted refined prompts and structured output generation for AI workflows',
    ],
  },
  {
    id: 'celestica',
    company: 'Celestica',
    role: 'Software Engineer Co-op',
    period: 'Sep 2023 – Dec 2023',
    achievement: '150+ daily users · 30% cost reduction',
    bullets: [
      'Built global SPC dashboards with C#, .NET, and Angular for 150+ users',
      'Led Azure Cloud migration, reducing on-prem infrastructure costs by 30%',
      'Resolved 47+ production-critical issues',
    ],
  },
  {
    id: 'weston',
    company: 'Weston Foods',
    role: 'Software Developer Co-op',
    period: 'Jan 2023 – Apr 2023',
    achievement: '95%+ data integrity',
    bullets: [
      'Automated SQL and Excel data pipelines ensuring 95%+ accuracy',
      'Designed ETL workflows processing 2,000+ monthly orders',
      'Reduced reporting errors by 25%',
    ],
  },
]

const slideInFromSide = (isRight: boolean, delay = 0) => ({
  initial: {
    opacity: 0,
    x: isRight ? 100 : -100,
  },
  whileInView: {
    opacity: 1,
    x: 0,
  },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
})

export default function Experience() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section id="experience" className="relative z-10 section-pad">
      <hr className="rule" />

      <div className="wrap">
        {/* Section heading with icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5 }}
          className="mb-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-4xl">💼</span>
          </div>
          <h2
            className="font-display font-bold grad-purple text-center leading-tight mx-auto mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 68px)', maxWidth: '800px' }}
          >
            Experience
          </h2>
          <p className="text-text-secondary text-lg">
            Production experience across AI, cloud, and full-stack engineering
          </p>
        </motion.div>

        {/* Vertical timeline */}
        <div className="relative max-w-4xl mx-auto py-12">
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-900 via-amber-500 to-blue-900 transform -translate-x-1/2 -z-10" />
          <div className="md:hidden absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-900 via-amber-500 to-blue-900 -z-10" />

          {/* Timeline entries */}
          <div className="space-y-20">
            {JOBS.map((job, index) => {
              const isRight = index % 2 === 0
              return (
                <motion.div
                  key={job.id}
                  {...slideInFromSide(isRight, index * 0.1)}
                  onMouseEnter={() => setHovered(job.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex flex-col md:${isRight ? 'flex-row-reverse' : 'flex-row'} items-start md:items-center gap-5 md:gap-8`}
                >
                  {/* Card */}
                  <div className="w-full md:w-[calc(50%-32px)] md:flex-shrink-0 md:pl-0 pl-14">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="relative group rounded-2xl p-8 overflow-hidden cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)',
                        boxShadow: hovered === job.id
                          ? '0 8px 40px rgba(30,58,138,0.4)'
                          : '0 4px 20px rgba(30,58,138,0.2)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {/* Arrow connector */}
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6"
                        style={{
                          overflow: 'visible',
                          right: isRight ? 'auto' : '-24px',
                          left: isRight ? '-24px' : 'auto',
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 text-white"
                          style={{
                            transform: isRight ? 'scaleX(-1)' : 'scaleX(1)',
                          }}
                        >
                          <polygon points="0,0 24,12 0,24" />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {job.role}
                        </h3>
                        <p className="text-white font-semibold mb-1 opacity-90">
                          {job.company}
                        </p>
                        <p className="text-sm text-white opacity-75 mb-4">
                          {job.period}
                        </p>
                        <p className="text-base font-semibold text-white mb-4">
                          {job.achievement}
                        </p>
                        <ul className="space-y-2">
                          {job.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="text-sm text-white opacity-85 flex gap-2"
                            >
                              <span className="text-white opacity-60 flex-shrink-0">
                                →
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center dot with icon */}
                  <div className="flex-shrink-0 flex items-center justify-center relative z-20 md:static absolute left-0 top-6">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-amber-500 flex items-center justify-center text-white text-xl font-bold border-4 border-blue-800"
                      style={{
                        boxShadow: '0 0 20px rgba(30,58,138,0.5)',
                        background: 'linear-gradient(135deg, #1e3a8a, #f59e0b)',
                      }}
                    >
                      💼
                    </motion.div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="hidden md:block w-[calc(50%-32px)]" />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-20"
        >
          <a
            href="/resume"
            className="btn-primary"
            style={{ gap: '8px' }}
          >
            View Full Resume
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
