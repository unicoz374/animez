"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281232715307";

export default function AccessGate({ children }) {
  const [status, setStatus] = useState("checking"); // checking | allowed | blocked

  useEffect(() => {
    let mounted = true;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setStatus("blocked");
        return;
      }

      // free_access_until dipakai sebagai satu sumber kebenaran untuk masa akses:
      // diperpanjang otomatis tiap kali voucher diklaim (sesuai durasinya) ATAU
      // saat kode undangan dipakai orang lain (+1 hari bonus).
      const { data: profile } = await supabase
        .from("profiles")
        .select("free_access_until")
        .eq("id", user.id)
        .single();

      const hasAccess =
        profile?.free_access_until &&
        new Date(profile.free_access_until) > new Date();

      if (mounted) setStatus(hasAccess ? "allowed" : "blocked");
    }

    check();
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <p className="font-body text-sm text-muted">Memeriksa akses kamu...</p>
    );
  }

  if (status === "allowed") {
    return children;
  }

  return (
    <div className="ticket-edge rounded-lg border border-dashed border-neon/50 bg-panel p-8 text-center">
      <p className="font-display text-2xl text-ink">Konten ini butuh akses</p>
      <p className="mt-2 font-body text-sm text-muted">
        Aktifkan lewat voucher yang sudah kamu klaim, atau undang teman untuk
        dapat gratis 1 hari.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/account"
          className="rounded-full border border-line px-5 py-2 font-body text-sm text-ink hover:border-cyan hover:text-cyan"
        >
          Cek voucher saya
        </Link>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
            "Halo, saya mau beli accvoucher ANICINE."
          )}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-neon px-5 py-2 font-body text-sm text-void hover:bg-ink"
        >
          Beli accvoucher via WhatsApp
        </a>
      </div>
    </div>
  );
}
