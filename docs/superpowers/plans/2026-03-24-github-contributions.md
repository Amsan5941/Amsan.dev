# GitHub Contributions Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live GitHub contributions heatmap + stats block after the Projects section, powered by a Netlify serverless function calling the GitHub GraphQL API.

**Architecture:** A new Netlify function (`github-contributions.cjs`) fetches contribution calendar data and language stats server-side (keeping the token secret), returns a clean JSON payload, and a new React component (`GitHubContributions.tsx`) renders the full block. The component mounts in `App.tsx` directly after `<Projects />`.

**Tech Stack:** React 18, TypeScript, Framer Motion, Tailwind CSS + custom CSS vars, Netlify Functions (CommonJS), GitHub GraphQL API v4

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `netlify/functions/github-contributions.cjs` | Create | GitHub GraphQL fetch, language aggregation, error shaping |
| `src/components/GitHubContributions.tsx` | Create | All rendering: loading/no_token/error/loaded states, stats, heatmap, language bar |
| `src/App.tsx` | Modify | Mount `<GitHubContributions />` after `<Projects />` |

---

## Task 1: Netlify Function

**Files:**
- Create: `netlify/functions/github-contributions.cjs`

This function handles CORS, reads `GITHUB_TOKEN` from env, calls GitHub GraphQL, aggregates language bytes into percentages, and returns one of three JSON shapes: `{ error: 'no_token' }`, `{ error: 'api_error', message }`, or the full data payload.

- [ ] **Step 1: Create `netlify/functions/github-contributions.cjs`**

```js
exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    }
  }

  // Reject non-GET methods (mirrors chat.cjs 405 pattern)
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=3600',
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ error: 'no_token' }),
    }
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(first: 30, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { login: 'Amsan5941' } }),
    })

    if (!response.ok) {
      const message = await response.text()
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ error: 'api_error', message }),
      }
    }

    const json = await response.json()

    if (json.errors) {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ error: 'api_error', message: json.errors[0]?.message ?? 'GraphQL error' }),
      }
    }

    const calendar = json.data.user.contributionsCollection.contributionCalendar
    const repos = json.data.user.repositories.nodes

    // Aggregate language bytes across all repos
    const langMap = {}
    for (const repo of repos) {
      for (const edge of (repo.languages?.edges ?? [])) {
        const name = edge.node.name
        const color = edge.node.color
        if (!langMap[name]) langMap[name] = { name, color, size: 0 }
        langMap[name].size += edge.size
      }
    }
    const totalBytes = Object.values(langMap).reduce((acc, l) => acc + l.size, 0)
    const languages = Object.values(langMap)
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .map(l => ({
        name: l.name,
        color: l.color,
        percent: totalBytes > 0 ? Math.round((l.size / totalBytes) * 100) : 0,
      }))

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        weeks: calendar.weeks,
        totalContributions: calendar.totalContributions,
        languages,
      }),
    }
  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ error: 'api_error', message: err.message }),
    }
  }
}
```

- [ ] **Step 2: Verify the function runs locally (no token = graceful fallback)**

Netlify functions are only served by `netlify dev`, NOT by `npm run dev` (which is Vite only). To test the `no_token` state you must use Netlify CLI:

```bash
# Install Netlify CLI if not already present
npm install -g netlify-cli

# Run — serves both Vite frontend and Netlify functions together
npx netlify dev
```

Then in a second terminal:
```bash
curl http://localhost:8888/.netlify/functions/github-contributions
```
Expected output (no `GITHUB_TOKEN` set):
```json
{"error":"no_token"}
```

