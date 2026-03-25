import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CaseStudy {
  title: string
  role: string
  company: string
  period: string
  impactLine: string
  stack: string[]
  problem: string
  architecture: string
  tradeoffs: string
  impact: string
  lessons: string
}

const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'Log Intelligence & AI Triage',
    role: 'SRE / AI Engineer Co-op',
    company: 'PointClickCare',
    period: 'May – Aug 2024',
    impactLine: 'Won internal AI Trailblazer Award · replaced hours of manual triage with a single conversational query',
    stack: ['Python', 'FastAPI', 'Elasticsearch', 'RAG', 'OpenAI'],
    problem:
      'SRE teams were drowning in alert noise from millions of daily log events. Correlating failures across distributed services required deep domain knowledge from every on-call engineer — a process that regularly stretched MTTR into hours and caused on-call fatigue. The real problem was not the volume of logs but the absence of structured reasoning on top of them.',
    architecture:
      'Built a Python + FastAPI ingestion pipeline that normalized structured and unstructured log streams from multiple sources. Embeddings were generated per log entry and stored in an Elastic vector index, enabling semantic similarity search across incident history. The RAG layer paired semantic retrieval with structured prompt templates — each query returned a ranked list of root-cause hypotheses grounded in actual historical incidents, not hallucinations.',
    tradeoffs:
      'Chose Elasticsearch over purpose-built vector databases (Pinecone, Weaviate) to leverage the team\'s existing operational knowledge — a deliberate "boring tech" decision that reduced adoption friction. Prioritized recall over precision in retrieval: surface five plausible causes and let the LLM rank them, rather than risk missing the real cause with aggressive filtering. Enforced structured JSON output from the model to make downstream automation reliable, at the cost of some response flexibility.',
    impact:
      'Won the PointClickCare internal AI Trailblazer Award — the first co-op to receive it. Internal demos on synthetic incident scenarios showed the system compressing a multi-step manual lookup into a 10-second query. Engineering leads flagged it as the strongest SRE tooling prototype built by a co-op in the team\'s history.',
    lessons:
      'Prompt engineering is engineering. Iterating on output schemas and few-shot examples had more leverage than changing models or tuning parameters. Operational buy-in matters as much as technical quality — getting on-call engineers to demo the tool early created advocates who drove adoption faster than any documentation could.',
  },
  {
    title: 'SPC Platform & Azure Cloud Migration',
    role: 'Software Engineer Co-op',
    company: 'Celestica',
    period: 'Sep – Dec 2023',
    impactLine: '150+ daily users across global facilities · 30% infrastructure cost reduction · zero unplanned downtime',
    stack: ['C#', '.NET', 'Angular', 'Azure SQL', 'Docker'],
    problem:
      'Celestica\'s manufacturing analytics were fragmented across 15+ facility-level, on-premises tools with no unified view. SPC (statistical process control) dashboards were siloed, engineers couldn\'t compare process quality across regions, and aging on-prem hardware was driving infrastructure costs up with every refresh cycle. The mandate was to consolidate and migrate — without disrupting the 150+ engineers who relied on the dashboards daily.',
    architecture:
      'Designed a centralized .NET + Angular SPC platform with a data model that normalized inputs from all facility sources into a single schema. The Angular frontend used lazy-loaded route modules to keep initial load times low across slow factory-floor networks. For the Azure migration, containerized the .NET APIs using Docker, provisioned Azure SQL Managed Instances, and built a data sync layer that ran both environments in parallel during the transition window.',
    tradeoffs:
      'Chose Angular over React to match the team\'s existing frontend expertise — faster onboarding and fewer support incidents in production outweighed the marginal DX gains of switching. Used feature flags over a hard cutover: each facility was migrated independently with a rollback switch, adding development overhead but eliminating the risk of a botched global cutover on a system 150+ people depended on daily.',
    impact:
      '30% reduction in on-premises infrastructure costs post-migration. 150+ daily active users across global facilities with a unified dashboard experience. Resolved 47 production-critical issues during the migration window. Zero unplanned downtime across the full cutover period.',
    lessons:
      'Migration is 40% technical and 60% coordination. The hardest part wasn\'t moving data — it was convincing facility leads to trust the new system before the old one was decommissioned. A long parallel-run window felt slow but was the right call. Never underestimate the resistance to removing a tool people have used for years, even if the replacement is objectively better.',
  },
  {
    title: 'RoutePilot — Conversational Trip Planner',
    role: 'Founder / Full-stack Engineer',
    company: 'Personal Project',
    period: '2024',
    impactLine: 'End-to-end production prototype with conversational itinerary editing and real-time constraint handling',
    stack: ['React', 'FastAPI', 'Supabase', 'OpenAI', 'Google Maps API'],
    problem:
      'Most travel planning tools generate static itineraries. Change your budget mid-trip, get rained out on day 3, or decide to stay an extra night — and you\'re rebuilding from scratch. The problem was that no tool treated an itinerary as a living document that users could refine through natural conversation rather than form fields.',
    architecture:
      'FastAPI backend with a conversational state machine that persisted trip context across sessions in Supabase. The frontend used React with a split-panel layout: map view (Google Maps API) and itinerary panel side by side. OpenAI function calling drove structured itinerary generation — each day returned a typed JSON object (hotel, activities, timing, coordinates) rather than prose, so the frontend could render and diff updates without parsing. Partial update logic allowed "swap the morning activity on day 2" without regenerating the full plan.',
    tradeoffs:
      'Used OpenAI function calling over free-form generation to get reliable structured output. The tradeoff is rigidity — the schema constrains what the model can express — but the alternative (parsing prose into a typed structure) was fragile and error-prone at scale. Chose Supabase over raw Postgres to accelerate early schema iteration with built-in realtime subscriptions, accepting some query flexibility loss for development speed.',
    impact:
      'Shipped a fully functional production prototype with complete CRUD trip management, conversational refinement, and map-integrated itinerary views. Validated the core UX assumption: users preferred editing existing plans through chat over regenerating from scratch.',
    lessons:
      'Partial update semantics — changing one day of a 7-day trip without touching the rest — are significantly harder than full regeneration. Context window management and maintaining consistency across partial edits consumed most of the engineering time. If starting over, I\'d model "trip state" as an explicit first-class data structure from day one, not retrofit it after building the generation pipeline.',
  },
]

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.25s ease',
      flexShrink: 0,
    }}
  >
    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Section = ({ label, content }: { label: string; content: string }) => (
  <div className="mb-5 last:mb-0">
    <p
      className="text-[10px] font-bold uppercase tracking-widest mb-2"
      style={{ color: '#f59e0b' }}
    >
      {label}
    </p>
    <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
      {content}
    </p>
  </div>
)

