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
    return { statusCode: 405, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'Method Not Allowed' }
  }

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=3600',
  }
  const CORS_NO_CACHE = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return {
      statusCode: 200,
      headers: CORS_NO_CACHE,
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
      return {
        statusCode: 200,
        headers: CORS_NO_CACHE,
        body: JSON.stringify({ error: 'api_error', message: 'GitHub API error' }),
      }
    }

    const json = await response.json()

    if (json.errors) {
      return {
        statusCode: 200,
        headers: CORS_NO_CACHE,
        body: JSON.stringify({ error: 'api_error', message: 'GitHub API error' }),
      }
    }

    if (!json.data?.user) {
      return {
        statusCode: 200,
        headers: CORS_NO_CACHE,
        body: JSON.stringify({ error: 'api_error', message: 'GitHub user not found' }),
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
      headers: CORS_NO_CACHE,
      body: JSON.stringify({ error: 'api_error', message: 'GitHub API error' }),
    }
  }
}
