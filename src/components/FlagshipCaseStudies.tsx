import { motion } from 'framer-motion'

interface CaseStudy {
  title: string
  role: string
  problem: string
  solution: string
  impact: string
}

const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'PointClickCare Log Intelligence',
    role: 'SRE / AI Engineer Co-op',
    problem:
      'SRE teams were reviewing millions of noisy logs manually, making incident triage slow and inconsistent.',
    solution:
      'Built Python + FastAPI pipelines for anomaly detection and retrieval-augmented root-cause analysis using vector search and structured prompts.',
    impact:
      'Won internal AI Trailblazer recognition and improved triage speed in internal demos. Replace with your measured baseline-to-after reduction.',
  },
  {
    title: 'Celestica Cloud Migration + SPC Dashboard',
    role: 'Software Engineer Co-op',
    problem:
      'Legacy on-prem analytics workflows were expensive to maintain and difficult to scale for global teams.',
    solution:
      'Delivered a .NET + Angular SPC platform and led migration workloads to Azure, including monitoring and rollout support.',
    impact:
      'Supported 150+ daily users and drove a 30% infrastructure cost reduction.',
  },
  {
    title: 'RoutePilot AI Travel Planner',
    role: 'Founder / Full-stack Engineer',
    problem:
      'Travel planning tools provide static itineraries and ignore real-time constraints and user intent.',
    solution:
      'Developed a FastAPI + React planner with AI-assisted itinerary generation, route optimization, and conversational trip refinement.',
    impact:
      'Shipped an end-to-end production prototype; add activation, retention, and latency metrics from analytics.',
  },
]

export default function FlagshipCaseStudies() {
  return (
    <section id="case-studies" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap section-shell p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <span className="label tracking-widest">FLAGSHIP CASE STUDIES</span>
          <h2 className="font-display font-bold text-ink mt-3" style={{ fontSize: 'clamp(2.5rem, 5vw, 60px)' }}>
            Systems that shipped, scaled, and delivered outcomes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CASE_STUDIES.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="card-standard p-6"
            >
              <p className="label text-muted mb-3">{item.role}</p>
              <h3 className="text-ink font-semibold text-lg mb-4">{item.title}</h3>
              <p className="text-secondary text-sm leading-relaxed mb-3"><strong className="text-ink">Problem:</strong> {item.problem}</p>
              <p className="text-secondary text-sm leading-relaxed mb-3"><strong className="text-ink">Solution:</strong> {item.solution}</p>
              <p className="text-secondary text-sm leading-relaxed"><strong className="text-ink">Impact:</strong> {item.impact}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
