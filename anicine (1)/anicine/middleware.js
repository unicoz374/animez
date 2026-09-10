import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Middleware ini memastikan:
// - /browse, /browse/**, /account  -> wajib login (Supabase Auth)
// - /admin/dashboard               -> wajib login DAN sudah lolos verifikasi kode akses admin
//   (verifikasi kode akses disimpan lewat cookie httpOnly "anicine_admin_ok" oleh /admin/login)
export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const needsAuth =
    pathname.startsWith("/browse") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/admin/dashboard");

  if (needsAuth && !user) {
    const loginUrl = pathname.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  if (pathname.startsWith("/admin/dashboard")) {
    const adminOk = request.cookies.get("anicine_admin_ok")?.value === "1";
    if (!adminOk) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/browse/:path*", "/account/:path*", "/admin/dashboard/:path*"],
};
