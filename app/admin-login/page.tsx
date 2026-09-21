"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim();

    // ===================================================
    // VALIDASI
    // ===================================================

    if (!cleanUsername) {
      setError("Username wajib diisi.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    if (!API_BASE) {
      setError(
        "NEXT_PUBLIC_API_URL belum tersedia."
      );
      return;
    }

    if (!APP_KEY) {
      setError(
        "NEXT_PUBLIC_APP_KEY belum tersedia."
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // LOGIN API
      // =================================================

      const loginUrl = `${API_BASE}/api/v1/auth/login`;

      console.log("========== ADMIN LOGIN ==========");
      console.log("API URL:", loginUrl);
      console.log("Username:", cleanUsername);
      console.log("App Key tersedia:", !!APP_KEY);

      const response = await fetch(loginUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-app-key": APP_KEY,
        },

        body: JSON.stringify({
          username: cleanUsername,
          password: password,
        }),
      });

      // =================================================
      // RESPONSE
      // =================================================

      const contentType =
        response.headers.get("content-type") || "";

      let result: any;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid. Status: ${response.status}`
        );
      }

      console.log(
        "LOGIN STATUS:",
        response.status
      );

      console.log(
        "LOGIN RESPONSE:",
        result
      );

      // =================================================
      // HANDLE ERROR BACKEND
      // =================================================

      if (!response.ok || result?.success === false) {
        let message =
          "Username atau password salah.";

        if (Array.isArray(result?.message)) {
          message = result.message.join(", ");
        } else if (
          typeof result?.message === "string"
        ) {
          message = result.message;
        }

        throw new Error(message);
      }

      // =================================================
      // AMBIL DATA
      // =================================================

      const data = result?.data;

      if (!data) {
        throw new Error(
          "Data login tidak ditemukan dari server."
        );
      }

      const token = data?.token;

      if (!token) {
        console.error(
          "Response login tidak memiliki token:",
          result
        );

        throw new Error(
          "Token tidak ditemukan dari server."
        );
      }

      // =================================================
      // CEK ROLE
      // =================================================

      const role = data?.role;

      console.log("LOGIN ROLE:", role);

      if (role && role !== "ADMIN") {
        throw new Error(
          "Akun yang digunakan bukan akun Admin."
        );
      }

      // =================================================
      // SIMPAN LOCAL STORAGE
      // =================================================

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "appKey",
        APP_KEY
      );

      localStorage.setItem(
        "role",
        role || "ADMIN"
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // =================================================
      // SIMPAN COOKIE
      //
      // Nama cookie ini disamakan dengan AuthGuard/
      // middleware yang kamu gunakan sebelumnya.
      // =================================================

      document.cookie =
        `bank_sampah_token=${encodeURIComponent(
          token
        )}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; ` +
        `SameSite=Lax`;

      document.cookie =
        `bank_sampah_role=${encodeURIComponent(
          role || "ADMIN"
        )}; ` +
        `path=/; ` +
        `max-age=${60 * 60 * 24}; ` +
        `SameSite=Lax`;

      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "Token berhasil disimpan."
      );

      console.log(
        "Role berhasil disimpan:",
        role || "ADMIN"
      );

      // =================================================
      // REDIRECT
      // =================================================

      window.location.replace(
        "/admin/dashboard"
      );
    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
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

  // =====================================================
  // BACK TO HOME
  // =====================================================

  const handleBackToHome = () => {
    window.location.replace("/");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F8F1] px-6 py-10">
      <div className="w-full max-w-md">

        {/* LOGO */}

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

        {/* LOGIN CARD */}

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

          {/* FORM */}

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
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
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

          {/* REGISTER */}

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

          {/* BACK */}

          <button
            type="button"
            onClick={handleBackToHome}
            disabled={loading}
            className="mt-6 w-full text-center text-sm font-medium text-[#718074] transition hover:text-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Kembali ke halaman utama
          </button>
        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-[#8A978C]">
          Bank Sampah Digital Hub © 2026
        </p>
      </div>
    </main>
  );
}