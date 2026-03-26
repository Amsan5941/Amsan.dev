import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Types ─────────────────────────────────────────────── */
interface LangEntry { name: string; color: string }

interface RepoEntry {
  name: string
  language: string
  langColor: string
  desc: string
  updated: string
  stars: number
  pinned: boolean
  url?: string
  languages?: LangEntry[]
}

interface PinnedProject {
  name: string
  slug: string
  language: string
  langColor: string
  desc: string
  impactLine: string
  stack: string[]
  stars: number
  forks: number
  demo?: string
  github: string
  languages?: LangEntry[]
}

interface HackathonProject {
  name: string
  event: string
  desc: string
  stack: string[]
  github?: string
  demo?: string
  problem: string
  approach: string
  status: string
}

/* ── Data ──────────────────────────────────────────────── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  Python:     '#3776ab',
  JavaScript: '#f1e05a',
  'C#':       '#178600',
  Kotlin:     '#A97BFF',
}

const ALL_REPOS: RepoEntry[] = [
  {
    name: 'ForgeFit',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'AI-driven fitness mobile app with personalized workout adaptation',
    updated: '2 days ago', stars: 12, pinned: true,
  },
  {
    name: 'voice-interview-coach',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'Real-time AI interview coaching with live voice feedback',
    updated: '1 week ago', stars: 8, pinned: true,
  },
  {
    name: 'RoutePilot',
    language: 'Python', langColor: LANG_COLORS.Python,
    desc: 'AI-powered trip planner with conversational itinerary updates',
    updated: '2 weeks ago', stars: 15, pinned: true,
  },
  {
    name: 'LuxuraSilks',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'Fashion e-commerce platform with Stripe checkout and admin',
    updated: '3 weeks ago', stars: 6, pinned: true,
  },
  {
    name: 'amsan-portfolio',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'Personal portfolio built with React, Three.js, and Claude AI',
    updated: '1 day ago', stars: 4, pinned: false,
  },
  {
    name: 'ARMA',
    language: 'Python', langColor: LANG_COLORS.Python,
    desc: 'AI root cause analysis system · MCP + RAG + vector search',
    updated: '1 month ago', stars: 9, pinned: false,
  },
  {
    name: 'data-pipeline-tools',
    language: 'Python', langColor: LANG_COLORS.Python,
    desc: 'ETL automation utilities for SQL and Excel data pipelines',
    updated: '3 months ago', stars: 3, pinned: false,
  },
  {
    name: 'spc-dashboard',
    language: 'C#', langColor: LANG_COLORS['C#'],
    desc: 'Global SPC dashboards for manufacturing analytics · Angular + .NET',
    updated: '8 months ago', stars: 2, pinned: false,
  },
]

const PINNED: PinnedProject[] = [
  {
    name: 'ForgeFit',
    slug: 'forgefit',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'AI-driven fitness mobile app with personalized workout adaptation, progress tracking, and social accountability features.',
    impactLine: '📱 1000+ App Store Downloads · ⭐ 4.2★ Rating · 150+ Reviews',
    stack: ['React Native', 'Expo', 'Firebase', 'OpenAI'],
    stars: 12, forks: 3,
    github: 'https://github.com/Amsan5941',
  },
  {
    name: 'Voice Interview Coach',
    slug: 'voice-interview-coach',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'Live voice-to-feedback pipeline providing near-real-time AI coaching for job interview preparation.',
    impactLine: 'Sub-2s voice-to-feedback latency using AWS Transcribe + Polly',
    stack: ['Next.js', 'Python', 'AWS Polly', 'Transcribe'],
    stars: 8, forks: 2,
    demo: '#',
    github: 'https://github.com/Amsan5941',
  },
  {
    name: 'RoutePilot',
    slug: 'routepilot',
    language: 'Python', langColor: LANG_COLORS.Python,
    desc: 'AI-powered trip planner with itinerary generation, route optimization, and conversational updates.',
    impactLine: 'Conversational edits without full itinerary regeneration',
    stack: ['React', 'FastAPI', 'Supabase', 'OpenAI'],
    stars: 15, forks: 5,
    demo: '#',
    github: 'https://github.com/Amsan5941',
  },
  {
    name: 'LuxuraSilks',
    slug: 'luxurasilks',
    language: 'TypeScript', langColor: LANG_COLORS.TypeScript,
    desc: 'Fashion e-commerce platform with Stripe checkout, inventory controls, and admin workflows.',
    impactLine: 'Full Stripe checkout + admin panel shipped end-to-end',
    stack: ['Next.js', 'Supabase', 'Stripe', 'Tailwind'],
    stars: 6, forks: 1,
    github: 'https://github.com/Amsan5941',
  },
  {
    name: 'ARMA / TRACE MCP',
    slug: 'arma',
    language: 'Python', langColor: LANG_COLORS.Python,
    desc: 'Award-winning AI log intelligence platform built at PointClickCare, integrating MCP, RAG, and Elastic vector search for automated root cause analysis and incident triage.',
    impactLine: '🏆 PCC AI Trailblazer Award · Error reviews: 80 min → 20 min/week',
    stack: ['Python', 'FastAPI', 'LangChain', 'Elasticsearch', 'MCP'],
    stars: 9, forks: 2,
    github: 'https://github.com/Amsan5941',
  },
  {
    name: 'SPC Platform',
    slug: 'spc-platform',
    language: 'C#', langColor: LANG_COLORS['C#'],
    desc: 'Global Statistical Process Control dashboards deployed across worldwide manufacturing facilities, with full Azure cloud migration and real-time anomaly monitoring.',
    impactLine: '150+ daily users · 47 production issues resolved · 30% infra cost saved',
    stack: ['C#', '.NET', 'Angular', 'Azure', 'Azure SQL'],
    stars: 2, forks: 0,
    github: 'https://github.com/Amsan5941',
  },
]

const HACKATHON_PROJECTS: HackathonProject[] = [
  {
    name: 'Voice Interview Coach',
    event: 'AWS Build On Generative AI',
    desc: 'Real-time voice coaching with sub-2s latency using AWS Nova.',
    stack: ['AWS Nova', 'AWS Transcribe', 'AWS Polly', 'Next.js', 'Python'],
    github: 'https://github.com/Amsan5941',
    problem: 'Interview prep tools give feedback asynchronously — you record, wait, then read a report. By then the moment is gone. The goal was live, in-ear coaching that felt like having a mentor in the room.',
    approach: 'AWS Transcribe streams partial transcripts in real time. A Lambda function evaluates filler words, pace, and answer structure against the question context using Nova. Polly converts the coaching note to speech and plays it back within the response window.',
    status: 'In progress — core pipeline working, fine-tuning feedback latency and prompt quality',
  },
  {
    name: 'GitLab Duo Agent',
    event: 'GitLab Duo Hackathon',
    desc: 'PR review agent that flags regressions and surfaces related issues.',
    stack: ['GitLab Duo SDK', 'Python', 'FastAPI', 'PostgreSQL'],
    github: 'https://github.com/Amsan5941',
    problem: 'Reviewers spend time on things a machine could catch — security anti-patterns, missing test coverage, and connections to open issues. The goal was an agent that handles the mechanical review so humans focus on architecture.',
    approach: 'Built on the GitLab Duo Agent Platform. The agent receives a webhook on PR open, diffs the changeset, runs static checks, queries the project issue graph for related open bugs, and posts a structured review comment with confidence scores.',
    status: 'In progress — diff parsing and issue correlation complete, security rule engine in development',
  },
  {
    name: 'Authorized to Act',
    event: 'Auth0 Hackathon',
    desc: 'Relationship-based access control for multi-tenant SaaS using Auth0 FGA.',
    stack: ['Auth0 FGA', 'Node.js', 'React', 'TypeScript'],
    github: 'https://github.com/Amsan5941',
    problem: 'Most SaaS authorization is hardcoded role checks scattered across the codebase. Changing who can do what requires a code deploy. Auth0 FGA lets you express permissions as a policy graph — no code change for permission changes.',
    approach: 'Modeled a multi-tenant workspace with owner, editor, and viewer roles using FGA\'s tuple-based graph. Built a Node.js middleware layer that intercepts API requests and evaluates the FGA policy before the handler runs — zero permission logic in application code.',
    status: 'In progress — policy model complete, middleware integration 80% done',
  },
  {
    name: 'Gradient AI',
    event: 'DigitalOcean Hackathon',
    desc: 'AI deployment assistant that surfaces infrastructure optimizations via CLI.',
    stack: ['DigitalOcean API', 'Python', 'OpenAI', 'React'],
    github: 'https://github.com/Amsan5941',
    problem: 'Infrastructure cost and performance issues are buried in dashboards most developers never open. The goal was a CLI tool that queries your DigitalOcean stack and surfaces concrete, actionable recommendations in plain English.',
    approach: 'Python CLI fetches current droplet, database, and load balancer state via the DO API. An OpenAI-powered reasoning layer compares the state against cost and performance heuristics and generates prioritized recommendations with one-command fixes.',
    status: 'In progress — API ingestion and recommendation engine complete, CLI UX in polish phase',
  },
]

/* ── Helpers ───────────────────────────────────────────── */
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
  </svg>
)


