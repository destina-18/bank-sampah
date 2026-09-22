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

  // =========================
  // HANDLE LOGIN
  // =========================

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
            password,
          }),
        }
      );

      // =========================
      // CEK RESPONSE
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
      // VALIDASI RESPONSE API
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
      // SIMPAN DATA USER
      // =========================

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // =========================
      // COOKIE TOKEN
      // =========================

      document.cookie =
        `bank_sampah_token=${encodeURIComponent(
          data.token
        )}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; ` +
        `SameSite=Lax;`;

      // =========================
      // COOKIE ROLE
      // =========================

      document.cookie =
        `bank_sampah_role=${encodeURIComponent(
          data.role || "NASABAH"
        )}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; ` +
        `SameSite=Lax;`;

      // =========================
      // LOGIN BERHASIL
      // =========================

      setSuccess(
        "Login berhasil. Mengarahkan..."
      );

      // =========================
      // REDIRECT
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
  // BACK TO HOME
  // =========================

  const handleBackToHome = () => {
    window.location.replace("/");
  };

  return (
    <main className="min-h-screen bg-[#F7FAF3] px-5 py-10">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mx-auto mb-9 max-w-[450px] text-center">

        {/* LOGO */}

        <div className="mx-auto mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[#2A7C13] shadow-[0_6px_14px_rgba(42,124,19,0.18)]">
          <span className="text-[30px]">
            ♻
          </span>
        </div>

        <h1 className="font-serif text-[30px] font-bold text-[#173F13]">
          Bank Sampah
        </h1>

        <p className="mt-1 text-sm text-[#75806F]">
          Panel Nasabah
        </p>
      </div>

      {/* =========================
          LOGIN CARD
      ========================= */}

      <div className="mx-auto w-full max-w-[450px]">

        <div className="rounded-[22px] bg-white px-8 py-9 shadow-[0_12px_30px_rgba(42,124,19,0.10)]">

          {/* TITLE */}

          <div className="mb-7">
            <h2 className="font-serif text-[25px] font-bold text-[#173F13]">
              Login Nasabah
            </h2>

            <p className="mt-2 text-sm text-[#7C8478]">
              Masuk untuk mengelola akun Bank Sampah Digital.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* USERNAME */}

            <div>
              <label
                htmlFor="username"
                className="mb-2 block font-serif text-sm font-semibold text-[#284A24]"
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
                placeholder="Masukkan username"
                autoComplete="username"
                disabled={loading}
                className="h-[50px] w-full rounded-[13px] border border-[#DCE5D7] bg-white px-4 text-sm text-[#40513B] outline-none transition placeholder:text-[#A2AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/15 disabled:bg-[#F5F6F3]"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-serif text-sm font-semibold text-[#284A24]"
              >
                Password
              </label>

              <div className="relative">

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
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-[50px] w-full rounded-[13px] border border-[#DCE5D7] bg-white px-4 pr-12 text-sm text-[#40513B] outline-none transition placeholder:text-[#A2AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/15 disabled:bg-[#F5F6F3]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7B8A76] hover:text-[#2A7C13]"
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
                      strokeWidth="1.8"
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
                      strokeWidth="1.8"
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
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-[11px] border border-[#E8C9C0] bg-[#FFF8F5] px-4 py-3">
                <p className="text-xs text-[#A55F4C]">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="rounded-[11px] border border-[#B9D9AE] bg-[#F1F8ED] px-4 py-3">
                <p className="text-xs text-[#2A7C13]">
                  {success}
                </p>
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="h-[51px] w-full rounded-[12px] bg-[#2A7C13] text-sm font-bold text-white shadow-[0_5px_10px_rgba(42,124,19,0.16)] transition hover:bg-[#236A10] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "MEMPROSES..."
                : "Login Nasabah"}
            </button>

            {/* REGISTER */}

            <div className="border-t border-[#EDF0EA] pt-6 text-center">

              <p className="text-sm text-[#7B8278]">
                Belum punya akun?
              </p>

              <Link
                href="/nasabah-register"
                className="mt-1 inline-block text-sm font-bold text-[#2A7C13] hover:underline"
              >
                Daftar Akun Nasabah
              </Link>

            </div>

          </form>

          {/* BACK */}

          <button
            type="button"
            onClick={handleBackToHome}
            disabled={loading}
            className="mt-6 w-full text-center text-sm text-[#7B8278] transition hover:text-[#2A7C13]"
          >
            ← Kembali ke halaman utama
          </button>

        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-[#8B9486]">
          Bank Sampah Digital Hub © 2026
        </p>

      </div>
    </main>
  );
}