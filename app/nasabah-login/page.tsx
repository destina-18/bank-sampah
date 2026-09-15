"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function NasabahLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDASI
    // =========================

    if (!username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (!password.trim()) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // KONFIGURASI API
      // =========================

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      const appKey =
        process.env.NEXT_PUBLIC_APP_KEY;

      if (!apiUrl || !appKey) {
        throw new Error(
          "Konfigurasi API belum tersedia."
        );
      }

      // =========================
      // REQUEST LOGIN
      // =========================

      const response = await fetch(
        `${apiUrl}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-app-key": appKey,
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      // =========================
      // CEK CONTENT TYPE
      // =========================

      const contentType =
        response.headers.get("content-type");

      let result: any;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response yang tidak valid. Status: ${response.status}`
        );
      }

      // =========================
      // CEK RESPONSE API
      // =========================

      if (!response.ok || !result.success) {
        let message =
          result?.message ||
          "Username atau password salah.";

        if (Array.isArray(message)) {
          message = message.join(", ");
        }

        throw new Error(message);
      }

      // =========================
      // AMBIL DATA
      // =========================

      const data = result.data;

      if (!data?.token) {
        throw new Error(
          "Token tidak ditemukan dari server."
        );
      }

      // =========================
      // SIMPAN TOKEN
      // =========================

      localStorage.setItem(
        "token",
        data.token
      );

      // =========================
      // SIMPAN APP KEY
      // =========================

      localStorage.setItem(
        "appKey",
        appKey
      );

      // =========================
      // SIMPAN DATA NASABAH
      // =========================

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // =========================
      // SIMPAN TOKEN COOKIE
      // =========================

      document.cookie =
        `token=${encodeURIComponent(data.token)}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; `;

      // =========================
      // LOGIN BERHASIL
      // =========================

      setSuccess(
        "Login berhasil. Mengarahkan..."
      );

      // =========================
      // MASUK HALAMAN NASABAH
      // =========================

      setTimeout(() => {
        window.location.replace(
          "/nasabah/dashboard"
        );
      }, 800);
    } catch (error) {
      console.error(
        "NASABAH LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // KEMBALI KE HOME
  // =========================

  const handleBackToHome = () => {
    window.location.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3EADF] px-5 py-8">

      <div className="w-full max-w-[430px]">

        {/* =========================
            CARD
        ========================= */}

        <div className="rounded-[28px] border border-[#E8DED3] bg-white px-6 py-8 shadow-[0_12px_35px_rgba(92,72,55,0.08)] sm:px-8 sm:py-9">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-8 text-center">

            {/* LOGO */}

            <div className="mx-auto mb-4 flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#F1EEE8]">

              <svg
                width="54"
                height="54"
                viewBox="0 0 64 64"
                fill="none"
              >
                {/* daun kiri */}
                <path
                  d="M30 31C22 30 16 24 17 16C25 16 31 21 30 31Z"
                  stroke="#7C9475"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* daun kanan */}
                <path
                  d="M34 31C35 21 42 15 50 16C50 25 43 31 34 31Z"
                  stroke="#7C9475"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* batang */}
                <path
                  d="M32 52V27"
                  stroke="#7C9475"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* daun bawah kiri */}
                <path
                  d="M32 42C25 42 20 38 20 32C27 32 32 36 32 42Z"
                  stroke="#7C9475"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* daun bawah kanan */}
                <path
                  d="M33 42C40 42 45 38 45 32C38 32 33 36 33 42Z"
                  stroke="#7C9475"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </div>

            <h1 className="text-[20px] font-semibold tracking-wide text-[#4B4741]">
              BANK SAMPAH
            </h1>

            <p className="mt-1 text-sm text-[#9A948C]">
              Selamat datang kembali
            </p>

          </div>

          {/* =========================
              FORM LOGIN
          ========================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            {/* =========================
                USERNAME
            ========================= */}

            <div>

              <label
                htmlFor="username"
                className="sr-only"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Username"
                autoComplete="username"
                disabled={loading}
                className="h-[46px] w-full rounded-[9px] border border-[#DED8D0] bg-white px-4 text-sm text-[#514D47] outline-none transition placeholder:text-[#AAA49C] focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F8F6F3]"
              />

            </div>

            {/* =========================
                PASSWORD
            ========================= */}

            <div className="relative">

              <label
                htmlFor="password"
                className="sr-only"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
                disabled={loading}
                className="h-[46px] w-full rounded-[9px] border border-[#DED8D0] bg-white px-4 pr-11 text-sm text-[#514D47] outline-none transition placeholder:text-[#AAA49C] focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F8F6F3]"
              />

              {/* =========================
                  SHOW PASSWORD
              ========================= */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99928A] transition hover:text-[#6E675F] disabled:opacity-50"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />

                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                    <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.5 1.5-1.4 2.9-2.5 4" />

                    <path d="M6.2 6.2C4.5 7.4 3.3 9.2 2 12c1.3 3.8 5 8 10 8 1.5 0 2.8-.4 4-.9" />
                  </svg>
                ) : (
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.7"
                    />
                  </svg>
                )}
              </button>

            </div>

            {/* =========================
                LUPA PASSWORD
            ========================= */}

            <div className="flex justify-end">

              <Link
                href="/forgot-password"
                className="text-xs text-[#718867] transition hover:underline"
              >
                Lupa Password?
              </Link>

            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div className="rounded-[9px] border border-[#E9CACA] bg-[#FFF7F7] px-3.5 py-2.5">
                <p className="text-xs text-[#B76565]">
                  {error}
                </p>
              </div>
            )}

            {/* =========================
                SUCCESS
            ========================= */}

            {success && (
              <div className="rounded-[9px] border border-[#D3E0CE] bg-[#F5F9F3] px-3.5 py-2.5">
                <p className="text-xs text-[#66805E]">
                  {success}
                </p>
              </div>
            )}

            {/* =========================
                LOGIN BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="h-[46px] w-full rounded-[9px] bg-[#777A76] text-sm font-medium text-white transition hover:bg-[#686B67] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "MEMPROSES..."
                : "LOGIN"}
            </button>

            {/* =========================
                REGISTER
            ========================= */}

            <div className="pt-1 text-center">

              <span className="text-xs text-[#969089]">
                Belum punya akun?{" "}
              </span>

              <Link
                href="/nasabah-register"
                className="text-xs font-medium text-[#718867] transition hover:underline"
              >
                Daftar
              </Link>

            </div>

          </form>

          {/* =========================
              BACK TO HOME
          ========================= */}

          <button
            type="button"
            onClick={handleBackToHome}
            disabled={loading}
            className="mt-6 w-full text-center text-sm font-medium text-[#969089] transition hover:text-[#718867] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Kembali ke halaman utama
          </button>

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <p className="mt-5 text-center text-[11px] text-[#AAA39B]">
          Bank Sampah
        </p>

      </div>
    </main>
  );
}