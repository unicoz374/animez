import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client ini dipakai di sisi browser (register, login, ambil data yang boleh diakses user biasa).
// Aturan akses sesungguhnya tetap dijaga oleh Row Level Security (RLS) di Supabase,
// jadi anon key ini aman dipublikasikan.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
