"use client";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

type Role = "ADMIN" | "NASABAH";

interface AuthGuardProps {
  role: Role;
  children: React.ReactNode;
}

function getCookie(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies =
    document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] =
      cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(
        value.join("=")
      );
    }
  }

  return "";
}

function clearAuthCookies() {
  const cookies = [
    "bank_sampah_token",
    "bank_sampah_role",
  ];

  for (const name of cookies) {
    document.cookie =
      `${name}=; ` +
      "Path=/; " +
      "Max-Age=0; " +
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT; " +
      "SameSite=Lax;";
  }
}

function clearClientStorage() {
  const keys = [
    "token",
    "accessToken",
    "accesstoken",
    "jwt",
    "nasabah_token",
    "nasabah_user",
    "user",
    "role",
    "appKey",
  ];

  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export default function AuthGuard({
  role,
  children,
}: AuthGuardProps) {
  const pathname = usePathname();

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token =
        getCookie("bank_sampah_token");

      const savedRole =
        getCookie("bank_sampah_role");

      /*
       * Tidak ada token.
       */
      if (!token) {
        if (!cancelled) {
          setChecking(false);
          window.location.replace(
            role === "ADMIN"
              ? "/admin-login"
              : "/nasabah-login"
          );
        }

        return;
      }

      /*
       * Role cookie tidak sesuai.
       */
      if (
        savedRole &&
        savedRole !== role
      ) {
        if (!cancelled) {
          setChecking(false);

          window.location.replace(
            savedRole === "ADMIN"
              ? "/admin/dashboard"
              : "/nasabah/dashboard"
          );
        }

        return;
      }

      /*
       * Validasi token langsung ke backend.
       */
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        const appKey =
          process.env.NEXT_PUBLIC_APP_KEY;

        if (!apiUrl || !appKey) {
          throw new Error(
            "Konfigurasi API tidak tersedia."
          );
        }

        const response =
          await fetch(
            `${apiUrl}/api/v1/auth/me`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "x-app-key": appKey,
              },
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Session tidak valid."
          );
        }

        const result =
          await response.json();

        const currentRole =
          result?.data?.role;

        if (currentRole !== role) {
          throw new Error(
            "Role tidak sesuai."
          );
        }

        if (!cancelled) {
          setChecking(false);
        }
      } catch (error) {
        console.error(
          "AUTH GUARD ERROR:",
          error
        );

        clearAuthCookies();
        clearClientStorage();

        if (!cancelled) {
          setChecking(false);

          window.location.replace(
            role === "ADMIN"
              ? "/admin-login"
              : "/nasabah-login"
          );
        }
      }
    };

    checkAuth();

    /*
     * =====================================================
     * BACK/FORWARD CACHE
     * =====================================================
     *
     * Browser bisa memulihkan halaman dari BFCache.
     * Karena itu kita validasi ulang ketika halaman
     * dihidupkan kembali.
     */
    const handlePageShow = (
      event: PageTransitionEvent
    ) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, [pathname, role]);

  /*
   * Jangan render isi dashboard sebelum
   * session selesai diverifikasi.
   */
  if (checking) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] flex items-center justify-center">
        <div className="text-sm text-[#6f7d72]">
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}