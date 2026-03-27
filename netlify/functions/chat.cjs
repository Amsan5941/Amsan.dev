const fs = require('node:fs/promises');
const path = require('node:path');
const pdfParse = require('pdf-parse');

const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Amsan5941';
const LINKEDIN_URL = process.env.LINKEDIN_URL || 'https://www.linkedin.com/in/amsan-naheswaran-243407231/';
const LINKEDIN_PROFILE_TEXT = process.env.LINKEDIN_PROFILE_TEXT || '';
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_FILE = '/tmp/amsan-rag-kb.json';
const MAX_CONTEXT_CHARS = 5200;

let inMemoryKb = null;
let inMemoryKbUpdatedAt = 0;
let inFlightBuild = null;

const SYSTEM_PROMPT = `You are Amsan MCP, an assistant embedded in Amsan Naheswaran's portfolio.

Rules:
- Answer in first person as Amsan.
- Be concise, friendly, and professional.
- Prefer facts from provided retrieval context.
- If a fact is missing or uncertain, say that briefly instead of inventing.
- Keep responses to 3-6 sentences unless the user asks for depth.
- If asked about availability: say actively seeking full-time roles starting Spring 2026.
- Mention contact naturally when relevant: amsan5941@gmail.com.`;

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(text = '') {
  return text
    .replace(/\r/g, ' ')
    .replace(/\u0000/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function getLinkedInEnvFallbackText() {
  if (LINKEDIN_PROFILE_TEXT.trim()) return LINKEDIN_PROFILE_TEXT;

  const keys = Object.keys(process.env)
    .map(key => {
      const match = key.match(/^LINKEDIN_PROFILE_TEXT_(\d+)$/);
      if (!match) return null;
      return { key, index: Number(match[1]) };
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  if (!keys.length) return '';
  return keys
    .map(entry => process.env[entry.key] || '')
    .join('')
    .trim();
}

async function readLinkedInFallbackFile() {
  const root = path.resolve(__dirname, '../..');
  const candidates = [
    path.join(root, 'docs', 'linkedin-profile.txt'),
    path.join(root, 'docs', 'linkedin-profile.md'),
  ];

  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, 'utf8');
      const cleaned = path.extname(file).toLowerCase() === '.md' ? cleanMarkdown(raw) : normalizeText(raw);
      if (cleaned) return cleaned;
    } catch {
      continue;
    }
  }

  return '';
}

function cleanMarkdown(md = '') {
  return normalizeText(
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/^#+\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^[-*]\s+/gm, '')
  );
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }
  if (!aNorm || !bNorm) return 0;
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

function splitIntoChunks(text, chunkSize = 900, overlap = 120) {
  const clean = normalizeText(text);
  if (!clean) return [];
  if (clean.length <= chunkSize) return [clean];

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(clean.length, start + chunkSize);
    const slice = clean.slice(start, end).trim();
    if (slice.length >= 120) chunks.push(slice);
    if (end >= clean.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

function extractQuotedTextFromTsx(source = '') {
  const matches = source.match(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g) || [];
  const cleaned = matches
    .map(token => token.slice(1, -1))
    .map(t => t.replace(/\\n/g, ' ').trim())
    .filter(t => t.length >= 25 && t.length <= 260)
    .filter(t => !/^(https?:\/\/|#|var\(--|[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/.test(t));

  const deduped = [];
  const seen = new Set();
  for (const line of cleaned) {
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(line);
    if (deduped.length >= 120) break;
  }
  return deduped;
}

async function safeRead(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function walkFiles(dirPath, exts) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, exts)));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (exts.has(ext)) files.push(fullPath);
  }
  return files;
}

async function computeLocalFingerprint() {
  const root = path.resolve(__dirname, '../..');
  const targets = [
    { dir: path.join(root, 'resume'), exts: new Set(['.pdf', '.txt', '.md']) },
    { dir: path.join(root, 'docs'), exts: new Set(['.md']) },
    { dir: path.join(root, 'src/components'), exts: new Set(['.tsx']) },
  ];

  const parts = [];
  for (const target of targets) {
    const files = await walkFiles(target.dir, target.exts);
    for (const file of files) {
      try {
        const stat = await fs.stat(file);
        parts.push(`${path.relative(root, file)}:${stat.mtimeMs}:${stat.size}`);
      } catch {
        continue;
      }
    }
  }

  parts.sort();
  return parts.join('|');
}

async function readResumeDocuments() {
  const resumeDir = path.resolve(__dirname, '../../resume');
  const exts = new Set(['.pdf', '.txt', '.md']);
  const files = await walkFiles(resumeDir, exts);

  const docs = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const title = path.basename(file);
    try {
      if (ext === '.pdf') {
        const buf = await fs.readFile(file);
        const parsed = await pdfParse(buf);
        const text = normalizeText(parsed?.text || '');
        if (text) {
          docs.push({
            id: `resume:${title}`,
            source: 'resume',
            title,
            text,
          });
        }
        continue;
      }

      const raw = await fs.readFile(file, 'utf8');
      const text = ext === '.md' ? cleanMarkdown(raw) : normalizeText(raw);
      if (text) {
        docs.push({
          id: `resume:${title}`,
          source: 'resume',
          title,
          text,
        });
      }
    } catch (err) {
      console.error('resume read error', file, err?.message || err);
    }
  }

  return docs;
}

