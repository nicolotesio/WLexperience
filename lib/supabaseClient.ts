import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseClientConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL e anon key devono essere configurati in .env');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
