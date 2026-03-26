const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 's-maxage=900',
}
const CORS_NO_CACHE = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

const OWNER = 'Amsan5941'
const README_MAX_CHARS = 2200

function truncateText(text, maxChars) {
  if (!text) return ''
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars)}...`
}

function cleanMarkdown(md = '') {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\r/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractReadmeSentences(readme = '') {
  const cleaned = cleanMarkdown(readme)
  if (!cleaned) return []
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 30 && s.length <= 260)
    .slice(0, 6)
}

function fallbackDesc(context) {
  if (context.githubDescription && context.githubDescription.trim().length > 20) {
    return truncateText(context.githubDescription.trim(), 200)
  }

  const fromReadme = context.readmeSentences[0]
  if (fromReadme) return truncateText(fromReadme, 200)

  const stack = context.topics?.length ? context.topics.slice(0, 3).join(', ') : context.language
  return `${context.name} is a ${context.language} project focused on practical workflows using ${stack}.`
}

function fallbackHowItWorks(context) {
  const fromReadme = context.readmeSentences[1]
  if (fromReadme) return truncateText(fromReadme, 240)

  if (context.topics?.length) {
    return `It works by combining ${context.topics.slice(0, 4).join(', ')} into a single end-to-end workflow.`
  }

  return `It is implemented in ${context.language} with a modular architecture for iteration and extension.`
}

function parseModelJson(rawContent) {
  if (!rawContent) return null

  const trimmed = rawContent.trim()
  try {
    return JSON.parse(trimmed)
  } catch {}

  const noFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')

  try {
    return JSON.parse(noFence)
  } catch {}

  const start = noFence.indexOf('{')
  const end = noFence.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(noFence.slice(start, end + 1))
    } catch {}
  }

  return null
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 86400)    return 'today'
  if (diff < 172800)   return '1 day ago'
  if (diff < 604800)   return `${Math.floor(diff / 86400)} days ago`
  if (diff < 1209600)  return '1 week ago'
  if (diff < 2592000)  return `${Math.floor(diff / 604800)} weeks ago`
  if (diff < 5184000)  return '1 month ago'
  return `${Math.floor(diff / 2592000)} months ago`
}

function formatTopic(t) {
  const map = {
    'react-native':   'React Native',
    'nextjs':         'Next.js',
    'next-js':        'Next.js',
    'fastapi':        'FastAPI',
    'supabase':       'Supabase',
    'postgresql':     'PostgreSQL',
    'typescript':     'TypeScript',
    'javascript':     'JavaScript',
    'aws-polly':      'AWS Polly',
    'aws-transcribe': 'Transcribe',
    'openai':         'OpenAI',
    'tailwindcss':    'Tailwind',
    'tailwind':       'Tailwind',
    'stripe':         'Stripe',
    'firebase':       'Firebase',
    'kubernetes':     'Kubernetes',
    'docker':         'Docker',
    'langchain':      'LangChain',
  }
  return map[t] ?? t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

async function fetchReadme(owner, repo, token) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!response.ok) return ''

    const readmeText = await response.text()
    return truncateText(readmeText.replace(/\0/g, ''), README_MAX_CHARS)
  } catch {
    return ''
  }
}

function defaultImpactLine(project) {
  const parts = []
  if (typeof project.stars === 'number') parts.push(`${project.stars} stars`)
  if (typeof project.forks === 'number') parts.push(`${project.forks} forks`)
  if (project.language && project.language !== 'Unknown') parts.push(project.language)
  return parts.join(' · ')
}

async function buildPinnedDescriptions(pinned, githubToken, openAiKey) {
  if (pinned.length === 0) return pinned

  const contexts = await Promise.all(
    pinned.map(async project => ({
      name: project.name,
      language: project.language,
      stars: project.stars,
      forks: project.forks,
      githubDescription: project.desc || '',
      topics: project.stack || [],
      readme: await fetchReadme(OWNER, project.name, githubToken),
    }))
  )

  contexts.forEach(c => {
    c.readmeSentences = extractReadmeSentences(c.readme)
  })

  const contextByName = new Map(contexts.map(c => [c.name, c]))

  if (!openAiKey) {
    return pinned.map(project => {
      const context = contextByName.get(project.name)
      if (!context) return project
      return {
        ...project,
        desc: fallbackDesc(context),
        howItWorks: fallbackHowItWorks(context),
        impactLine: defaultImpactLine(project),
      }
    })
  }

  const promptData = contexts.map(c => ({
    name: c.name,
    language: c.language,
    stars: c.stars,
    forks: c.forks,
    githubDescription: c.githubDescription,
    topics: c.topics,
    readmeSnippet: c.readme,
  }))

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content: 'You write strong portfolio copy for software repositories. Use only provided facts. Do not invent metrics, users, awards, or deployment claims. Return strict JSON only.',
          },
          {
            role: 'user',
            content: `For each project, produce:\n1) desc: what the project does in 1 sentence (max 210 chars)\n2) howItWorks: how it works technically in 1 sentence (max 240 chars)\n3) impactLine: concise fact-only line using stars/forks/language when useful\n\nStyle requirements:\n- Be specific and concrete, avoid vague terms like \"platform\" or \"solution\" unless qualified.\n- Include implementation details (pipeline, API, agent flow, architecture, model usage, etc.) when available.\n- Never invent outcomes or metrics.\n\nReturn JSON object with this exact shape:\n{\n  "projects": [\n    { "name": "repo-name", "desc": "...", "howItWorks": "...", "impactLine": "..." }\n  ]\n}\n\nProject data:\n${JSON.stringify(promptData)}`,
          },
        ],
      }),
    })

    if (!response.ok) return pinned

    const data = await response.json()
    const rawContent = data?.choices?.[0]?.message?.content
    if (!rawContent) return pinned

    const parsed = parseModelJson(rawContent)
    if (!parsed || !Array.isArray(parsed.projects)) {
      return pinned.map(project => {
        const context = contextByName.get(project.name)
        if (!context) return project
        return {
          ...project,
          desc: fallbackDesc(context),
          howItWorks: fallbackHowItWorks(context),
          impactLine: defaultImpactLine(project),
        }
      })
    }

    const byName = new Map((parsed.projects || []).map(p => [p.name, p]))

    return pinned.map(project => {
      const ai = byName.get(project.name)
      const context = contextByName.get(project.name)
      const nextDesc = typeof ai?.desc === 'string' && ai.desc.trim().length > 0
        ? truncateText(ai.desc.trim(), 210)
        : context ? fallbackDesc(context) : project.desc
      const nextHow = typeof ai?.howItWorks === 'string' && ai.howItWorks.trim().length > 0
        ? truncateText(ai.howItWorks.trim(), 240)
        : context ? fallbackHowItWorks(context) : ''
      const nextImpact = typeof ai?.impactLine === 'string' && ai.impactLine.trim().length > 0
        ? truncateText(ai.impactLine.trim(), 110)
        : defaultImpactLine(project)

      return {
        ...project,
        desc: nextDesc,
        howItWorks: nextHow,
        impactLine: nextImpact,
      }
    })
  } catch {
    return pinned.map(project => {
      const context = contextByName.get(project.name)
      return {
        ...project,
        desc: context ? fallbackDesc(context) : project.desc,
        howItWorks: context ? fallbackHowItWorks(context) : '',
        impactLine: defaultImpactLine(project),
      }
    })
  }
}

