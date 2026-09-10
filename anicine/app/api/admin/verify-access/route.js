import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request) {
  const { accessCode } = await request.json();
  const cookieStore = cookies();

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

  if (!user) {
    return NextResponse.json(
      { message: "Kamu harus login dulu." },
      { status: 401 }
    );
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdminEmail = adminEmails.includes((user.email || "").toLowerCase());
  const codeMatches = accessCode === process.env.ADMIN_ACCESS_CODE;

  if (!isAdminEmail || !codeMatches) {
    return NextResponse.json(
      { message: "Kode akses salah atau akun ini bukan admin." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("anicine_admin_ok", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4, // 4 jam, lalu harus verifikasi kode akses lagi
    path: "/",
  });
  return response;
}
