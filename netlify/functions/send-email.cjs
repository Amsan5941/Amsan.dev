const { Resend } = require('resend')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...CORS,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) }
  }

  // Replace re_xxxxxxxxx with your real key OR set RESEND_API_KEY in Netlify env vars.
  const resendApiKey = process.env.RESEND_API_KEY || 're_xxxxxxxxx'
  const toEmail = process.env.CONTACT_TO_EMAIL || 'amsan5941@gmail.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

  if (!resendApiKey || resendApiKey === 're_xxxxxxxxx' || !fromEmail) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        ok: false,
        error: 'Email service not configured. Replace re_xxxxxxxxx with your real Resend API key.',
      }),
    }
  }

  try {
    const parsed = JSON.parse(event.body || '{}')
    const name = String(parsed.name || '').trim()
    const email = String(parsed.email || '').trim()
    const message = String(parsed.message || '').trim()

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ ok: false, error: 'Name, email, and message are required.' }),
      }
    }

    const safeName = name.slice(0, 120)
    const safeEmail = email.slice(0, 200)
    const safeMessage = message.slice(0, 6000)

    const resend = new Resend(resendApiKey)

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Portfolio Contact: ${safeName}`,
      html: `<p><strong>New message from portfolio contact form</strong></p><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Message:</strong><br/>${safeMessage.replace(/\n/g, '<br/>')}</p>`,
      replyTo: safeEmail,
    })

    if (error) {
      console.error('Resend error:', error)
      return {
        statusCode: 502,
        headers: CORS,
        body: JSON.stringify({ ok: false, error: 'Email provider failed to send message.' }),
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    console.error('send-email function error:', err)
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ ok: false, error: 'Server error while sending email.' }),
    }
  }
}
