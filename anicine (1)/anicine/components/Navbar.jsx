"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          ANI<span className="text-neon">CINE</span>
        </Link>
        <div className="flex items-center gap-6 font-body text-sm text-muted">
          <Link href="/browse" className="hover:text-ink transition-colors">
            Jelajahi
          </Link>
          {session ? (
            <Link
              href="/account"
              className="rounded-full border border-line px-4 py-2 text-ink hover:border-neon hover:text-neon transition-colors"
            >
              Akun Saya
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink transition-colors">
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neon px-4 py-2 font-medium text-void hover:bg-ink transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
