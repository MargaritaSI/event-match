/**
 * Supabase client — created only when both env vars are present, and LAZILY via dynamic
 * import so the supabase-js bundle is a separate chunk that's fetched only when cloud sync
 * is actually on. With no keys, `getClient()` resolves null and nothing is downloaded, so
 * the default (keyless) GitHub Pages build stays lean and the app runs purely on localStorage.
 *
 * The anon key is a PUBLIC client key (protected by Row-Level Security), so it is safe to
 * ship in the front-end. Never put the service_role key here.
 */
import type { SupabaseClient } from '@supabase/supabase-js'; // type-only: erased at build, no runtime import

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isBackendEnabled = Boolean(url && anonKey);

let clientPromise: Promise<SupabaseClient | null> | null = null;

/** Resolve the shared Supabase client (cached), or null when the backend is disabled. */
export function getClient(): Promise<SupabaseClient | null> {
  if (!isBackendEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url!, anonKey!, {
        auth: { persistSession: true, autoRefreshToken: true },
      }),
    );
  }
  return clientPromise;
}