async function readWebsiteDocuments() {
  const root = path.resolve(__dirname, '../..');
  const targetFiles = [
    'src/components/About.tsx',
    'src/components/Experience.tsx',
    'src/components/Projects.tsx',
    'src/components/Achievements.tsx',
    'src/components/Testimonials.tsx',
    'src/components/Contact.tsx',
  ].map(file => path.join(root, file));

  const docs = [];

  for (const file of targetFiles) {
    const raw = await safeRead(file);
    if (!raw) continue;
    const snippets = extractQuotedTextFromTsx(raw);
    if (snippets.length === 0) continue;

    docs.push({
      id: `website:${path.basename(file)}`,
      source: 'website',
      title: path.basename(file),
      text: snippets.join('\n'),
    });
  }

  const docsDir = path.join(root, 'docs');
  const mdFiles = await walkFiles(docsDir, new Set(['.md']));
  for (const file of mdFiles) {
    const raw = await safeRead(file);
    if (!raw) continue;
    const text = cleanMarkdown(raw);
    if (!text) continue;

    docs.push({
      id: `docs:${path.relative(root, file)}`,
      source: 'docs',
      title: path.relative(root, file),
      text,
    });
  }

  return docs;
}

async function githubFetch(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'AmsanMCP-RAG',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return res;
}

function markdownToSentences(md = '') {
  const cleaned = cleanMarkdown(md);
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 30 && s.length <= 260)
    .slice(0, 7);
}

