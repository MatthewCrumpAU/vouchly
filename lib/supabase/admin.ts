import { createClient } from "@supabase/supabase-js";

// SERVICE ROLE client — bypasses RLS. Use ONLY in trusted server code
// (widget config, public event ingestion, admin panel). Never import this
// into a client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