If you skip this step (no Netlify CLI), the component will show the **error** state in the browser (because `/.netlify/functions/github-contributions` will 404 from the raw Vite dev server). That is expected — the `no_token` state only works through `netlify dev`.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/github-contributions.cjs
git commit -m "feat: add github-contributions netlify function"
```

---

## Task 2: Component — Scaffold, Fetch, Non-Loaded States

**Files:**
- Create: `src/components/GitHubContributions.tsx`
- Modify: `src/App.tsx`

Build the full type system, helper functions, data fetch logic, and render the three non-loaded states (loading skeleton, no_token placeholder, error message). Wire it into App.tsx so you can verify each state in the browser before building the main content.

- [ ] **Step 1: Create `src/components/GitHubContributions.tsx` with types, helpers, fetch, and non-loaded states**

```tsx
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
  color: string
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
  // Exclude today (last entry may be incomplete — could be mid-day with 0 so far)
  const days = flatDays(weeks).slice(0, -1)
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
      .then((json: ContribData & { error?: string; message?: string }) => {
        if (json.error === 'no_token') { setState('no_token'); return }
        if (json.error === 'api_error') { setState('error'); return }
        setData(json as ContribData)
        setState('loaded')
      })
      .catch(() => setState('error'))
  }, [])

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <section className="section-pad">
        <div className="wrap">
          <motion.div {...secFade} className="section-shell p-8">
            <div className="animate-pulse space-y-6">
              <div className="flex justify-between">
                <div className="h-4 bg-white/5 rounded w-36" />
                <div className="h-4 bg-white/5 rounded w-20" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-xl" />
                ))}
              </div>
              <div className="h-36 bg-white/5 rounded-xl" />
              <div className="h-8 bg-white/5 rounded" />
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
          <motion.div {...secFade} className="section-shell p-8 text-center">
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
          <motion.div {...secFade} className="section-shell p-8 text-center">
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
  const currentStreak = calcCurrentStreak(data!.weeks)
  const longestStreak = calcLongestStreak(data!.weeks)
  const bestDay       = calcBestDay(data!.weeks)
  const activity      = activityLabel(data!.totalContributions)

  const stats = [
    { label: 'Contributions', value: data!.totalContributions.toLocaleString(), sub: 'this year',      color: '#f59e0b' },
    { label: 'Current Streak', value: String(currentStreak),                    sub: 'days',           color: '#06b6d4' },
    { label: 'Longest Streak', value: String(longestStreak),                    sub: 'days',           color: '#a855f7' },
    { label: 'Best Day',       value: String(bestDay),                          sub: 'contributions',  color: '#ec4899' },
  ]

  return (
    <section className="section-pad">
      <div className="wrap">
        <motion.div {...secFade} className="section-shell p-8">

          {/* ── Header ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="label flex-1">GITHUB ACTIVITY</span>
            <span
              className="text-xs font-mono px-3 py-1 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
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
                style={{ borderColor: `${s.color}44` }}
              >
                <div
                  className="font-display font-bold"
                  style={{ fontSize: 32, color: s.color, lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-1 text-xs font-mono uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {s.label}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)', opacity: 0.7 }}
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
                        color: 'var(--text-muted)',
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
                    {data!.weeks.map((week, wi) => {
                      const label = getMonthLabel(wi, data!.weeks)
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
                    {data!.weeks.map((week, wi) => (
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
                              const parent = heatmapRef.current?.getBoundingClientRect()
                              if (!parent) return
                              setTooltip({
                                text: `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${formatDate(day.date)}`,
                                x: rect.left - parent.left + 5,
                                y: rect.top - parent.top - 32,
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
                  className="absolute pointer-events-none z-50 px-3 py-1.5 rounded-full text-xs font-mono"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translateX(-50%)',
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
          {data!.languages.length > 0 && (
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
                {data!.languages.map(lang => (
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
                {data!.languages.map(lang => (
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
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {lang.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: 'var(--text-muted)',
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
```

- [ ] **Step 2: Wire `<GitHubContributions />` into `src/App.tsx`**

In `src/App.tsx`, add the import after the `Projects` import line:

```tsx
import GitHubContributions from './components/GitHubContributions'
```

Then add the component directly after `<Projects />`. The existing block in `App.tsx` looks like this — insert `<GitHubContributions />` on the new line shown:

```tsx
          <Projects />
          <GitHubContributions />
          <div id="case-studies">
            <FlagshipCaseStudies />
          </div>
```

Do not remove or restructure the `<div id="case-studies">` wrapper — it already exists and wraps `<FlagshipCaseStudies />`.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`

Open `http://localhost:5173` and scroll to after the Projects section. Expected: the loading skeleton (pulsing gray blocks) appears briefly, then either:
- The no_token placeholder if `GITHUB_TOKEN` is not set in your local env
- OR the full contribution block if you set `GITHUB_TOKEN=your_token npm run dev`

TypeScript must compile with zero errors: `npm run build` should pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/GitHubContributions.tsx src/App.tsx
git commit -m "feat: add GitHub contributions block component"
```

---

## Task 3: TypeScript Build Check + Final Polish

**Files:**
- Modify: `src/components/GitHubContributions.tsx` (if build errors found)

- [ ] **Step 1: Run TypeScript build and fix any errors**

```bash
npm run build
```

Expected: clean build with no TypeScript errors. Common issues to fix if they arise:
- `data!` non-null assertions: these are safe because the `loaded` branch only runs when `data` is set
- `Object.values(langMap)` type: add `as { name: string; color: string; size: number }[]` cast if TS complains

- [ ] **Step 2: Verify light mode**

In the browser, toggle to light mode via the navbar theme toggle. Expected:
- Heatmap zero-state squares turn from dark `#161630` to light gray `#e2e8f0`
- The section shell card adapts via the existing `.section-shell` light mode styles
- Stats and language bar remain readable

- [ ] **Step 3: Verify mobile responsiveness**

In browser DevTools, set viewport to 375px width. Expected:
- Stats cards stack into a 2×2 grid (`grid-cols-2`)
- Heatmap scrolls horizontally without wrapping
- Header row wraps but does not break layout

- [ ] **Step 4: Final commit**

```bash
git add src/components/GitHubContributions.tsx
git commit -m "fix: resolve build warnings in GitHubContributions"
```

---

## Post-Deployment Checklist

After pushing to Netlify:

1. Add `GITHUB_TOKEN` env var in Netlify dashboard (Site configuration → Environment variables)
   - Token scopes: `read:user`, `repo`
2. Trigger a redeploy
3. Visit the live site and confirm the heatmap loads real data
4. Hover cells to confirm the tooltip shows correct dates
5. Verify the activity badge reflects actual commit frequency
