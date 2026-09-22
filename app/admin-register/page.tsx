"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Recycle,
  User,
  UserRound,
  Phone,
  Building2,
  Check,
} from "lucide-react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const APP_KEY =
  process.env.NEXT_PUBLIC_APP_KEY || "";

const REGISTER_ENDPOINT =
  "/api/v1/auth/admin/register";

export default function AdminRegisterPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    unitName: "",
    managerName: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    // ===================================================
    // KHUSUS NOMOR TELEPON
    // HANYA BOLEH ANGKA 0-9
    // ===================================================

    if (name === "phone") {
      const numericValue =
        value.replace(/\D/g, "");

      setForm((prev) => ({
        ...prev,
        phone: numericValue,
      }));

      setError("");
      setSuccess("");

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ===================================================
    // VALIDASI
    // ===================================================

    if (!form.unitName.trim()) {
      setError(
        "Nama unit bank sampah wajib diisi."
      );
      return;
    }

    if (!form.managerName.trim()) {
      setError(
        "Nama pengelola wajib diisi."
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        "Nomor telepon wajib diisi."
      );
      return;
    }

    // Nomor telepon hanya boleh angka
    if (!/^\d+$/.test(form.phone)) {
      setError(
        "Nomor telepon hanya boleh berisi angka."
      );
      return;
    }

    if (!form.username.trim()) {
      setError(
        "Username wajib diisi."
      );
      return;
    }

    if (!form.password) {
      setError(
        "Password wajib diisi."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (!form.confirmPassword) {
      setError(
        "Konfirmasi password wajib diisi."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    if (!form.agree) {
      setError(
        "Silakan menyetujui Syarat & Ketentuan terlebih dahulu."
      );
      return;
    }

    if (!API_BASE) {
      setError(
        "NEXT_PUBLIC_API_URL belum tersedia. Periksa Environment Variables."
      );
      return;
    }

    if (!APP_KEY) {
      setError(
        "NEXT_PUBLIC_APP_KEY belum tersedia. Periksa Environment Variables."
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        "================================="
      );

      console.log(
        "REGISTER ADMIN"
      );

      console.log(
        "API:",
        API_BASE
      );

      console.log(
        "Endpoint:",
        REGISTER_ENDPOINT
      );

      console.log(
        "================================="
      );

      // =================================================
      // REQUEST REGISTER
      // =================================================

      const response =
        await fetch(
          `${API_BASE}${REGISTER_ENDPOINT}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "x-app-key":
                APP_KEY,
            },

            body: JSON.stringify({
              username:
                form.username.trim(),

              password:
                form.password,

              namaUnit:
                form.unitName.trim(),

              namaPengelola:
                form.managerName.trim(),

              // Nomor telepon dikirim
              // sebagai string berisi angka saja
              telp:
                form.phone,
            }),
          }
        );

      // =================================================
      // RESPONSE
      // =================================================

      let data: any = null;

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          `Server mengembalikan response yang tidak valid. Status: ${response.status}`
        );
      }

      console.log(
        "REGISTER STATUS:",
        response.status
      );

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      // =================================================
      // HANDLE ERROR BACKEND
      // =================================================

      if (
        !response.ok ||
        data?.success === false
      ) {
        let message =
          "Pendaftaran gagal.";

        if (
          Array.isArray(
            data?.message
          )
        ) {
          message =
            data.message.join(
              ", "
            );
        } else if (
          typeof data?.message ===
          "string"
        ) {
          message =
            data.message;
        }

        throw new Error(message);
      }

      // =================================================
      // AMBIL DATA RESPONSE
      // =================================================

      const token =
        data?.data?.token;

      const role =
        data?.data?.role;

      // =================================================
      // SIMPAN TOKEN
      // =================================================

      if (token) {
        localStorage.setItem(
          "token",
          token
        );

        document.cookie = [
          `token=${encodeURIComponent(
            token
          )}`,
          "path=/",
          `max-age=${60 * 60 * 24}`,
          "SameSite=Lax",
        ].join("; ");
      }

      // =================================================
      // SIMPAN ROLE
      // =================================================

      if (role) {
        localStorage.setItem(
          "role",
          role
        );

        document.cookie = [
          `role=${encodeURIComponent(
            role
          )}`,
          "path=/",
          `max-age=${60 * 60 * 24}`,
          "SameSite=Lax",
        ].join("; ");
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        data?.message ||
          "Pendaftaran Unit Admin Bank Sampah berhasil!"
      );

      // =================================================
      // RESET FORM
      // =================================================

      setForm({
        unitName: "",
        managerName: "",
        phone: "",
        username: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });

      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {
        window.location.href =
          "/admin-login";
      }, 1500);

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      if (
        error instanceof TypeError
      ) {
        setError(
          "Tidak dapat terhubung ke server. Periksa URL API atau koneksi backend."
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat melakukan pendaftaran."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#e4dfd3] bg-[#fffdf9] shadow-[0_20px_60px_rgba(38,70,45,0.08)] lg:grid-cols-[0.9fr_1.1fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section className="relative hidden overflow-hidden bg-[#e7f0e3] p-10 lg:flex lg:flex-col lg:justify-between">

            <div>

              <Link
                href="/"
                className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#55715a] transition hover:text-[#285b35]"
              >
                <ArrowLeft size={17} />
                Kembali
              </Link>

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7d3c] text-white shadow-sm">
                  <Recycle
                    size={25}
                    strokeWidth={2}
                  />
                </div>

                <div>

                  <h1 className="font-serif text-xl font-semibold text-[#183b22]">
                    Bank Sampah
                  </h1>

                  <p className="text-xs text-[#718071]">
                    Panel Admin
                  </p>

                </div>

              </div>

            </div>

            <div className="relative z-10">

              <div className="mb-5 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-[#4d704f]">
                Admin Bank Sampah
              </div>

              <h2 className="max-w-md font-serif text-4xl font-semibold leading-tight text-[#183b22]">
                Kelola bank sampah dengan lebih sederhana.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#667466]">
                Daftarkan unit bank sampah kamu dan mulai
                kelola nasabah, kategori sampah, hadiah,
                penyetoran, serta laporan dalam satu tempat.
              </p>

              <div className="mt-8 space-y-3">

                {[
                  "Kelola data nasabah",
                  "Catat penyetoran sampah",
                  "Kelola hadiah dan poin",
                  "Pantau laporan transaksi",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#49604c]"
                  >

                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2f7d3c]">
                      <Check
                        size={14}
                        strokeWidth={2.5}
                      />
                    </span>

                    {item}

                  </div>
                ))}

              </div>

            </div>

            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#d4e5d0]" />

            <div className="absolute -top-20 -right-10 h-48 w-48 rounded-full bg-[#dce9d8]" />

          </section>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <section className="px-6 py-8 sm:px-10 lg:px-12 lg:py-10">

            {/* MOBILE HEADER */}

            <div className="mb-7 flex items-center justify-between lg:hidden">

              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-[#617062]"
              >
                <ArrowLeft size={17} />
                Kembali
              </Link>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f0e2] text-[#2f7d3c]">
                  <Recycle size={19} />
                </div>

                <span className="font-serif font-semibold text-[#183b22]">
                  Bank Sampah
                </span>

              </div>

            </div>

            <div className="mx-auto max-w-lg">

              {/* HEADER */}

              <div className="mb-8">

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6c856e]">
                  Daftar Admin
                </p>

                <h2 className="font-serif text-3xl font-semibold text-[#183b22]">
                  Daftar Unit Bank Sampah
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#788078]">
                  Lengkapi data berikut untuk membuat akun
                  admin unit bank sampah.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-xl border border-[#efd4d0] bg-[#fff4f2] px-4 py-3 text-sm text-[#a34c42]">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="mb-5 rounded-xl border border-[#cfe4cf] bg-[#f0f8ee] px-4 py-3 text-sm text-[#3f7045]">
                  {success}
                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAMA UNIT */}

                <div>

                  <label
                    htmlFor="unitName"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    Nama Unit Bank Sampah
                  </label>

                  <div className="relative">

                    <Building2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="unitName"
                      name="unitName"
                      type="text"
                      value={form.unitName}
                      onChange={handleChange}
                      placeholder="Contoh: Bank Sampah Hijau"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-4 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                  </div>

                </div>

                {/* NAMA PENGELOLA */}

                <div>

                  <label
                    htmlFor="managerName"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    Nama Pengelola
                  </label>

                  <div className="relative">

                    <UserRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="managerName"
                      name="managerName"
                      type="text"
                      value={form.managerName}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-4 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                  </div>

                </div>

                {/* NOMOR TELEPON */}

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    No. Telepon
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-4 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                  </div>

                  <p className="mt-1.5 text-xs text-[#899289]">
                    Nomor telepon hanya boleh menggunakan angka.
                  </p>

                </div>

                {/* USERNAME */}

                <div>

                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Masukkan username"
                      autoComplete="username"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-4 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-12 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89948a] transition hover:text-[#2f7d3c] disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-[#304934]"
                  >
                    Konfirmasi Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b978c]"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.confirmPassword
                      }
                      onChange={handleChange}
                      placeholder="Masukkan ulang password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-[#dddcd3] bg-[#fffefb] pl-11 pr-12 text-sm text-[#263a2a] outline-none transition placeholder:text-[#a5aaa4] focus:border-[#79a477] focus:ring-4 focus:ring-[#dfeedd] disabled:cursor-not-allowed disabled:bg-[#f5f5f1]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89948a] transition hover:text-[#2f7d3c] disabled:cursor-not-allowed"
                      aria-label={
                        showConfirmPassword
                          ? "Sembunyikan konfirmasi password"
                          : "Tampilkan konfirmasi password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* AGREEMENT */}

                <label className="flex cursor-pointer items-start gap-3 pt-1">

                  <span className="relative mt-0.5">

                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      disabled={loading}
                      className="peer sr-only"
                    />

                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#d1d5ce] bg-white transition peer-checked:border-[#2f7d3c] peer-checked:bg-[#2f7d3c]">

                      {form.agree && (
                        <Check
                          size={13}
                          strokeWidth={3}
                          className="text-white"
                        />
                      )}

                    </span>

                  </span>

                  <span className="text-xs leading-5 text-[#747d75]">

                    Saya menyetujui{" "}

                    <button
                      type="button"
                      className="font-medium text-[#397044] hover:underline"
                    >
                      Syarat & Ketentuan
                    </button>{" "}

                    yang berlaku.

                  </span>

                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-[#2f7d3c] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(47,125,60,0.16)] transition hover:bg-[#286b33] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Mendaftarkan...

                    </span>
                  ) : (
                    "DAFTAR"
                  )}
                </button>

              </form>

              {/* LOGIN */}

              <p className="mt-7 text-center text-sm text-[#7a817b]">

                Sudah punya akun?{" "}

                <Link
                  href="/admin-login"
                  className="font-semibold text-[#2f7d3c] transition hover:text-[#235d2d] hover:underline"
                >
                  Login Admin
                </Link>

              </p>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}