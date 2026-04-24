const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)
const host = process.env.HOST || '127.0.0.1'
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const adminPassword = process.env.ADMIN_PASSWORD || ''

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const publishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
const publicSupabaseKey = publishableKey || serviceRoleKey

if (!supabaseUrl || !publicSupabaseKey) {
  throw new Error('Missing Supabase credentials. Set SUPABASE_URL and one key.')
}

const publicSupabase = createClient(supabaseUrl, publicSupabaseKey)
const adminSupabase = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function isBackendAlreadyRunning(checkHost, checkPort) {
  try {
    const res = await fetch(`http://${checkHost}:${checkPort}/api/health`)
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data?.ok === true
  } catch {
    return false
  }
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-password']
  if (!adminPassword || token !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({ origin: frontendOrigin }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => {
  res.json({ ok: true })
})

app.post('/api/waitlist', async (req, res) => {
  try {
    const {
      name = '',
      email = '',
      company = '',
      phone = '',
      message = '',
      source = '',
    } = req.body || {}

    const safeName    = normalizeText(name)
    const safeEmail   = normalizeText(email).toLowerCase()
    const safeCompany = normalizeText(company)
    const safePhone   = normalizeText(phone)
    const safeMessage = normalizeText(message)

    // Validate required fields
    if (!safeName || !safeEmail || !safeMessage) {
      return res.status(400).json({ error: 'Name, email, and message are required.' })
    }

    if (!/^\S+@\S+\.\S+$/.test(safeEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }

    // Check if email already exists in DB
    const { data: existing, error: lookupError } = await publicSupabase
      .from('waitlist_customers')
      .select('id, source')
      .eq('email', safeEmail)
      .maybeSingle()

    if (lookupError) {
      console.error('Supabase lookup error:', lookupError)
      return res.status(500).json({ error: lookupError.message })
    }

    if (existing) {
      if (existing.source === 'legacyx') {
        // Already registered via legacyx — reject
        return res.status(409).json({
          error: 'This email is already on the waitlist.',
          source: existing.source,
        })
      }
      // Email exists but came from a different source — allow the insert
    }

    // Insert into DB
    const payload = {
      name:    safeName,
      email:   safeEmail,
      company: safeCompany || null,
      phone:   safePhone   || null,
      message: safeMessage,
      source:  'legacyx',
    }

    const { error: insertError } = await publicSupabase
      .from('waitlist_customers')
      .insert(payload)

    if (insertError) {
      if (
        insertError.message?.includes("Could not find the table 'public.waitlist_customers'") ||
        insertError.code === '42P01'
      ) {
        return res.status(500).json({
          error:
            'Supabase table waitlist_customers is missing. Run backend/supabase_waitlist.sql in the Supabase SQL Editor.',
        })
      }

      console.error('Supabase insert error:', insertError)
      const errorText = `${insertError.message || ''} ${insertError.details || ''}`.toLowerCase()
      if (errorText.includes('fetch failed') || errorText.includes('connecttimeouterror')) {
        return res.status(503).json({
          error: 'Could not connect to Supabase right now. Please try again in a moment.',
        })
      }

      return res.status(500).json({ error: insertError.message })
    }

    return res.status(201).json({ success: true })
  } catch (err) {
    console.error('Unexpected error in POST /api/waitlist:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

app.get('/api/admin/waitlist', requireAdmin, async (req, res) => {
  try {
    if (!adminSupabase) {
      return res.status(500).json({
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY in backend .env for admin actions.',
      })
    }

    const { data, error } = await adminSupabase
      .from('waitlist_customers')
      .select('id, name, email, company, phone, message, source, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase select error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.json({ data })
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/waitlist:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

app.delete('/api/admin/waitlist/:id', requireAdmin, async (req, res) => {
  try {
    if (!adminSupabase) {
      return res.status(500).json({
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY in backend .env for admin actions.',
      })
    }

    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Entry id is required.' })
    }

    const { data, error } = await adminSupabase
      .from('waitlist_customers')
      .delete()
      .eq('id', id)
      .select('id, email')
      .maybeSingle()

    if (error) {
      console.error('Supabase delete error:', error)
      return res.status(500).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Waitlist entry not found.' })
    }

    return res.json({ success: true, deleted: data })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/waitlist/:id:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

app.delete('/api/admin/waitlist/by-email/:email', requireAdmin, async (req, res) => {
  try {
    if (!adminSupabase) {
      return res.status(500).json({
        error: 'Missing SUPABASE_SERVICE_ROLE_KEY in backend .env for admin actions.',
      })
    }

    const rawEmail = decodeURIComponent(req.params.email || '')
    const email = normalizeText(rawEmail).toLowerCase()

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' })
    }

    const { data, error } = await adminSupabase
      .from('waitlist_customers')
      .delete()
      .eq('email', email)
      .select('id, email')

    if (error) {
      console.error('Supabase delete-by-email error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.json({ success: true, deletedCount: data?.length || 0 })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/admin/waitlist/by-email/:email:', err)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
})

// ── Start server ──────────────────────────────────────────────────────────────

function startServer(preferredPort) {
  const server = app.listen(preferredPort, host, () => {
    console.log(`Backend listening on http://${host}:${preferredPort}`)
  })

  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      const alreadyRunning = await isBackendAlreadyRunning(host, preferredPort)
      if (alreadyRunning) {
        console.error(
          `\nBackend is already running on http://${host}:${preferredPort}.\n` +
            'Stop the existing process first (Ctrl+C) before starting again.\n',
        )
        process.exit(0)
      }
      console.error(
        `\nPort ${preferredPort} is already in use.\n` +
          'Run: taskkill /F /IM node.exe  (Windows)\n' +
          'Then restart with: npm run dev\n',
      )
      process.exit(1)
    }
    console.error('Failed to start backend server:', err)
    process.exit(1)
  })
}

startServer(port)