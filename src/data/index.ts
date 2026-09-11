import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSupabaseClient } from '../lib/supabase';
import { LocalRepository } from './localRepository';
import type { Repository } from './repository';
import { SupabaseRepository } from './supabaseRepository';

export * from './repository';
export { LocalRepository } from './localRepository';
export { SupabaseRepository } from './supabaseRepository';

/**
 * Picks the repository for this build. Supabase when it is configured,
 * on-device storage otherwise.
 */
export function createRepository(): Repository {
  const client = getSupabaseClient();
  if (client) return new SupabaseRepository(client);
  return new LocalRepository(AsyncStorage);
}
