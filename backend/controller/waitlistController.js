const { publicSupabase, adminSupabase } = require('../model/supabaseClient')

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

async function handleHealth(_req, res) {
  res.json({ ok: true })
}

async function addWaitlist(req, res) {
  try {
    const {
      name = '',
      email = '',
      company = '',
      phone = '',
      message = '',
      source = '',
    } = req.body || {}

    const safeName = normalizeText(name)
    const safeEmail = normalizeText(email).toLowerCase()
    const safeCompany = normalizeText(company)
    const safePhone = normalizeText(phone)
    const safeMessage = normalizeText(message)
    const safeSource = normalizeText(source).toLowerCase()

    if (!safeName || !safeEmail || !safeMessage) {
      return res.status(400).json({ error: 'Name, email, and message are required.' })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }

    if (!safeSource) {
      return res.status(400).json({ error: 'Source is required.' })
    }

    const payload = {
      name: safeName,
      email: safeEmail,
      company: safeCompany || null,
      phone: safePhone || null,
      message: safeMessage,
      source: safeSource,
    }

    const { error: insertError } = await publicSupabase.from('waitlist_customers').insert(payload)

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
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'This email is already on the waitlist.' })
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
}

async function getAdminWaitlist(_req, res) {
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
}

async function deleteWaitlistById(req, res) {
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
}

async function deleteWaitlistByEmail(req, res) {
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
}

module.exports = {
  handleHealth,
  addWaitlist,
  getAdminWaitlist,
  deleteWaitlistById,
  deleteWaitlistByEmail,
}
