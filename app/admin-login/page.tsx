"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const appKey = process.env.NEXT_PUBLIC_APP_KEY;

      if (!apiUrl || !appKey) {
        throw new Error(
          "Konfigurasi API belum tersedia."
        );
      }

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

      const contentType =
        response.headers.get("content-type");

      let result: any;

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        result = await response.json();
      } else {
        throw new Error(
          `Server mengembalikan response yang tidak valid. Status: ${response.status}`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Username atau password salah."
        );
      }

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
      // SIMPAN TOKEN COOKIE
      // =========================

      document.cookie =
        `token=${encodeURIComponent(data.token)}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; `;

      // =========================
      // MASUK DASHBOARD ADMIN
      // =========================

      window.location.replace(
        "/admin/dashboard"
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F8F1] px-6 py-10">
      <div className="w-full max-w-md">

        {/* =========================
            LOGO
        ========================= */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2E7D32] text-3xl shadow-lg">
            ♻️
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#18351F]">
            Bank Sampah
          </h1>

          <p className="mt-2 text-sm text-[#718074]">
            Panel Admin
          </p>

        </div>

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-[#315E37]/10">

          {/* HEADER */}

          <div className="mb-7">

            <h2 className="text-2xl font-bold text-[#18351F]">
              Login Admin
            </h2>

            <p className="mt-2 text-sm text-[#718074]">
              Masuk untuk mengelola Bank Sampah Digital.
            </p>

          </div>

          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* USERNAME */}

            <div>

              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-[#38513D]"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Masukkan username"
                required
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-xl border border-[#D9E4D6] bg-[#FAFCF9] px-4 py-3.5 text-sm text-[#18351F] outline-none transition placeholder:text-[#A2ADA4] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#38513D]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Masukkan password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-[#D9E4D6] bg-[#FAFCF9] px-4 py-3.5 text-sm text-[#18351F] outline-none transition placeholder:text-[#A2ADA4] focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#2E7D32] py-3.5 font-semibold text-white shadow-md shadow-[#2E7D32]/20 transition hover:bg-[#256A2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Memproses..."
                : "Login Admin"}
            </button>

          </form>

          {/* =========================
              REGISTER ADMIN
          ========================= */}

          <div className="mt-6 border-t border-[#EDF1EB] pt-6 text-center">

            <p className="text-sm text-[#718074]">
              Belum punya akun?
            </p>

            <Link
              href="/admin-register"
              className="mt-1 inline-block text-sm font-semibold text-[#2E7D32] transition hover:text-[#256A2A] hover:underline"
            >
              Daftar Unit Bank Sampah
            </Link>

          </div>

          {/* =========================
              BACK TO HOME
          ========================= */}

          <button
            type="button"
            onClick={handleBackToHome}
            disabled={loading}
            className="mt-6 w-full text-center text-sm font-medium text-[#718074] transition hover:text-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Kembali ke halaman utama
          </button>

        </div>

        {/* =========================
            FOOTER
        ========================= */}

        <p className="mt-6 text-center text-xs text-[#8A978C]">
          Bank Sampah Digital Hub © 2026
        </p>

      </div>
    </main>
  );
}