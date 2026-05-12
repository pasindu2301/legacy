const { createClient } = require('@supabase/supabase-js')

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

module.exports = {
  publicSupabase,
  adminSupabase,
}
