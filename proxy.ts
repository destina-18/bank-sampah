import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY;

const PUBLIC_ROUTES = [
  "/",
  "/admin-login",
  "/admin-register",
  "/nasabah-login",
  "/nasabah-register",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  });
}

function redirectToLogin(
  request: NextRequest,
  loginPath: string
) {
  const loginUrl = new URL(loginPath, request.url);

  loginUrl.searchParams.set(
    "from",
    request.nextUrl.pathname
  );

  return NextResponse.redirect(loginUrl);
}

async function validateSession(
  token: string
): Promise<{
  valid: boolean;
  role?: "ADMIN" | "NASABAH";
}> {
  if (!API_URL || !APP_KEY || !token) {
    return {
      valid: false,
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-app-key": APP_KEY,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        valid: false,
      };
    }

    const result = await response.json();

    const role = result?.data?.role;

    if (
      role !== "ADMIN" &&
      role !== "NASABAH"
    ) {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      role,
    };
  } catch (error) {
    console.error(
      "PROXY AUTH VALIDATION ERROR:",
      error
    );

    return {
      valid: false,
    };
  }
}

export async function proxy(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  /*
   * =====================================================
   * STATIC FILE
   * =====================================================
   *
   * Jangan proses file static seperti:
   * - _next
   * - favicon
   * - gambar
   * - css
   * - js
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  /*
   * =====================================================
   * PUBLIC ROUTE
   * =====================================================
   *
   * Halaman berikut selalu boleh dibuka:
   *
   * /
   * /admin-login
   * /admin-register
   * /nasabah-login
   * /nasabah-register
   *
   * PENTING:
   * Jangan redirect /nasabah-login ke dashboard
   * hanya karena cookie login masih ada.
   *
   * Jadi ketika user klik:
   *
   * Landing
   *   ↓
   * Login Nasabah
   *   ↓
   * /nasabah-login
   *
   * halaman login tetap ditampilkan.
   */
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  /*
   * =====================================================
   * ADMIN
   * =====================================================
   */
  if (pathname.startsWith("/admin/")) {
    const token =
      request.cookies.get(
        "bank_sampah_token"
      )?.value;

    /*
     * Tidak ada token
     * → kembali ke login admin
     */
    if (!token) {
      return redirectToLogin(
        request,
        "/admin-login"
      );
    }

    /*
     * Validasi token ke API
     */
    const session =
      await validateSession(token);

    /*
     * Token invalid / expired
     */
    if (!session.valid) {
      const response =
        redirectToLogin(
          request,
          "/admin-login"
        );

      /*
       * Hapus session cookie
       */
      response.cookies.delete(
        "bank_sampah_token"
      );

      response.cookies.delete(
        "bank_sampah_role"
      );

      return response;
    }

    /*
     * Nasabah mencoba membuka halaman Admin
     */
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/nasabah/dashboard",
          request.url
        )
      );
    }

    /*
     * Jangan cache halaman protected
     */
    const response =
      NextResponse.next();

    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, max-age=0, must-revalidate"
    );

    response.headers.set(
      "Pragma",
      "no-cache"
    );

    response.headers.set(
      "Expires",
      "0"
    );

    return response;
  }

  /*
   * =====================================================
   * NASABAH
   * =====================================================
   */
  if (pathname.startsWith("/nasabah/")) {
    const token =
      request.cookies.get(
        "bank_sampah_token"
      )?.value;

    /*
     * Tidak ada token
     * → kembali ke login nasabah
     */
    if (!token) {
      return redirectToLogin(
        request,
        "/nasabah-login"
      );
    }

    /*
     * Validasi token ke API
     */
    const session =
      await validateSession(token);

    /*
     * Token invalid / expired
     */
    if (!session.valid) {
      const response =
        redirectToLogin(
          request,
          "/nasabah-login"
        );

      /*
       * Hapus session cookie
       */
      response.cookies.delete(
        "bank_sampah_token"
      );

      response.cookies.delete(
        "bank_sampah_role"
      );

      return response;
    }

    /*
     * Admin mencoba membuka halaman Nasabah
     */
    if (session.role !== "NASABAH") {
      return NextResponse.redirect(
        new URL(
          "/admin/dashboard",
          request.url
        )
      );
    }

    /*
     * Jangan cache halaman protected
     */
    const response =
      NextResponse.next();

    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, max-age=0, must-revalidate"
    );

    response.headers.set(
      "Pragma",
      "no-cache"
    );

    response.headers.set(
      "Expires",
      "0"
    );

    return response;
  }

  /*
   * =====================================================
   * DEFAULT
   * =====================================================
   */
  return NextResponse.next();
}

/*
 * =====================================================
 * MATCHER
 * =====================================================
 *
 * Proxy hanya dijalankan untuk:
 *
 * /admin/*
 * /nasabah/*
 * /admin-login
 * /nasabah-login
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/nasabah/:path*",
    "/admin-login",
    "/nasabah-login",
  ],
};