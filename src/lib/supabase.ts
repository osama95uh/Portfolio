import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access.
 *
 * This module reads the service role key from environment variables and must
 * NEVER be imported from a client component. Every consumer of this lib lives
 * in Route Handlers so the secret never reaches the browser.
 *
 * Required environment variables (see .env.example):
 *   SUPABASE_URL                 e.g. https://abcd.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    Supabase Dashboard -> Settings -> API
 *
 * Everything degrades gracefully: when Supabase is not configured the public
 * site keeps serving the built-in static data, so the frontend behaviour and
 * structure remain exactly the same.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_SERVICE_ROLE_KEY &&
      SUPABASE_URL.startsWith("http"),
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(
      SUPABASE_URL as string,
      SUPABASE_SERVICE_ROLE_KEY as string,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
  return cachedClient;
}

/** Storage bucket used by the admin image uploader. */
export const PROJECT_IMAGES_BUCKET = "project-images";
