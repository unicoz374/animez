"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/browse");
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <div>
          <h1 className="font-display text-4xl text-ink">Masuk</h1>
          <p className="mt-2 font-body text-sm text-muted">
            Lanjutkan ke katalog, riwayat pesan, dan voucher milikmu.
          </p>
        </div>

        {justRegistered && (
          <p className="rounded border border-cyan/40 bg-cyan/10 px-3 py-2 font-body text-sm text-cyan">
            Akun berhasil dibuat. Silakan masuk.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs uppercase tracking-wide text-muted">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-panel2 px-4 py-3 text-ink focus:border-cyan focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs uppercase tracking-wide text-muted">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-line bg-panel2 px-4 py-3 text-ink focus:border-cyan focus:outline-none"
            />
          </label>

          {error && (
            <p className="rounded border border-neon/40 bg-neon/10 px-3 py-2 font-body text-sm text-neon">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-neon px-6 py-3 font-display text-lg text-void transition-colors hover:bg-ink disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="font-body text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="text-cyan hover:text-ink">
            Daftar dulu
          </Link>
        </p>

        <p className="font-body text-xs text-muted">
          Admin?{" "}
          <Link href="/admin/login" className="text-muted underline hover:text-ink">
            Masuk ke admin panel
          </Link>
        </p>
      </section>
    </main>
  );
}