async function fetchGithubDocuments() {
  const token = process.env.GITHUB_TOKEN || '';
  const docs = [];

  try {
    const profileRes = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}`, token);
    if (profileRes) {
      const profile = await profileRes.json();
      const text = [
        `GitHub profile for ${profile.name || GITHUB_USERNAME}`,
        profile.bio ? `Bio: ${profile.bio}` : '',
        profile.company ? `Company: ${profile.company}` : '',
        profile.location ? `Location: ${profile.location}` : '',
        `Public repos: ${profile.public_repos || 0}`,
        `Followers: ${profile.followers || 0}`,
      ].filter(Boolean).join('\n');

      docs.push({
        id: 'github:profile',
        source: 'github',
        title: 'GitHub Profile',
        text,
      });
    }

    const reposRes = await githubFetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=18&sort=updated&direction=desc`,
      token
    );

    if (reposRes) {
      const repos = await reposRes.json();
      const topRepos = (Array.isArray(repos) ? repos : [])
        .filter(r => !r.fork)
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 8);

      for (const repo of topRepos) {
        const meta = [
          `Repository: ${repo.name}`,
          repo.description ? `Description: ${repo.description}` : '',
          `Language: ${repo.language || 'Unknown'}`,
          `Stars: ${repo.stargazers_count || 0}`,
          `Updated: ${repo.updated_at || 'Unknown'}`,
          `URL: ${repo.html_url || ''}`,
        ].filter(Boolean).join('\n');

        let readmeText = '';
        try {
          const readmeRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/readme`, {
            headers: {
              Accept: 'application/vnd.github.raw+json',
              'User-Agent': 'AmsanMCP-RAG',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (readmeRes.ok) {
            const rawReadme = await readmeRes.text();
            const sentences = markdownToSentences(rawReadme).slice(0, 5);
            readmeText = sentences.join(' ');
          }
        } catch {
          readmeText = '';
        }

        docs.push({
          id: `github:${repo.name}`,
          source: 'github',
          title: repo.name,
          text: normalizeText(`${meta}\n${readmeText}`),
          url: repo.html_url,
        });
      }
    }
  } catch (err) {
    console.error('github ingest error', err?.message || err);
  }

  return docs;
}

function extractLinkedInJsonLd(html = '') {
  const results = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const payload = match[1]?.trim();
    if (!payload) continue;
    try {
      const parsed = JSON.parse(payload);
      if (Array.isArray(parsed)) results.push(...parsed);
      else results.push(parsed);
    } catch {
      continue;
    }
  }
  return results;
}

async function fetchLinkedInDocuments() {
  const docs = [];
  try {
    const response = await fetch(LINKEDIN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) return docs;
    const html = await response.text();
    const jsonLd = extractLinkedInJsonLd(html);

    const lines = [];
    for (const entry of jsonLd) {
      const type = Array.isArray(entry['@type']) ? entry['@type'].join(', ') : entry['@type'];
      if (typeof type === 'string' && !/person|profilepage/i.test(type)) continue;

      if (entry.name) lines.push(`Name: ${entry.name}`);
      if (entry.description) lines.push(`Summary: ${entry.description}`);
      if (entry.jobTitle) lines.push(`Job title: ${entry.jobTitle}`);
      if (entry.worksFor?.name) lines.push(`Works for: ${entry.worksFor.name}`);
    }

    const metaDescriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescriptionMatch?.[1]) lines.push(`Meta description: ${metaDescriptionMatch[1]}`);

    const joined = normalizeText(lines.join('\n'));
    if (joined) {
      docs.push({
        id: 'linkedin:profile',
        source: 'linkedin',
        title: 'LinkedIn Profile',
        text: joined,
        url: LINKEDIN_URL,
      });
    }
  } catch (err) {
    console.error('linkedin ingest error', err?.message || err);
  }

  const envFallback = getLinkedInEnvFallbackText();
  const fileFallback = envFallback ? '' : await readLinkedInFallbackFile();
  const fallbackText = envFallback || fileFallback;

  if (!docs.length && fallbackText) {
    docs.push({
      id: 'linkedin:manual',
      source: 'linkedin',
      title: 'LinkedIn Profile (manual fallback)',
      text: normalizeText(fallbackText),
      url: LINKEDIN_URL,
    });
  }

  return docs;
}

async function embedTexts(texts, apiKey) {
  if (!texts.length) return [];

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`embeddings_error: ${errorText}`);
  }

  const data = await response.json();
  return (data.data || []).map(item => item.embedding);
}

function lexicalScore(query, text) {
  const qTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 2);
  if (!qTokens.length) return 0;

  const hay = text.toLowerCase();
  let score = 0;
  for (const token of qTokens) {
    if (hay.includes(token)) score += 1;
  }
  return score / qTokens.length;
}

function buildChunks(documents) {
  const chunks = [];
  for (const doc of documents) {
    const parts = splitIntoChunks(doc.text);
    parts.forEach((part, index) => {
      chunks.push({
        id: `${doc.id}#${index + 1}`,
        source: doc.source,
        title: doc.title,
        url: doc.url || '',
        text: part,
      });
    });
  }
  return chunks;
}

async function saveCache(kb) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(kb), 'utf8');
  } catch {
    // ignore cache write issues in serverless
  }
}

async function readCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.chunks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function buildKnowledgeBase(apiKey) {
  const localFingerprint = await computeLocalFingerprint();
  const [resumeDocs, websiteDocs, githubDocs, linkedinDocs] = await Promise.all([
    readResumeDocuments(),
    readWebsiteDocuments(),
    fetchGithubDocuments(),
    fetchLinkedInDocuments(),
  ]);

  const fallbackDoc = {
    id: 'fallback:profile',
    source: 'fallback',
    title: 'Core Profile Facts',
    text: 'Amsan Naheswaran is a full-stack software engineer graduating Spring 2026 from Toronto Metropolitan University and actively seeking full-time roles. He has co-op experience at PointClickCare, Celestica, Weston Foods, and Avolta, and builds AI systems using Python, FastAPI, React, TypeScript, and cloud tooling.',
  };

  const documents = [
    ...resumeDocs,
    ...websiteDocs,
    ...githubDocs,
    ...linkedinDocs,
  ];

  if (documents.length === 0) documents.push(fallbackDoc);

  const chunks = buildChunks(documents);
  let embeddings = [];

  if (apiKey && chunks.length) {
    const inputs = chunks.map(c => c.text);
    embeddings = await embedTexts(inputs, apiKey);
  }

  const withEmbeddings = chunks.map((chunk, idx) => ({
    ...chunk,
    embedding: embeddings[idx] || null,
  }));

  return {
    builtAt: Date.now(),
    builtAtIso: nowIso(),
    localFingerprint,
    stats: {
      documents: documents.length,
      chunks: withEmbeddings.length,
      resumeDocs: resumeDocs.length,
      websiteDocs: websiteDocs.length,
      githubDocs: githubDocs.length,
      linkedinDocs: linkedinDocs.length,
    },
    chunks: withEmbeddings,
  };
}

