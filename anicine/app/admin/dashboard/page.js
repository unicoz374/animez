"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardPage() {
  const [vouchers, setVouchers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [note, setNote] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const { data: v } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });
    setVouchers(v || []);

    const { data: p } = await supabase
      .from("profiles")
      .select("id, username, whatsapp, invite_code, invited_by, free_access_until, created_at")
      .order("created_at", { ascending: false });
    setProfiles(p || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setGenerated(null);
    setLoading(true);

    const res = await fetch("/api/admin/generate-voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, durationDays: Number(durationDays) }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Gagal membuat voucher.");
      return;
    }

    setGenerated(data.voucher);
    setNote("");
    loadData();
  }

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-4xl text-ink">Dashboard Admin</h1>
        <p className="mt-2 font-body text-sm text-muted">
          Generate accvoucher setelah pembeli disetujui via WhatsApp, dan
          pantau member yang terdaftar.
        </p>

        {/* GENERATE VOUCHER */}
        <div className="mt-8 rounded-lg border border-line bg-panel p-6">
          <h2 className="font-display text-xl text-ink">Generate voucher</h2>
          <form onSubmit={handleGenerate} className="mt-4 flex flex-wrap gap-3">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan (nomor WA pembeli, dsb)"
              className="flex-1 min-w-[200px] rounded-lg border border-line bg-panel2 px-4 py-2 font-body text-sm text-ink focus:border-cyan focus:outline-none"
            />
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="w-32 rounded-lg border border-line bg-panel2 px-4 py-2 font-body text-sm text-ink focus:border-cyan focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-neon px-5 py-2 font-body text-sm text-void hover:bg-ink disabled:opacity-50"
            >
              {loading ? "Membuat..." : "Generate"}
            </button>
          </form>
          {error && (
            <p className="mt-3 font-body text-sm text-neon">{error}</p>
          )}
          {generated && (
            <div className="mt-4 rounded border border-dashed border-cyan/50 bg-panel2 p-4">
              <p className="font-body text-xs uppercase text-muted">
                Kode voucher baru — kirim ke pembeli lewat WhatsApp
              </p>
              <p className="mt-1 font-display text-2xl tracking-widest text-cyan">
                {generated.code}
              </p>
            </div>
          )}
        </div>

        {/* DAFTAR VOUCHER */}
        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <h2 className="font-display text-xl text-ink">Semua voucher</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-4">Kode</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Durasi</th>
                  <th className="py-2 pr-4">Catatan</th>
                  <th className="py-2 pr-4">Diklaim</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-line/50">
                    <td className="py-2 pr-4 text-ink">{v.code}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2 pr-4 text-muted">
                      {v.duration_days} hari
                    </td>
                    <td className="py-2 pr-4 text-muted">{v.note || "—"}</td>
                    <td className="py-2 pr-4 text-muted">
                      {v.claimed_at
                        ? new Date(v.claimed_at).toLocaleDateString("id-ID")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DAFTAR MEMBER */}
        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <h2 className="font-display text-xl text-ink">Member terdaftar</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">WhatsApp</th>
                  <th className="py-2 pr-4">Kode undangan</th>
                  <th className="py-2 pr-4">Akses gratis s/d</th>
                  <th className="py-2 pr-4">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-line/50">
                    <td className="py-2 pr-4 text-ink">{p.username}</td>
                    <td className="py-2 pr-4 text-muted">{p.whatsapp}</td>
                    <td className="py-2 pr-4 text-muted">{p.invite_code}</td>
                    <td className="py-2 pr-4 text-muted">
                      {p.free_access_until
                        ? new Date(p.free_access_until).toLocaleString("id-ID")
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-muted">
                      {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "text-gold border-gold/40",
    claimed: "text-cyan border-cyan/40",
    revoked: "text-neon border-neon/40",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs ${styles[status] || ""}`}
    >
      {status}
    </span>
  );
}