const QUERY = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            name
            isFork
            description
            stargazerCount
            forkCount
            url
            homepageUrl
            primaryLanguage { name color }
            repositoryTopics(first: 8) {
              nodes { topic { name } }
            }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              nodes { name color }
            }
          }
        }
      }
      repositories(
        first: 20
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: OWNER
        privacy: PUBLIC
      ) {
        nodes {
          name
          description
          stargazerCount
          url
          updatedAt
          isFork
          primaryLanguage { name color }
          languages(first: 4, orderBy: {field: SIZE, direction: DESC}) {
            nodes { name color }
          }
        }
      }
    }
  }
`

exports.handler = async function (event) {
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

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Method Not Allowed' }
  }

  const token = process.env.GITHUB_TOKEN
  const openAiKey = process.env.OPENAI_API_KEY
  if (!token) {
    return { statusCode: 200, headers: CORS_NO_CACHE, body: JSON.stringify({ error: 'no_token' }) }
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: QUERY, variables: { login: OWNER } }),
    })

    if (!response.ok) {
      return { statusCode: 200, headers: CORS_NO_CACHE, body: JSON.stringify({ error: 'api_error' }) }
    }

    const json = await response.json()
    if (json.errors || !json.data?.user) {
      return { statusCode: 200, headers: CORS_NO_CACHE, body: JSON.stringify({ error: 'api_error' }) }
    }

    const { pinnedItems, repositories } = json.data.user

    // Build pinned set for flagging repos
    const pinnedNames = new Set(pinnedItems.nodes.map(n => n.name))

    let pinned = pinnedItems.nodes
      .map(r => ({
        name:      r.name,
        slug:      r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        language:  r.primaryLanguage?.name ?? 'Unknown',
        langColor: r.primaryLanguage?.color ?? '#94a3b8',
        desc:      r.description ?? '',
        stars:     r.stargazerCount,
        forks:     r.forkCount,
        github:    r.url,
        demo:      r.homepageUrl || null,
        stack:     r.repositoryTopics.nodes.map(n => formatTopic(n.topic.name)).slice(0, 5),
        languages: (r.languages?.nodes ?? []).map(l => ({ name: l.name, color: l.color ?? '#94a3b8' })),
      }))

    // If no topics, fall back to primary language as the only stack badge
    pinned.forEach(p => {
      if (p.stack.length === 0 && p.language !== 'Unknown') p.stack = [p.language]
      if (!p.desc) p.desc = `${p.name} project built with ${p.stack.slice(0, 3).join(', ') || p.language}.`
      p.impactLine = defaultImpactLine(p)
    })

    pinned = await buildPinnedDescriptions(pinned, token, openAiKey)

    const repos = repositories.nodes
      .map(r => ({
        name:      r.name,
        language:  r.primaryLanguage?.name ?? 'Unknown',
        langColor: r.primaryLanguage?.color ?? '#94a3b8',
        desc:      r.description ?? '',
        updated:   timeAgo(r.updatedAt),
        stars:     r.stargazerCount,
        pinned:    pinnedNames.has(r.name),
        isFork:    r.isFork,
        url:       r.url,
        languages: (r.languages?.nodes ?? []).map(l => ({ name: l.name, color: l.color ?? '#94a3b8' })),
      }))

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ pinned, repos }),
    }
  } catch (err) {
    return { statusCode: 200, headers: CORS_NO_CACHE, body: JSON.stringify({ error: 'api_error' }) }
  }
}
