import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContribDay {
  contributionCount: number
  date: string
}

interface ContribWeek {
  contributionDays: ContribDay[]
}

interface Language {
  name: string
  color: string | null
  percent: number
}

interface ContribData {
  weeks: ContribWeek[]
  totalContributions: number
  languages: Language[]
}

type ViewState = 'loading' | 'no_token' | 'error' | 'loaded'

// ─── Animation ────────────────────────────────────────────────────────────────

const secFade = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.6, ease: 'easeOut' as const },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', '']

function flatDays(weeks: ContribWeek[]): ContribDay[] {
  return weeks.flatMap(w => w.contributionDays)
}

function calcCurrentStreak(weeks: ContribWeek[]): number {
  const all = flatDays(weeks)
  const days = all.length > 1 ? all.slice(0, -1) : all // exclude today — it may be incomplete
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) streak++
    else break
  }
  return streak
}

function calcLongestStreak(weeks: ContribWeek[]): number {
  let longest = 0, current = 0
  for (const d of flatDays(weeks)) {
    if (d.contributionCount > 0) { current++; longest = Math.max(longest, current) }
    else current = 0
  }
  return longest
}

function calcBestDay(weeks: ContribWeek[]): number {
  return Math.max(0, ...flatDays(weeks).map(d => d.contributionCount))
}

function cellColor(count: number, isLight: boolean): string {
  if (count === 0) return isLight ? '#e2e8f0' : '#161630'
  if (count <= 3) return 'rgba(6, 182, 212, 0.30)'
  if (count <= 6) return 'rgba(6, 182, 212, 0.65)'
  return '#06b6d4'
}

