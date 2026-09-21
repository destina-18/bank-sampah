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
   * Jangan proses file static.
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  /*
   * Public route.
   */
  if (isPublicRoute(pathname)) {
    /*
     * Kalau sudah login dan membuka halaman login,
     * arahkan ke dashboard sesuai role.
     */
    if (
      pathname === "/admin-login" ||
      pathname === "/nasabah-login"
    ) {
      const token =
        request.cookies.get(
          "bank_sampah_token"
        )?.value;

      const role =
        request.cookies.get(
          "bank_sampah_role"
        )?.value;

      if (token && role) {
        const session =
          await validateSession(token);

        if (session.valid) {
          if (
            pathname === "/admin-login" &&
            session.role === "ADMIN"
          ) {
            return NextResponse.redirect(
              new URL(
                "/admin/dashboard",
                request.url
              )
            );
          }

          if (
            pathname === "/nasabah-login" &&
            session.role === "NASABAH"
          ) {
            return NextResponse.redirect(
              new URL(
                "/nasabah/dashboard",
                request.url
              )
            );
          }
        }
      }
    }

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

    if (!token) {
      return redirectToLogin(
        request,
        "/admin-login"
      );
    }

    const session =
      await validateSession(token);

    /*
     * Token invalid / expired.
     */
    if (!session.valid) {
      const response =
        redirectToLogin(
          request,
          "/admin-login"
        );

      response.cookies.delete(
        "bank_sampah_token"
      );

      response.cookies.delete(
        "bank_sampah_role"
      );

      return response;
    }

    /*
     * Nasabah mencoba masuk Admin.
     */
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(
          "/nasabah/dashboard",
          request.url
        )
      );
    }

    const response =
      NextResponse.next();

    /*
     * Jangan simpan response halaman protected
     * di HTTP cache.
     */
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

    if (!token) {
      return redirectToLogin(
        request,
        "/nasabah-login"
      );
    }

    const session =
      await validateSession(token);

    /*
     * Token invalid / expired.
     */
    if (!session.valid) {
      const response =
        redirectToLogin(
          request,
          "/nasabah-login"
        );

      response.cookies.delete(
        "bank_sampah_token"
      );

      response.cookies.delete(
        "bank_sampah_role"
      );

      return response;
    }

    /*
     * Admin mencoba masuk Nasabah.
     */
    if (session.role !== "NASABAH") {
      return NextResponse.redirect(
        new URL(
          "/admin/dashboard",
          request.url
        )
      );
    }

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/nasabah/:path*",
    "/admin-login",
    "/nasabah-login",
  ],
};