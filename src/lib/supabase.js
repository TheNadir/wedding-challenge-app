import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  )
}

/**
 * Singleton Supabase client.
 * Import this wherever you need database / auth / storage access.
 *
 * @example
 * import { supabase } from '../lib/supabase'
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the session in localStorage so page refreshes keep users signed in.
    persistSession: true,
    autoRefreshToken: true,
  },
})
