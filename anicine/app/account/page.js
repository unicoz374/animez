"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281232715307";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingVouchers, setPendingVouchers] = useState([]);
  const [claimCode, setClaimCode] = useState("");
  const [claimMsg, setClaimMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(p);

    const { data: m } = await supabase
      .from("messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMessages(m || []);

    const { data: v } = await supabase
      .from("vouchers")
      .select("*")
      .eq("claimed_by", user.id);
    setPendingVouchers(v || []);

    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleClaim(e) {
    e.preventDefault();
    setClaimMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Voucher hanya boleh diklaim kalau statusnya masih 'pending' (belum pernah dipakai)
    const { data: voucher, error: findError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", claimCode.trim().toUpperCase())
      .eq("status", "pending")
      .maybeSingle();

    if (findError || !voucher) {
      setClaimMsg("Kode voucher tidak ditemukan atau sudah pernah dipakai.");
      return;
    }

    const { error: updateError } = await supabase
      .from("vouchers")
      .update({
        status: "claimed",
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", voucher.id)
      .eq("status", "pending");

    if (updateError) {
      setClaimMsg("Gagal klaim voucher, coba lagi.");
      return;
    }

    // Perpanjang masa akses penuh sesuai durasi voucher, dihitung dari yang lebih akhir
    // (kalau masih ada sisa akses gratis/voucher lain yang aktif, durasi ditambahkan, bukan ditimpa)
    const base =
      profile?.free_access_until && new Date(profile.free_access_until) > new Date()
        ? new Date(profile.free_access_until)
        : new Date();
    const newUntil = new Date(
      base.getTime() + voucher.duration_days * 24 * 60 * 60 * 1000
    );

    await supabase
      .from("profiles")
      .update({ free_access_until: newUntil.toISOString() })
      .eq("id", user.id);

    setClaimMsg("Voucher berhasil diklaim! Akses penuh sudah aktif.");
    setClaimCode("");
    loadAll();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-void">
        <Navbar />
        <p className="mx-auto max-w-4xl px-6 py-20 font-body text-muted">
          Memuat akun...
        </p>
      </main>
    );
  }

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?invite=${profile?.invite_code}`
      : "";

  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-ink">
            Halo, {profile?.username}
          </h1>
          <button
            onClick={handleLogout}
            className="rounded-full border border-line px-4 py-2 font-body text-sm text-muted hover:border-neon hover:text-neon"
          >
            Keluar
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* KLAIM VOUCHER */}
          <div className="rounded-lg border border-line bg-panel p-6">
            <h2 className="font-display text-xl text-ink">Klaim voucher</h2>
            <p className="mt-1 font-body text-sm text-muted">
              Masukkan kode accvoucher yang admin kirim setelah pembelian
              disetujui via WhatsApp.
            </p>
            <form onSubmit={handleClaim} className="mt-4 flex gap-2">
              <input
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="KODE-VOUCHER"
                className="flex-1 rounded-lg border border-line bg-panel2 px-4 py-2 font-body text-sm text-ink focus:border-cyan focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-neon px-4 py-2 font-body text-sm text-void hover:bg-ink"
              >
                Klaim
              </button>
            </form>
            {claimMsg && (
              <p className="mt-3 font-body text-sm text-cyan">{claimMsg}</p>
            )}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                "Halo, saya mau beli accvoucher ANICINE."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-body text-sm text-muted underline hover:text-ink"
            >
              Belum punya kode? Beli lewat WhatsApp →
            </a>
          </div>

          {/* INVITE CODE */}
          <div className="rounded-lg border border-line bg-panel p-6">
            <h2 className="font-display text-xl text-ink">Kode undanganmu</h2>
            <p className="mt-1 font-body text-sm text-muted">
              Bagikan ke teman. Setiap kode dipakai untuk daftar, kamu dapat
              gratis nonton 1 hari otomatis.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-cyan/50 bg-panel2 px-4 py-3 text-center font-display text-2xl tracking-widest text-cyan">
              {profile?.invite_code}
            </div>
            {profile?.free_access_until &&
              new Date(profile.free_access_until) > new Date() && (
                <p className="mt-3 font-body text-xs text-gold">
                  Akses gratis aktif sampai{" "}
                  {new Date(profile.free_access_until).toLocaleString("id-ID")}
                </p>
              )}
          </div>
        </div>

        {/* VOUCHER MILIK USER */}
        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <h2 className="font-display text-xl text-ink">Voucher saya</h2>
          {pendingVouchers.length === 0 ? (
            <p className="mt-2 font-body text-sm text-muted">
              Belum ada voucher yang diklaim.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {pendingVouchers.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded border border-line px-4 py-2 font-body text-sm"
                >
                  <span className="text-ink">{v.code}</span>
                  <span className="text-muted">
                    {v.duration_days} hari · {v.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIWAYAT PESAN */}
        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <h2 className="font-display text-xl text-ink">Riwayat pesan</h2>
          {messages.length === 0 ? (
            <p className="mt-2 font-body text-sm text-muted">
              Belum ada pesan masuk.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {messages.map((m) => (
                <li key={m.id} className="rounded border border-line p-4">
                  <p className="font-display text-sm text-ink">{m.title}</p>
                  <p className="mt-1 font-body text-sm text-muted">{m.body}</p>
                  <p className="mt-1 font-body text-xs text-muted/60">
                    {new Date(m.created_at).toLocaleString("id-ID")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
