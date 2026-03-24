# GitHub Contributions Block — Design Spec
**Date:** 2026-03-24
**Project:** amsan2026 portfolio
**Status:** Approved

---

## Overview

Add a live GitHub contributions visualization block to the portfolio, positioned directly after the Projects section. Data is fetched server-side via a new Netlify function using the GitHub GraphQL API.

---

## Architecture

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `netlify/functions/github-contributions.cjs` | Create | Calls GitHub GraphQL API, returns contribution + language data |
| `src/components/GitHubContributions.tsx` | Create | Renders the full contributions block |
| `src/App.tsx` | Edit | Mount `<GitHubContributions />` after `<Projects />` |

---

## Netlify Function: `github-contributions.cjs`

### Behavior
- Method: GET
- Reads `GITHUB_TOKEN` from environment variables
- If token missing: returns `{ error: 'no_token' }` with 200 status (graceful fallback)
- If GitHub API returns non-2xx or a GraphQL `errors` array: returns `{ error: 'api_error', message: string }` with 200 status so the component can distinguish it from `no_token`
- Calls GitHub GraphQL API at `https://api.github.com/graphql`
- Language aggregation (sum bytes per language across all repos, compute percentages) is done inside the function before returning — the component receives pre-computed `percent` values
- Response header: `Cache-Control: s-maxage=3600` (Netlify CDN caches 1 hour)
- CORS headers matching `chat.cjs` pattern

### GraphQL Query
```graphql
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
```

### Language Aggregation (inside the function)
1. Iterate all repo `languages.edges`
2. Accumulate `size` (bytes) per language name into a map
3. Sum all bytes for total
4. Take top 5 by bytes, compute `percent = Math.round((langBytes / totalBytes) * 100)`
5. Return the top 5 as `{ name, color, percent }` — percentages may not sum to 100 due to rounding and the top-5 slice

### Response Shape
```json
{
  "weeks": [
    {
      "contributionDays": [
        { "contributionCount": 3, "date": "2025-03-24" }
      ]
    }
  ],
  "totalContributions": 847,
  "languages": [
    { "name": "TypeScript", "color": "#3178c6", "percent": 42 },
    { "name": "Python", "color": "#3776ab", "percent": 28 }
  ]
}
```

Username is hardcoded as `Amsan5941` inside the function.

---

## Component: `GitHubContributions.tsx`

### States
- `loading` — shows skeleton placeholders
- `no_token` — shows a "GitHub data coming soon" placeholder panel (no error, just awaiting token); triggered when response contains `{ error: 'no_token' }`
- `error` — shows a subtle inline error message; triggered when response contains `{ error: 'api_error' }` or fetch throws
- `loaded` — renders full block

### Entrance Animation
Copy the `secFade` plain-object pattern from `SkillsGlobe.tsx` verbatim:
```ts
const secFade = {
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-60px' as const },
  transition:  { duration: 0.6, ease: 'easeOut' as const },
}
```

### Layout (top to bottom)

#### 1. Header Row
- Left: `GITHUB ACTIVITY` label (JetBrains Mono, uppercase, tracking-widest — matches other section labels)
- Center: `@Amsan5941` username pill
- Right: Activity badge — "Very Active" / "Active" / "Moderate" computed from daily average (>3 / 1–3 / <1)

#### 2. Stats Row
Four stat cards in a single row (2×2 grid on mobile):

| Stat | Accent Color | Calculation |
|------|-------------|-------------|
| Total Contributions | amber (`#f59e0b`) | From API `totalContributions` |
| Current Streak | cyan (`#06b6d4`) | Consecutive days with count > 0 going back from yesterday (today is excluded — it may be incomplete, and excluding it prevents an active streak from appearing broken) |
| Longest Streak | purple (`#a855f7`) | Max consecutive days in the year |
| Best Day | pink (`#ec4899`) | Max single-day count in the year |

Streak and best day are calculated client-side by flattening `weeks[].contributionDays` into a sorted array of `{ date, count }` entries.

#### 3. Contribution Heatmap

**Data layout:**
- GitHub's GraphQL `contributionCalendar.weeks` returns weeks in Sunday-first order (each week's `contributionDays[0]` is Sunday)
- Use the data as-is: grid rows go Sun → Sat (7 rows), columns go oldest week → newest (up to 53 weeks returned; render all)
- Day labels on the left show **Sun / Tue / Thu** (rows 0, 2, 4) — aligned to Sunday-first data

**Visual:**
- Square size: 11px with 2px gap
- Month labels above grid (Jan … Dec) — positioned above the first column where a new month begins (check `contributionDays[0].date` for each week)
- Color tiers based on `contributionCount`:
  - 0: `#161630` (matches Tailwind `raised` token in `tailwind.config.js`; use inline hex, not a CSS variable)
  - Light mode zero-state: `#e2e8f0`
  - 1–3: `rgba(6, 182, 212, 0.30)`
  - 4–6: `rgba(6, 182, 212, 0.65)`
  - 7+: `#06b6d4` (full cyan)
- Hover tooltip: dark pill with accent border, text: *"5 contributions on Wed, Mar 12"* — same style as SkillsGlobe tooltip (dark gradient background, `1px solid {color}aa` border)
- Mobile: heatmap container is horizontally scrollable (`overflow-x: auto`), grid does not wrap

#### 4. Language Bar
- Segmented horizontal bar showing top 5 languages by code size
- Each segment colored with the language's own color (from GitHub API, same as `langColor` values in Projects component)
- Labels below: colored dot + language name + percentage
- Uses pre-computed `percent` values from the function response

---

## Styling

- Outer container: `.section-shell` card (glassmorphism, matches Projects/Experience)
- Section label: `.label` utility class
- Stat cards: `.glass-card` with individual accent color borders
- Heatmap squares: plain `<div>` elements, inline color styles
- Font: JetBrains Mono for labels/stats numbers, Outfit for descriptive text
- Dark/light mode: heatmap zero-state uses `#161630` dark / `#e2e8f0` light (detected via `document.body.classList.contains('light')` + MutationObserver, same pattern as SkillsGlobe)
- Entrance: `secFade` Framer Motion animation (plain-object variant from SkillsGlobe)

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|---------|
| Desktop (≥768px) | Full heatmap, stats in 1×4 row |
| Tablet (≥480px) | Stats 2×2, heatmap scrollable |
| Mobile (<480px) | Stats 2×2, heatmap horizontally scrollable, month labels hidden |

---

## Error / Loading States

- **Loading**: Skeleton blocks (pulsing opacity) for stats cards + heatmap area
- **No token** (`{ error: 'no_token' }`): Single panel: *"GitHub contribution data will appear here after deployment"* — does not show as an error, just a placeholder
- **API error** (`{ error: 'api_error' }` or fetch failure): Inline message: *"Could not load contribution data"* — does not break page layout

---

## Netlify Environment Variable Setup

After deployment, add `GITHUB_TOKEN` in Netlify:
1. `app.netlify.com` → site → **Site configuration → Environment variables**
2. Add key: `GITHUB_TOKEN`, value: GitHub Personal Access Token
3. Token scopes required: `read:user`, `repo`
4. Trigger redeploy to apply
