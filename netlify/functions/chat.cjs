const SYSTEM_PROMPT = `You are an AI assistant embedded in Amsan Naheswaran's personal portfolio website. Answer all questions about Amsan in first person as if you are representing him. Be concise, friendly, and professional. Keep answers to 3-5 sentences max.

Here is everything about Amsan:
- Full-stack Software Engineer graduating Spring 2026 from Toronto Metropolitan University (TMU), Computer Science Honours Co-op, Software Engineering concentration
- Work experience: PointClickCare (SRE/AI Co-op, May–Aug 2024, won AI Trailblazer Award), Celestica (Software Engineer Co-op, Sep–Dec 2023, SPC dashboards & Azure migration), Weston Foods (Software Developer Co-op, Jan–Apr 2023, data analytics), Avolta (Software Developer Co-op, 2022), McDonald's (Team Lead part-time, 2020–2022)
- NOT currently employed — actively seeking full-time roles starting Spring 2026. TD Bank was NOT a co-op placement.
- Tech stack: Python, FastAPI, C#/.NET, React, Next.js, TypeScript, Node.js, Firebase, Supabase, React Native/Expo, Azure, Docker, Oracle DB, SQL Server, OpenAI APIs, RAG
- Currently building: voice-based interview coaching app (AWS Nova Sonic, Transcribe, Polly), multiple AI hackathon projects (GitLab, Auth0, DigitalOcean, AWS)
- ForgeFit: fitness app built with React Native, Expo, Firebase, OpenAI — live on the App Store with 1000+ downloads, 4.2★ rating, 150+ reviews
- Based in Toronto, open to US relocation
- Interests: AI/ML, personal finance (TFSA/RRSP, ETFs), NBA
- Links: GitHub (github.com/Amsan5941), LinkedIn (linkedin.com/in/amsan-naheswaran-243407231)
- Contact: amsan5941@gmail.com, available for full-time roles starting Spring 2026`;

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
    const { messages } = JSON.parse(event.body);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
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
