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
      body: JSON.stringify({ query: QUERY, variables: { login: 'Amsan5941' } }),
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

    const pinned = pinnedItems.nodes
      .filter(r => !r.isFork)
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
    })

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
