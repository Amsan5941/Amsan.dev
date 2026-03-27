import { motion } from 'framer-motion'

const JOBS = [
  {
    id: 'pcc',
    company: 'PointClickCare',
    logo: 'https://www.google.com/s2/favicons?domain=pointclickcare.com&sz=64',
    role: 'SRE / AI Engineer',
    type: 'Co-op',
    period: 'May – Aug 2024',
    accentColor: '#60a5fa',
    achievement: 'AI Trailblazer Award',
    bullets: [
      'Built Python + FastAPI log anomaly detection pipeline',
      'Designed RAG system with Elastic vector storage',
      'Reduced manual incident triage from hours to seconds',
    ],
  },
  {
    id: 'celestica',
    company: 'Celestica',
    logo: 'https://www.google.com/s2/favicons?domain=celestica.com&sz=64',
    role: 'Software Engineer',
    type: 'Co-op',
    period: 'Sep – Dec 2023',
    accentColor: '#f59e0b',
    achievement: '150+ users · 30% cost reduction',
    bullets: [
      'Built global SPC dashboards with C#, .NET, Angular',
      'Led Azure cloud migration with zero downtime',
      'Resolved 47+ production-critical issues',
    ],
  },
  {
    id: 'weston',
    company: 'Weston Foods',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQF4JpIgYJn-Mg/company-logo_200_200/company-logo_200_200/0/1630639893398/weston_foods__logo?e=2147483647&v=beta&t=73sC_rEpFUq2na26n_La_StvLWPthH5EyebDu102D6o',
    role: 'Software Engineer Intern (Data & Automation)',
    type: 'Co-op',
    period: 'Jan – Apr 2023',
    accentColor: '#a78bfa',
    achievement: '95%+ data integrity',
    bullets: [
      'Automated SQL + Excel ETL pipelines',
      'Processed 2,000+ monthly orders with 95%+ accuracy',
      'Reduced reporting errors by 25%',
    ],
  },
  {
    id: 'avolta',
    company: 'Avolta',
    logo: 'https://media.licdn.com/dms/image/v2/D560BAQGg_epiU9DjhA/company-logo_200_200/company-logo_200_200/0/1692304711296?e=2147483647&v=beta&t=d5kDwIZYuERYNUxmyz3uzp3Vb9ajSpumrlmCLxBW2wQ',
    role: 'Software Developer',
    type: 'Co-op',
    period: '2022',
    accentColor: '#34d399',
    achievement: 'Internal tooling shipped',
    bullets: [
      'Developed internal web tools for global operations team',
      'Improved workflow automation reducing manual steps',
      'Collaborated cross-functionally with business stakeholders',
    ],
  },
  {
    id: 'mcdonalds',
    company: "McDonald's",
    logo: 'https://www.google.com/s2/favicons?domain=mcdonalds.com&sz=64',
    role: 'Team Lead',
    type: 'Part-time',
    period: '2020 – 2022',
    accentColor: '#fb923c',
    achievement: 'Led team of 10+',
    bullets: [
      'Led a team of 10+ during high-volume shifts',
      'Trained and onboarded new team members',
      'Maintained operational standards and customer satisfaction',
    ],
  },
]

const slideUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.5, delay, ease: 'easeOut' as const },
})

export default function Experience() {
  return (
    <section id="experience" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">

        <motion.div {...slideUp()} className="mb-10">
          <span className="label tracking-widest">EXPERIENCE</span>
          <h2 className="section-h2 font-display font-bold text-ink mt-3">
            Work Experience
          </h2>
          <p className="text-secondary mt-2" style={{ fontSize: '0.95rem' }}>
            AI, cloud, platform, and full-stack — across healthcare, manufacturing, hospitality, and food tech.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-5">
          {JOBS.map((job, i) => (
            <motion.article
              key={job.id}
              {...slideUp(i * 0.08)}
              className="experience-card dark-card rounded-2xl p-6 flex flex-col gap-4"
            >
              {/* Top bar accent */}
              <div className="h-0.5 rounded-full w-12" style={{ background: job.accentColor }} />

              {/* Company + logo + period */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="dc-muted font-mono text-[10px] uppercase tracking-widest mb-1">
                    {job.type} · {job.period}
                  </p>
                  <h3 className="dc-head font-display font-bold text-lg leading-tight">{job.company}</h3>
                  <p className="text-sm font-medium mt-0.5" style={{ color: job.accentColor }}>{job.role}</p>
                </div>
                <img
                  src={job.logo}
                  alt={job.company}
                  width={44}
                  height={44}
                  className="rounded-lg flex-shrink-0"
                  style={{ opacity: 0.9, objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>

              {/* Achievement badge */}
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-wider self-start px-2.5 py-1 rounded"
                style={{
                  background: `${job.accentColor}12`,
                  color: job.accentColor,
                  border: `1px solid ${job.accentColor}30`,
                }}
              >
                {job.achievement}
              </span>

              {/* Bullets */}
              <ul className="space-y-2 flex-1">
                {job.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: job.accentColor }} />
                    <span className="dc-body">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div {...slideUp(0.35)} className="mt-8 flex justify-center">
          <a
            href="/resume.pdf"
            download="Amsan_Naheswaran_Resume.pdf"
            className="btn-primary"
          >
            Download Resume
          </a>
        </motion.div>

      </div>
    </section>
  )
}
