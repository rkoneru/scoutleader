/**
 * Lazily constructed Supabase client. Returns null when the project is not
 * configured, which is what puts the app into local-only mode.
 */

import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './env';

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const config = getSupabaseConfig();
  if (!config) {
    client = null;
    return client;
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // React Native has no URL bar to parse a session out of.
      detectSessionInUrl: false,
    },
  });
  return client;
}
