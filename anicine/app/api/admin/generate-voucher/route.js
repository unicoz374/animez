import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function generateVoucherCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa karakter ambigu (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 4) code += "-";
  }
  return code; // format: XXXXX-XXXXX
}

export async function POST(request) {
  const cookieStore = cookies();

  // 1) Pastikan yang memanggil ini benar admin yang sudah lolos login + kode akses.
  const adminOk = cookieStore.get("anicine_admin_ok")?.value === "1";
  if (!adminOk) {
    return NextResponse.json(
      { message: "Tidak diizinkan. Silakan login admin ulang." },
      { status: 403 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!user || !adminEmails.includes((user.email || "").toLowerCase())) {
    return NextResponse.json(
      { message: "Akun ini bukan admin." },
      { status: 403 }
    );
  }

  const { note, durationDays } = await request.json();

  // 2) Generate kode unik, cek tabrakan sangat kecil kemungkinannya tapi tetap dijaga
  let code = generateVoucherCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabaseAdmin
      .from("vouchers")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateVoucherCode();
  }

  const { data: voucher, error } = await supabaseAdmin
    .from("vouchers")
    .insert({
      code,
      note: note || null,
      duration_days: durationDays || 30,
      created_by_admin: user.email,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { message: "Gagal menyimpan voucher: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ voucher });
}