async function getKnowledgeBase(apiKey) {
  const currentFingerprint = await computeLocalFingerprint();
  const freshInMemory =
    inMemoryKb &&
    inMemoryKb.localFingerprint === currentFingerprint &&
    (Date.now() - inMemoryKbUpdatedAt) < CACHE_TTL_MS;
  if (freshInMemory) return inMemoryKb;

  const cachedFile = await readCache();
  if (
    cachedFile &&
    cachedFile.localFingerprint === currentFingerprint &&
    (Date.now() - cachedFile.builtAt) < CACHE_TTL_MS
  ) {
    inMemoryKb = cachedFile;
    inMemoryKbUpdatedAt = Date.now();
    return cachedFile;
  }

  if (inFlightBuild) return inFlightBuild;

  inFlightBuild = (async () => {
    const kb = await buildKnowledgeBase(apiKey);
    inMemoryKb = kb;
    inMemoryKbUpdatedAt = Date.now();
    await saveCache(kb);
    return kb;
  })();

  try {
    return await inFlightBuild;
  } finally {
    inFlightBuild = null;
  }
}

async function retrieveContext(question, kb, apiKey) {
  const chunks = kb?.chunks || [];
  if (!question || chunks.length === 0) return { contextText: '', hits: [] };

  let scored = [];

  if (apiKey && chunks[0]?.embedding) {
    const [queryEmbedding] = await embedTexts([question], apiKey);
    scored = chunks
      .map(chunk => ({
        ...chunk,
        score: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0,
      }))
      .sort((a, b) => b.score - a.score);
  } else {
    scored = chunks
      .map(chunk => ({ ...chunk, score: lexicalScore(question, chunk.text) }))
      .sort((a, b) => b.score - a.score);
  }

  const topHits = scored.filter(hit => hit.score > 0).slice(0, 6);
  if (topHits.length === 0) return { contextText: '', hits: [] };

  const lines = [];
  let used = 0;

  for (const hit of topHits) {
    const prefix = `[${hit.source}] ${hit.title}${hit.url ? ` (${hit.url})` : ''}: `;
    const snippet = hit.text.slice(0, 900);
    const line = `${prefix}${snippet}`;

    if (used + line.length > MAX_CONTEXT_CHARS) break;
    lines.push(line);
    used += line.length;
  }

  return {
    contextText: lines.join('\n\n'),
    hits: topHits.map(hit => ({ source: hit.source, title: hit.title, score: hit.score })),
  };
}

function getLastUserQuestion(messages) {
  if (!Array.isArray(messages)) return '';
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.role === 'user' && typeof msg.content === 'string' && msg.content.trim()) {
      return msg.content.trim();
    }
  }
  return '';
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply: 'Chatbot is not configured yet. Reach out directly at amsan5941@gmail.com' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');
    const safeMessages = sanitizeMessages(messages);
    const question = getLastUserQuestion(safeMessages);

    const kb = await getKnowledgeBase(apiKey);
    const retrieval = await retrieveContext(question, kb, apiKey);

    const ragContext = retrieval.contextText
      ? `Retrieved context:\n${retrieval.contextText}`
      : 'Retrieved context: none';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        max_tokens: 380,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'system',
            content: `${ragContext}\n\nKnowledge base stats: ${JSON.stringify(kb.stats)}\nKnowledge built at: ${kb.builtAtIso}`,
          },
          ...safeMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ reply: 'Sorry, I could not generate a response right now. Please try again later or reach out directly at amsan5941@gmail.com' }),
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response right now.';

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ reply: 'Sorry, I\'m having trouble connecting right now. Please try again later or reach out directly at amsan5941@gmail.com' }),
    };
  }
};
