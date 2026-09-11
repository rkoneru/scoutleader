/**
 * Runtime configuration.
 *
 * Supabase is optional. With no environment variables set the app runs fully
 * local-first: bundled scenarios, profile and attempts in AsyncStorage. Set
 * both values in a .env file (see .env.example) to turn on accounts and sync.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = read('EXPO_PUBLIC_SUPABASE_URL');
  const anonKey = read('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
