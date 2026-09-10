"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = login akun, 2 = kode akses
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
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

    setStep(2);
  }

  async function handleAccessCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/verify-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Kode akses salah atau kamu bukan admin.");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <div>
          <h1 className="font-display text-4xl text-ink">Admin Panel</h1>
          <p className="mt-2 font-body text-sm text-muted">
            {step === 1
              ? "Masuk dengan akun admin terlebih dahulu."
              : "Masukkan kode akses tambahan untuk membuka dashboard."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs uppercase tracking-wide text-muted">
                Email admin
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
              className="mt-2 rounded-full bg-neon px-6 py-3 font-display text-lg text-void hover:bg-ink disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Lanjut"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAccessCode} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-xs uppercase tracking-wide text-muted">
                Kode akses admin
              </span>
              <input
                required
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="rounded-lg border border-line bg-panel2 px-4 py-3 text-ink focus:border-cyan focus:outline-none"
                placeholder="Kode rahasia unik"
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
              className="mt-2 rounded-full bg-neon px-6 py-3 font-display text-lg text-void hover:bg-ink disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk dashboard"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
