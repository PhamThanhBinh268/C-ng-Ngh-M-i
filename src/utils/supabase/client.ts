import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null

export function createClient() {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Restart dev server after updating .env.')
  }

  cachedClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}
