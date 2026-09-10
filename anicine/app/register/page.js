"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledInvite = searchParams.get("invite") || "";

  const [form, setForm] = useState({
    username: "",
    email: "",
    whatsapp: "",
    password: "",
    invite: prefilledInvite,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          whatsapp: form.whatsapp,
          invited_by_code: form.invite || null,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <div>
          <h1 className="font-display text-4xl text-ink">Buat akun</h1>
          <p className="mt-2 font-body text-sm text-muted">
            Daftar dulu, baru semua fitur ANICINE terbuka untukmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Username">
            <input
              required
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className="input"
              placeholder="cth. senpai_kiri"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
              placeholder="kamu@email.com"
            />
          </Field>
          <Field label="Nomor WhatsApp">
            <input
              required
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className="input"
              placeholder="08xxxxxxxxxx"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input"
              placeholder="Minimal 6 karakter"
            />
          </Field>
          <Field label="Kode undangan (opsional)">
            <input
              value={form.invite}
              onChange={(e) => update("invite", e.target.value.toUpperCase())}
              className="input"
              placeholder="Kalau diundang teman, isi di sini"
            />
          </Field>

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
            {loading ? "Memproses..." : "Daftar sekarang"}
          </button>
        </form>

        <p className="font-body text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-cyan hover:text-ink">
            Masuk di sini
          </Link>
        </p>
      </section>

      <style jsx global>{`
        .input {
          background: #171c33;
          border: 1px solid #23283f;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: #f2f1f8;
          font-family: var(--font-body);
        }
        .input:focus {
          outline: none;
          border-color: #35e7c7;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