function activityLabel(total: number): { text: string; color: string } {
  const avg = total / 365
  if (avg > 3) return { text: 'Very Active', color: '#10b981' }
  if (avg >= 1) return { text: 'Active', color: '#06b6d4' }
  return { text: 'Moderate', color: '#f59e0b' }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function getMonthLabel(weekIdx: number, weeks: ContribWeek[]): string | null {
  const firstDay = weeks[weekIdx]?.contributionDays[0]
  if (!firstDay) return null
  const date = new Date(firstDay.date + 'T00:00:00')
  if (weekIdx === 0) return MONTHS[date.getMonth()]
  const prevFirst = weeks[weekIdx - 1]?.contributionDays[0]
  if (!prevFirst) return null
  return date.getMonth() !== new Date(prevFirst.date + 'T00:00:00').getMonth()
    ? MONTHS[date.getMonth()]
    : null
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GitHubContributions() {
  const [state, setState] = useState<ViewState>('loading')
  const [data, setData] = useState<ContribData | null>(null)
  const [isLightMode, setIsLightMode] = useState(false)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)

  // Theme detection — mirrors SkillsGlobe.tsx pattern
  useEffect(() => {
    const update = () => setIsLightMode(document.body.classList.contains('light'))
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  // Data fetch
  useEffect(() => {
    fetch('/.netlify/functions/github-contributions')
      .then(r => r.json())
      .then((json: ContribData & { error?: string }) => {
        if (json.error === 'no_token') { setState('no_token'); return }
        if (json.error === 'api_error') { setState('error'); return }
        setData(json as ContribData)
        setState('loaded')
      })
      .catch(() => setState('error'))
  }, [])

  const lightShell = isLightMode ? {
    border: '2px solid rgba(30,58,138,0.35)',
    boxShadow: '0 12px 60px rgba(30,58,138,0.18), 0 4px 20px rgba(0,0,0,0.12)',
  } : {}

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <section className="section-pad">
        <div className="wrap">
          <motion.div {...secFade} className="section-shell p-8" style={lightShell}>
            <div className="animate-pulse space-y-6">
              <div className="flex justify-between">
                <div className="h-4 rounded w-36" style={{ background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)' }} />
                <div className="h-4 rounded w-20" style={{ background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)' }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl" style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
              <div className="h-36 rounded-xl" style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />
              <div className="h-8 rounded" style={{ background: isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }} />
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // ── No Token ─────────────────────────────────────────────────────────────────
  if (state === 'no_token') {
    return (
      <section className="section-pad">
        <div className="wrap">
          <motion.div {...secFade} className="section-shell p-8 text-center" style={lightShell}>
            <p className="label mb-3">GITHUB ACTIVITY</p>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 14 }}>
              GitHub contribution data will appear here after deployment
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <section className="section-pad">
        <div className="wrap">
          <motion.div {...secFade} className="section-shell p-8 text-center" style={lightShell}>
            <p className="label mb-3">GITHUB ACTIVITY</p>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontSize: 14 }}>
              Could not load contribution data
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  // ── Loaded ───────────────────────────────────────────────────────────────────
  if (!data) return null // defensive; unreachable given state machine above

  const { weeks, totalContributions, languages } = data
  const currentStreak = calcCurrentStreak(weeks)
  const longestStreak = calcLongestStreak(weeks)
  const bestDay       = calcBestDay(weeks)
  const activity      = activityLabel(totalContributions)

  const stats = [
    { label: 'Contributions', value: totalContributions.toLocaleString(), sub: 'this year',     color: '#f59e0b' },
    { label: 'Current Streak', value: String(currentStreak),              sub: 'days',          color: '#06b6d4' },
    { label: 'Longest Streak', value: String(longestStreak),              sub: 'days',          color: '#a855f7' },
    { label: 'Best Day',       value: String(bestDay),                    sub: 'contributions', color: '#ec4899' },
  ]

  return (
    <section className="section-pad">
      <div className="wrap">
        <motion.div {...secFade} className="section-shell p-8" style={lightShell}>

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="label flex-1">GITHUB ACTIVITY</span>
            <span
              className="text-xs font-mono px-3 py-1 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              @Amsan5941
            </span>
            <span
              className="text-xs font-mono font-semibold px-3 py-1 rounded-full"
              style={{
                background: `${activity.color}22`,
                color: activity.color,
                border: `1px solid ${activity.color}55`,
              }}
            >
              {activity.text}
            </span>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div
                key={s.label}
                className="glass-card p-4 rounded-xl text-center"
                style={{
                  borderColor: `${s.color}44`,
                  ...(isLightMode ? { background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${s.color}33` } : {}),
                }}
              >
                <div
                  className="font-display font-bold"
                  style={{ fontSize: 32, color: s.color, lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-1 text-xs font-mono uppercase tracking-wider"
                  style={{ color: isLightMode ? '#1e293b' : '#94a3b8' }}
                >
                  {s.label}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: isLightMode ? '#475569' : '#94a3b8', opacity: isLightMode ? 1 : 0.7 }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Heatmap ── */}
          <div className="mb-6">
            <div
              ref={heatmapRef}
              className="relative overflow-x-auto"
              style={{ paddingBottom: 4 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>

                {/* Day labels column */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginRight: 6,
                    paddingTop: 20,
                    flexShrink: 0,
                  }}
                >
                  {DAY_LABELS.map((label, i) => (
                    <div
                      key={i}
                      style={{
                        height: 11,
                        fontSize: 9,
                        color: isLightMode ? '#1e293b' : '#64748b',
                        fontFamily: 'JetBrains Mono, monospace',
                        lineHeight: '11px',
                        width: 24,
                        textAlign: 'right',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Grid: month labels + week columns */}
                <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

                  {/* Month labels */}
                  <div style={{ display: 'flex', gap: 2, marginBottom: 4, height: 16 }}>
                    {weeks.map((week, wi) => {
                      const label = getMonthLabel(wi, weeks)
                      return (
                        <div
                          key={wi}
                          style={{
                            width: 11,
                            fontSize: 9,
                            color: 'var(--text-muted)',
                            fontFamily: 'JetBrains Mono, monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'visible',
                          }}
                        >
                          {label ?? ''}
                        </div>
                      )
                    })}
                  </div>

                  {/* Week columns */}
                  <div style={{ display: 'flex', gap: 2 }}>
                    {weeks.map((week, wi) => (
                      <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {week.contributionDays.map((day, di) => (
                          <div
                            key={di}
                            style={{
                              width: 11,
                              height: 11,
                              borderRadius: 2,
                              background: cellColor(day.contributionCount, isLightMode),
                              cursor: day.contributionCount > 0 ? 'pointer' : 'default',
                              flexShrink: 0,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect()
                              setTooltip({
                                text: `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${formatDate(day.date)}`,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 36,
                              })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {tooltip && (
                <div
                  className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-full text-xs font-mono"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translate(-50%, -100%)',
                    background: 'linear-gradient(135deg, rgba(2,6,23,0.92), rgba(15,23,42,0.9))',
                    border: '1px solid rgba(6,182,212,0.67)',
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  {tooltip.text}
                </div>
              )}
            </div>
          </div>

          {/* ── Language Bar ── */}
          {languages.length > 0 && (
            <div>
              <p className="label mb-3" style={{ fontSize: 11 }}>TOP LANGUAGES</p>

              {/* Segmented bar */}
              <div
                style={{
                  display: 'flex',
                  height: 8,
                  borderRadius: 4,
                  overflow: 'hidden',
                  gap: 2,
                  marginBottom: 10,
                }}
              >
                {languages.map(lang => (
                  <div
                    key={lang.name}
                    style={{
                      flex: lang.percent,
                      background: lang.color ?? '#94a3b8',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>

              {/* Labels */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                {languages.map(lang => (
                  <div key={lang.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: lang.color ?? '#94a3b8',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: isLightMode ? '#1e293b' : '#cbd5e1',
                      }}
                    >
                      {lang.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: isLightMode ? '#475569' : '#94a3b8',
                      }}
                    >
                      {lang.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </section>
  )
}