export default function FlagshipCaseStudies() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (title: string) =>
    setExpanded(prev => (prev === title ? null : title))

  return (
    <section id="case-studies" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <span className="label tracking-widest">FLAGSHIP CASE STUDIES</span>
          <h2
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 60px)' }}
          >
            Systems that shipped, scaled, and delivered outcomes
          </h2>
          <p className="text-secondary mt-4 max-w-2xl" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
            Three projects I can speak to at depth — covering architecture decisions, tradeoffs I made under real constraints, and what I'd do differently.
          </p>
        </motion.div>

        <div className="space-y-4">
          {CASE_STUDIES.map((item, index) => {
            const isOpen = expanded === item.title
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' as const }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(10,10,22,0.85)',
                  border: isOpen
                    ? '1px solid rgba(30,58,138,0.5)'
                    : '1px solid var(--card-border)',
                  boxShadow: isOpen ? '0 8px 32px rgba(30,58,138,0.15)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Header — always visible */}
                <button
                  onClick={() => toggle(item.title)}
                  className="w-full text-left px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    {/* Role + company + period */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(30,58,138,0.2)',
                          color: '#93c5fd',
                          border: '1px solid rgba(96,165,250,0.25)',
                        }}
                      >
                        {item.role}
                      </span>
                      <span className="text-xs font-mono" style={{ color: '#64748b' }}>
                        {item.company} · {item.period}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-display font-semibold text-xl mb-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h3>

                    {/* Impact line */}
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: '#f59e0b' }}
                    >
                      {item.impactLine}
                    </p>

                    {/* Stack badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.stack.map(tech => (
                        <span
                          key={tech}
                          className="font-mono text-[10px] px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(245,158,11,0.08)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245,158,11,0.2)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <div
                    className="flex items-center gap-2 shrink-0 mt-1"
                    style={{ color: '#64748b' }}
                  >
                    <span className="text-xs font-mono">
                      {isOpen ? 'Collapse' : 'Read case study'}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </div>
                </button>

                {/* Expanded body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="px-6 pb-7 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0"
                        style={{ borderTop: '1px solid var(--card-border)' }}
                      >
                        <div className="pt-6">
                          <Section label="Problem" content={item.problem} />
                          <Section label="Architecture" content={item.architecture} />
                        </div>
                        <div className="pt-6">
                          <Section label="Tradeoffs" content={item.tradeoffs} />
                          <Section label="Impact" content={item.impact} />
                          <Section label="Lessons Learned" content={item.lessons} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
