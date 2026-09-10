import { createClient } from "@supabase/supabase-js";

// PERINGATAN: file ini HANYA boleh di-import dari app/api/** (server-side).
// SUPABASE_SERVICE_ROLE_KEY melewati semua Row Level Security, jadi tidak boleh
// pernah sampai terkirim ke browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