const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1z" />
  </svg>
)

const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
})

/* ── HackathonGrid ─────────────────────────────────────── */
function HackathonGrid({ projects }: { projects: HackathonProject[] }) {
  const [active, setActive] = useState<string | null>(null)

  const toggle = (name: string) => setActive(prev => prev === name ? null : name)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((proj, i) => {
          const isActive = active === proj.name
          return (
            <motion.article
              key={proj.name}
              {...slideUp(0.05 + i * 0.06)}
              onClick={() => toggle(proj.name)}
              className={`hackathon-card rounded-xl p-5 flex flex-col gap-3 select-none${isActive ? ' is-active' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded self-start"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                  {proj.event}
                </span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
                  style={{ color: '#10b981', flexShrink: 0, transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="hc-title font-mono text-sm font-semibold">{proj.name}</h3>
              <p className="hc-desc text-xs leading-relaxed flex-1">{proj.desc}</p>

              <div className="flex flex-wrap gap-1">
                {proj.stack.map(tech => (
                  <span key={tech} className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(16,185,129,0.06)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {active && (() => {
          const proj = projects.find(p => p.name === active)!
          return (
            <motion.div
              key={active}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="hackathon-detail grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>Problem</p>
                  <p className="hd-body text-xs leading-relaxed">{proj.problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>Approach</p>
                  <p className="hd-body text-xs leading-relaxed">{proj.approach}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>Status</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#10b981' }}>{proj.status}</p>
                  </div>
                  {proj.github && (
                    <a href={proj.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-xs font-semibold transition-colors mt-auto self-start hd-muted"
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                      onClick={e => e.stopPropagation()}
                    >
                      GitHub <ExternalIcon />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */
export default function Projects() {
  const [activeRepo, setActiveRepo] = useState<string | null>(null)
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const [repos, setRepos] = useState<RepoEntry[]>(ALL_REPOS)
  const [pinned, setPinned] = useState<PinnedProject[]>(PINNED)
  const [reposLoading, setReposLoading] = useState(true)
  const [selectedPin, setSelectedPin] = useState<PinnedProject | null>(null)
  const pinnedGridRef = useRef<HTMLDivElement>(null)
  const [sidebarMaxH, setSidebarMaxH] = useState<number | undefined>(undefined)

  useEffect(() => {
    fetch('/.netlify/functions/github-repos')
      .then(r => r.json())
      .then(data => {
        if (!data.error && data.repos && data.pinned) {
          setRepos(data.repos)
          setPinned(data.pinned)
        }
      })
      .catch(() => {/* keep hardcoded fallback */})
      .finally(() => setReposLoading(false))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedPin(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const el = pinnedGridRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => setSidebarMaxH(entry.contentRect.height))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="projects" className="relative z-10 section-pad">
      <hr className="rule" />
      <div className="wrap">

        {/* Header */}
        <motion.div {...slideUp()} className="mb-10">
          <span className="label tracking-widest">SELECTED PROJECTS</span>
          <div
            className="mt-4 font-mono text-sm flex flex-wrap items-center gap-1"
            style={{ color: '#94a3b8' }}
          >
            <span style={{ color: '#10b981' }}>amsan</span>
            <span>@github</span>
            <span style={{ color: 'var(--text-primary)' }}>:~</span>
            <span style={{ color: '#f59e0b' }}>&nbsp;$&nbsp;</span>
            <span style={{ color: 'var(--text-primary)' }}>ls -la ~/projects</span>
            <span className="animate-pulse" style={{ color: '#1e3a8a' }}>▋</span>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          {...slideUp(0.1)}
          className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5"
        >
          {/* ── LEFT: Repo sidebar ────────────────────────── */}
          <div
            className="repo-sidebar-bg rounded-xl overflow-hidden flex flex-col relative"
            style={{
              border: '1px solid var(--card-border)',
              maxHeight: sidebarMaxH,
            }}
          >
            {/* Skeleton shimmer while live data loads */}
            {reposLoading && (
              <div className="absolute inset-0 z-10 flex flex-col gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(10,10,22,0.85)' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-2 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div className="h-2 rounded w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div className="h-2 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  </div>
                ))}
              </div>
            )}
            {/* Sidebar header */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <span className="label" style={{ color: '#94a3b8' }}>Repositories</span>
              <span className="badge-role font-mono text-xs px-2 py-0.5 rounded-full">
                {repos.length}
              </span>
            </div>

            {/* Repo list */}
            <div className="overflow-y-auto flex-1 chat-scroll">
              {repos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url ?? `https://github.com/Amsan5941/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActiveRepo(repo.name)}
                  onMouseLeave={() => setActiveRepo(null)}
                  className="w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors duration-150 block"
                  style={{
                    background: activeRepo === repo.name ? 'rgba(30,58,138,0.1)' : 'transparent',
                    borderBottom: '1px solid var(--card-border)',
                    textDecoration: 'none',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#94a3b8', flexShrink: 0 }}>
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                      </svg>
                      <span
                        className="font-mono text-xs font-semibold truncate repo-item-name"
                        style={{ color: activeRepo === repo.name ? '#60a5fa' : undefined }}
                      >
                        {repo.name}
                      </span>
                      {repo.pinned && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', flexShrink: 0 }}
                        >
                          pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0" style={{ color: '#94a3b8' }}>
                      <StarIcon />
                      <span className="font-mono text-[10px]">{repo.stars}</span>
                    </div>
                  </div>

                  <p className="font-mono text-[10px] leading-snug line-clamp-1 repo-item-desc">
                    {repo.desc}
                  </p>

                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {/* All languages as colored dots */}
                    {(repo.languages && repo.languages.length > 0 ? repo.languages : [{ name: repo.language, color: repo.langColor }]).map(lang => (
                      <div key={lang.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: lang.color, boxShadow: `0 0 4px ${lang.color}66`, flexShrink: 0 }} />
                        <span className="font-mono text-[10px] repo-item-meta">{lang.name}</span>
                      </div>
                    ))}
                    <span className="font-mono text-[10px] repo-item-meta">· {repo.updated}</span>
                  </div>
                </a>
              ))}
            </div>

            {/* Sidebar footer */}
            <div
              className="px-4 py-3 border-t"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <a
                href="https://github.com/Amsan5941"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs transition-colors"
                style={{ color: '#60a5fa' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#60a5fa')}
              >
                View all repositories
                <ExternalIcon />
              </a>
            </div>
          </div>

          {/* ── RIGHT: 2×3 pinned cards ───────────────────── */}
          <div ref={pinnedGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            {pinned.map((proj, i) => (
              <motion.article
                key={proj.name}
                {...slideUp(0.05 + i * 0.07)}
                onMouseEnter={() => setHoveredPin(proj.name)}
                onMouseLeave={() => setHoveredPin(null)}
                onClick={() => setSelectedPin(proj)}
                className="pinned-card-bg rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer"
                style={{
                  border: hoveredPin === proj.name
                    ? '1px solid rgba(30,58,138,0.5)'
                    : '1px solid var(--card-border)',
                  boxShadow: hoveredPin === proj.name
                    ? '0 8px 28px rgba(30,58,138,0.18)'
                    : 'none',
                  transform: hoveredPin === proj.name ? 'translateY(-2px)' : 'none',
                }}
              >
                {/* Name row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#64748b', flexShrink: 0 }}>
                      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                    </svg>
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm font-semibold truncate transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {proj.name}
                    </a>
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245,158,11,0.25)',
                    }}
                  >
                    pinned
                  </span>
                </div>

                {/* Impact line */}
                <p
                  className="text-[11px] font-semibold"
                  style={{ color: '#f59e0b' }}
                >
                  {proj.impactLine}
                </p>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {proj.desc}
                </p>

                {/* Stack badges */}
                <div className="flex flex-wrap gap-1.5">
                  {proj.stack.map(tech => (
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

                {/* Footer: languages + stats + "click for details" hint */}
                <div className="flex items-center justify-between gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(proj.languages && proj.languages.length > 0
                      ? proj.languages
                      : [{ name: proj.language, color: proj.langColor }]
                    ).map(lang => (
                      <div key={lang.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: lang.color, boxShadow: `0 0 4px ${lang.color}66` }} />
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{lang.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1" style={{ color: '#94a3b8' }}>
                      <StarIcon /><span className="font-mono text-[10px]">{proj.stars}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    click for details ↗
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>

        {/* ── Currently Building ──────────────────────────── */}
        <motion.div {...slideUp(0.25)} className="mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981', boxShadow: '0 0 6px #10b98166' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Currently Building</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}>
              Hackathon Season 2025
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>· click any card for details</span>
          </div>

          <HackathonGrid projects={HACKATHON_PROJECTS} />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div {...slideUp(0.4)} className="mt-10 flex justify-center">
          <a
            href="https://github.com/Amsan5941"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-sm font-semibold transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1e3a8a')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            View all repositories
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>

      </div>

      {/* ── Pinned project detail modal ──────────────────────── */}
      <AnimatePresence>
        {selectedPin && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedPin(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 500,
                background: 'rgba(2,6,23,0.75)',
                backdropFilter: 'blur(6px)',
              }}
            />
            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="project-modal-sheet"
              style={{
                position: 'fixed', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 501,
                width: 'min(640px, calc(100vw - 32px))',
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto',
                border: '1px solid rgba(30,58,138,0.4)',
                borderRadius: '20px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,58,138,0.2)',
                padding: '32px',
              }}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedPin(null)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', width: 32, height: 32, cursor: 'pointer',
                  color: '#94a3b8', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div className="mb-5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  pinned project
                </span>
                <h3 className="font-display font-bold text-xl mt-1" style={{ color: '#f1f5f9' }}>
                  {selectedPin.name}
                </h3>
                {selectedPin.impactLine && (
                  <p className="font-mono text-xs mt-1" style={{ color: '#f59e0b' }}>
                    {selectedPin.impactLine}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
                {selectedPin.desc}
              </p>

              {/* Languages */}
              {(selectedPin.languages?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPin.languages!.map(lang => (
                      <div key={lang.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: lang.color }} />
                        <span className="font-mono text-[11px]" style={{ color: '#cbd5e1' }}>{lang.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stack */}
              {selectedPin.stack.length > 0 && (
                <div className="mb-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPin.stack.map(t => (
                      <span key={t} className="font-mono text-[11px] px-2.5 py-1 rounded"
                        style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <a href={selectedPin.github} target="_blank" rel="noopener noreferrer" className="btn-primary"
                  style={{ fontSize: 13, padding: '9px 20px' }}>
                  View on GitHub <ExternalIcon />
                </a>
                {selectedPin.demo && selectedPin.demo !== '#' && (
                  <a href={selectedPin.demo} target="_blank" rel="noopener noreferrer" className="btn-secondary"
                    style={{ fontSize: 13, padding: '9px 20px' }}>
                    Live Demo <ExternalIcon />
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
