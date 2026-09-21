"use client";

import { useEffect, useState } from "react";
import {
  UserCircle,
  User,
  Phone,
  MapPin,
  Coins,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* =========================================================
   TYPE
   ========================================================= */

type Nasabah = {
  id?: string;
  namaNasabah?: string;
  alamat?: string;
  telp?: string;
  saldoPoin?: number;
  foto?: string | null;
};

type ProfileData = {
  id?: string;
  username?: string;
  role?: string;
  nasabah?: Nasabah | null;
  adminBank?: unknown;
};

type ApiResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: ProfileData;
};

/* =========================================================
   HELPER
   ========================================================= */

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    ""
  ).replace(/\/+$/, "");
}

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken") ||
    ""
  );
}

function getAppKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("appKey") ||
    localStorage.getItem("app_key") ||
    process.env.NEXT_PUBLIC_APP_KEY ||
    ""
  );
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}

/* =========================================================
   FOTO URL
   ========================================================= */

function getFotoUrl(
  foto?: string | null
): string | null {
  if (!foto) {
    return null;
  }

  /*
   * Kalau API sudah memberikan URL lengkap
   */
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }

  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return foto;
  }

  /*
   * Contoh:
   *
   * /uploads/foto.jpeg
   *
   * menjadi:
   *
   * https://learn.smktelkom-mlg.sch.id/bank_sampah/uploads/foto.jpeg
   */
  return `${baseUrl}${
    foto.startsWith("/")
      ? foto
      : `/${foto}`
  }`;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function AkunNasabahPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     GET PROFILE
     ======================================================= */

  async function fetchProfile(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();
      const appKey = getAppKey();
      const baseUrl = getBaseUrl();

      /* =====================================================
         CEK TOKEN
         ===================================================== */

      if (!token) {
        router.replace("/nasabah-login");
        return;
      }

      /* =====================================================
         CEK API URL
         ===================================================== */

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      /* =====================================================
         GET PROFILE
         ===================================================== */

      const response = await fetch(
        `${baseUrl}/api/v1/auth/me`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-app-key": appKey,
          },

          cache: "no-store",
        }
      );

      /* =====================================================
         CEK CONTENT TYPE
         ===================================================== */

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response API tidak valid (${response.status}).`
        );
      }

      /* =====================================================
         PARSE RESPONSE
         ===================================================== */

      const result: ApiResponse =
        await response.json();

      console.log(
        "PROFILE NASABAH:",
        result
      );

      /* =====================================================
         AUTH ERROR
         ===================================================== */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accesstoken");

        router.replace(
          "/nasabah-login"
        );

        return;
      }

      /* =====================================================
         API ERROR
         ===================================================== */

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            `Gagal mengambil profil (${response.status}).`
        );
      }

      /* =====================================================
         CEK DATA
         ===================================================== */

      if (!result.data) {
        throw new Error(
          "Data profil tidak ditemukan."
        );
      }

      /* =====================================================
         CEK ROLE
         ===================================================== */

      if (
        result.data.role &&
        result.data.role.toUpperCase() !==
          "NASABAH"
      ) {
        throw new Error(
          "Token yang digunakan bukan tipe token Nasabah."
        );
      }

      /* =====================================================
         SIMPAN PROFILE
         ===================================================== */

      setProfile(result.data);

      /* =====================================================
         SIMPAN USER TERBARU
         ===================================================== */

      localStorage.setItem(
        "user",
        JSON.stringify(result.data)
      );

      /* =====================================================
         DEBUG FOTO
         ===================================================== */

      console.log(
        "Foto dari API:",
        result.data.nasabah?.foto
      );

      console.log(
        "URL foto:",
        getFotoUrl(
          result.data.nasabah?.foto
        )
      );

    } catch (err) {
      console.error(
        "FETCH PROFILE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data profil."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =======================================================
     LOGOUT
     ======================================================= */

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("appKey");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    document.cookie =
      "bank_sampah_token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;";

    document.cookie =
      "bank_sampah_role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;";

    document.cookie =
      "token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accessToken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accesstoken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    window.location.replace("/");
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">

          <div className="h-8 w-40 animate-pulse rounded-lg bg-[#e7e0d6]" />

          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#ebe5dc]" />

          <div className="mt-7 overflow-hidden rounded-3xl border border-[#e5ded4] bg-[#fffdf9]">

            <div className="h-36 animate-pulse bg-[#e8eee5]" />

            <div className="px-6 pb-6">

              <div className="-mt-12 h-24 w-24 animate-pulse rounded-full border-4 border-[#fffdf9] bg-[#dce6d8]" />

              <div className="mt-5 h-6 w-48 animate-pulse rounded bg-[#e7e0d6]" />

              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#ebe5dc]" />

            </div>

          </div>

        </div>
      </main>
    );
  }

  /* =======================================================
     PROFILE DATA
     ======================================================= */

  const nasabah =
    profile?.nasabah;

  const nama =
    nasabah?.namaNasabah ||
    "Nasabah";

  const username =
    profile?.username ||
    "-";

  const alamat =
    nasabah?.alamat ||
    "-";

  const telp =
    nasabah?.telp ||
    "-";

  const saldo =
    nasabah?.saldoPoin ||
    0;

  const foto =
    getFotoUrl(
      nasabah?.foto
    );

  /* =======================================================
     MAIN
     ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-7">

          <div className="mb-3 flex items-center gap-2 text-xs text-[#938a80]">
            <span>Nasabah</span>

            <span>/</span>

            <span>Akun</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h1 className="text-2xl font-semibold tracking-tight text-[#403c36] md:text-3xl">
                Akun Saya
              </h1>

              <p className="mt-1 text-sm leading-6 text-[#91887d]">
                Kelola dan lihat informasi
                akun nasabah kamu.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                fetchProfile(true)
              }
              disabled={refreshing}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e3ddd4] bg-[#fffdf9] px-4 text-xs font-medium text-[#696157] transition hover:bg-[#f3f0ea] disabled:opacity-60"
            >

              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a15e55]">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Gagal mengambil data akun
              </p>

              <p className="mt-1 text-xs leading-5">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                fetchProfile()
              }
              className="text-xs font-medium underline"
            >
              Coba lagi
            </button>

          </div>
        )}

        {/* =================================================
            PROFILE CARD
            ================================================= */}

        {/*
         * PENTING:
         *
         * Jangan gunakan overflow-hidden di parent card.
         * Avatar sengaja keluar sedikit dari cover.
         */}
        <section className="relative rounded-3xl border border-[#e5ded4] bg-[#fffdf9] shadow-[0_8px_30px_rgba(86,72,52,0.05)]">

          {/* =================================================
              COVER
              ================================================= */}

          <div className="relative h-36 overflow-hidden rounded-t-3xl bg-[#dfe9dc]">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.6),transparent_30%)]" />

            {/* Dekorasi lembut */}

            <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/20 blur-2xl" />

            <div className="absolute -left-10 bottom-[-70px] h-40 w-40 rounded-full bg-[#c9ddc5]/40 blur-2xl" />

            {/* BADGE AKUN */}

            <div className="absolute bottom-4 left-6 rounded-full border border-white/60 bg-white/40 px-3 py-1 backdrop-blur-sm">

              <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#52704b]">

                <ShieldCheck
                  size={13}
                />

                Akun Nasabah

              </div>

            </div>

          </div>

          {/* =================================================
              PROFILE CONTENT
              ================================================= */}

          <div className="px-5 pb-6 sm:px-7">

            {/* =================================================
                AVATAR + ROLE
                ================================================= */}

            <div className="relative flex items-end justify-between">

              {/* AVATAR */}

              <div className="-mt-14 relative z-20">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[5px] border-[#fffdf9] bg-[#edf4ea] shadow-[0_5px_18px_rgba(86,72,52,0.15)]">

                  {foto ? (
                    <img
                      src={foto}
                      alt={`Foto ${nama}`}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        console.error(
                          "Gagal memuat foto:",
                          foto
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <UserCircle
                      size={65}
                      strokeWidth={1.4}
                      className="text-[#5d7a55]"
                    />
                  )}

                </div>

              </div>

              {/* ROLE */}

              <div className="mb-1">

                <span className="rounded-full border border-[#d5e3d1] bg-[#edf5ea] px-3 py-1.5 text-[10px] font-medium text-[#52744b]">

                  NASABAH

                </span>

              </div>

            </div>

            {/* =================================================
                NAME
                ================================================= */}

            <div className="mt-4">

              <h2 className="text-xl font-semibold text-[#403c36]">
                {nama}
              </h2>

              <p className="mt-1 text-sm text-[#91887d]">
                @{username}
              </p>

            </div>

            {/* =================================================
                SALDO
                ================================================= */}

            <div className="mt-6 rounded-2xl bg-[#edf5ea] p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-medium text-[#71836c]">
                    Saldo Poin
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#52744b]">

                    {formatNumber(
                      saldo
                    )}

                    <span className="ml-1 text-sm font-medium">
                      poin
                    </span>

                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#5d7a55] shadow-sm">

                  <Coins
                    size={22}
                  />

                </div>

              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#82907c]">
                Poin yang tersedia pada
                akun kamu saat ini.
              </p>

            </div>

            {/* =================================================
                INFORMASI AKUN
                ================================================= */}

            <div className="mt-6">

              <div className="mb-3 flex items-center gap-2">

                <User
                  size={17}
                  className="text-[#5d7a55]"
                />

                <h3 className="text-sm font-semibold text-[#4b463f]">
                  Informasi Akun
                </h3>

              </div>

              <div className="grid gap-3 md:grid-cols-2">

                {/* USERNAME */}

                <div className="rounded-2xl border border-[#ebe5dc] bg-[#fcfaf6] p-4">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#a0988e]">
                    Username
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ea] text-[#5d7a55]">

                      <User
                        size={16}
                      />

                    </div>

                    <p className="text-sm font-medium text-[#4b463f]">
                      {username}
                    </p>

                  </div>

                </div>

                {/* TELEPON */}

                <div className="rounded-2xl border border-[#ebe5dc] bg-[#fcfaf6] p-4">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#a0988e]">
                    Nomor Telepon
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ea] text-[#5d7a55]">

                      <Phone
                        size={16}
                      />

                    </div>

                    <p className="text-sm font-medium text-[#4b463f]">
                      {telp}
                    </p>

                  </div>

                </div>

                {/* ALAMAT */}

                <div className="rounded-2xl border border-[#ebe5dc] bg-[#fcfaf6] p-4 md:col-span-2">

                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#a0988e]">
                    Alamat
                  </p>

                  <div className="mt-2 flex items-start gap-2">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4ea] text-[#5d7a55]">

                      <MapPin
                        size={16}
                      />

                    </div>

                    <p className="pt-1 text-sm leading-6 text-[#4b463f]">
                      {alamat}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ID NASABAH
                ================================================= */}

            <div className="mt-5 rounded-2xl border border-[#ebe5dc] bg-[#fcfaf6] p-4">

              <p className="text-[10px] font-medium uppercase tracking-wide text-[#a0988e]">
                ID Nasabah
              </p>

              <p className="mt-2 break-all font-mono text-xs text-[#696157]">
                {nasabah?.id ||
                  "-"}
              </p>

            </div>

            {/* =================================================
                LOGOUT
                ================================================= */}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ead4d0] bg-[#fff8f6] text-sm font-medium text-[#a15e55] transition hover:bg-[#faefed]"
            >

              <LogOut
                size={17}
              />

              Keluar dari Akun

            </button>

          </div>

        </section>

        {/* =================================================
            NOTE
            ================================================= */}

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-4">

          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-[#71866a]"
          />

          <p className="text-xs leading-5 text-[#8d857b]">
            Informasi akun diambil langsung
            dari profil pengguna yang sedang
            login.
          </p>

        </div>

        {/* =================================================
            BACK
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/nasabah/dashboard"
            )
          }
          className="mt-5 flex items-center gap-2 text-xs font-medium text-[#6e675e] transition hover:text-[#52744b]"
        >

          <ArrowLeft
            size={15}
          />

          Kembali ke Dashboard

        </button>

      </div>

    </main>
  );
}