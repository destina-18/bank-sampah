"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NasabahRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    namaNasabah: "",
    alamat: "",
    telp: "",
    username: "",
    password: "",
    konfirmasiPassword: "",
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [setuju, setSetuju] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // API CONFIG
  // =========================

  const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || ""
  ).replace(/\/+$/, "");

  const APP_KEY =
    process.env.NEXT_PUBLIC_APP_KEY || "";

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================
  // HANDLE FOTO
  // =========================

  const handleFotoChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    if (!file) {
      setFoto(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Foto harus berformat JPG atau PNG."
      );

      e.target.value = "";
      setFoto(null);
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Ukuran foto maksimal 5 MB."
      );

      e.target.value = "";
      setFoto(null);
      return;
    }

    setError("");
    setFoto(file);
  };

  // =========================
  // HANDLE REGISTER
  // =========================

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDASI API
    // =========================

    if (!API_BASE_URL) {
      setError(
        "NEXT_PUBLIC_API_URL belum tersedia. Periksa file .env.local."
      );
      return;
    }

    if (!APP_KEY) {
      setError(
        "NEXT_PUBLIC_APP_KEY belum tersedia. Periksa file .env.local."
      );
      return;
    }

    // =========================
    // VALIDASI FORM
    // =========================

    if (!form.namaNasabah.trim()) {
      setError(
        "Nama nasabah wajib diisi."
      );
      return;
    }

    if (!form.alamat.trim()) {
      setError(
        "Alamat wajib diisi."
      );
      return;
    }

    if (!form.telp.trim()) {
      setError(
        "Nomor telepon wajib diisi."
      );
      return;
    }

    if (!/^[0-9]+$/.test(form.telp.trim())) {
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

    if (!form.konfirmasiPassword) {
      setError(
        "Konfirmasi password wajib diisi."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (
      form.password !==
      form.konfirmasiPassword
    ) {
      setError(
        "Password dan konfirmasi password tidak sama."
      );
      return;
    }

    if (!setuju) {
      setError(
        "Silakan setujui Syarat & Ketentuan terlebih dahulu."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // ENDPOINT
      // =========================

      const endpoint =
        `${API_BASE_URL}/api/v1/auth/nasabah/register`;

      // =========================
      // FORM DATA
      // =========================

      const formData = new FormData();

      formData.append(
        "username",
        form.username.trim()
      );

      formData.append(
        "password",
        form.password
      );

      formData.append(
        "namaNasabah",
        form.namaNasabah.trim()
      );

      formData.append(
        "alamat",
        form.alamat.trim()
      );

      formData.append(
        "telp",
        form.telp.trim()
      );

      if (foto) {
        formData.append(
          "foto",
          foto
        );
      }

      // =========================
      // REQUEST
      // =========================

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "x-app-key": APP_KEY,
          },

          body: formData,
        }
      );

      // =========================
      // RESPONSE
      // =========================

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data: any = null;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response yang tidak valid (${response.status}).`
        );
      }

      // =========================
      // ERROR RESPONSE
      // =========================

      if (!response.ok) {
        let message =
          data?.message ||
          data?.error ||
          data?.data?.message ||
          `Registrasi gagal (${response.status}).`;

        if (Array.isArray(message)) {
          message =
            message.join(", ");
        }

        if (
          typeof message ===
            "object" &&
          message !== null
        ) {
          message =
            JSON.stringify(
              message
            );
        }

        throw new Error(message);
      }

      // =========================
      // SUCCESS
      // =========================

      setSuccess(
        data?.message ||
          "Registrasi nasabah berhasil. Mengarahkan ke halaman login..."
      );

      setForm({
        namaNasabah: "",
        alamat: "",
        telp: "",
        username: "",
        password: "",
        konfirmasiPassword: "",
      });

      setFoto(null);
      setSetuju(false);

      const fotoInput =
        document.getElementById(
          "foto"
        ) as HTMLInputElement | null;

      if (fotoInput) {
        fotoInput.value = "";
      }

      setTimeout(() => {
        router.push(
          "/nasabah-login"
        );
      }, 1500);
    } catch (err: any) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat melakukan registrasi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7FAF3]">

      <div className="min-h-screen lg:grid lg:grid-cols-[40%_60%]">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden overflow-hidden bg-[#EAF4E5] px-8 py-8 lg:flex lg:flex-col">

          {/* DECORATION */}

          <div className="absolute -right-16 -top-16 h-[190px] w-[190px] rounded-full bg-[#D8E9D0]" />

          <div className="absolute -bottom-16 -right-8 h-[170px] w-[170px] rounded-full bg-[#D8E9D0]" />

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="relative z-10 flex w-fit items-center gap-2 text-sm text-[#53724C] transition hover:text-[#2A7C13]"
          >
            <span className="text-lg">
              ←
            </span>

            Kembali
          </button>

          {/* BRAND */}

          <div className="relative z-10 mt-9 flex items-center gap-3">

            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#2A7C13] text-[22px] text-white shadow-[0_5px_10px_rgba(42,124,19,0.15)]">
              ♻
            </div>

            <div>
              <h2 className="font-serif text-[22px] font-bold text-[#173F13]">
                Bank Sampah
              </h2>

              <p className="text-xs text-[#657360]">
                Panel Nasabah
              </p>
            </div>

          </div>

          {/* MAIN CONTENT */}

          <div className="relative z-10 mt-20 max-w-[430px]">

            <span className="inline-block rounded-full bg-white px-4 py-2 text-xs font-medium text-[#53724C]">
              Nasabah Bank Sampah
            </span>

            <h1 className="mt-5 font-serif text-[38px] font-bold leading-[1.12] text-[#173F13]">
              Kelola sampah
              <br />
              dengan lebih
              <br />
              sederhana.
            </h1>

            <p className="mt-5 max-w-[420px] text-sm leading-6 text-[#657360]">
              Buat akun nasabah dan mulai
              mencatat penyetoran sampah,
              mengumpulkan poin, serta
              menukarkan hadiah dalam satu
              tempat.
            </p>

            {/* FEATURES */}

            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm text-[#2A7C13]">
                  ✓
                </span>

                <span className="text-sm text-[#4F654A]">
                  Catat penyetoran sampah
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm text-[#2A7C13]">
                  ✓
                </span>

                <span className="text-sm text-[#4F654A]">
                  Kumpulkan poin
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm text-[#2A7C13]">
                  ✓
                </span>

                <span className="text-sm text-[#4F654A]">
                  Tukarkan poin dengan hadiah
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-6 py-10 sm:px-10 lg:px-12 xl:px-16">

          <div className="w-full max-w-[600px]">

            {/* MOBILE BACK */}

            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="mb-7 flex items-center gap-2 text-sm text-[#53724C] lg:hidden"
            >
              <span className="text-lg">
                ←
              </span>

              Kembali
            </button>

            {/* HEADER */}

            <div className="mb-7">

              <p className="font-serif text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8661]">
                Daftar Nasabah
              </p>

              <h1 className="mt-2 font-serif text-[32px] font-bold leading-tight text-[#173F13] sm:text-[36px]">
                Daftar Akun Nasabah
              </h1>

              <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#7B8278]">
                Lengkapi data berikut untuk
                membuat akun nasabah Bank
                Sampah.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >

              {/* NAMA NASABAH */}

              <div>
                <label
                  htmlFor="namaNasabah"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  Nama Nasabah
                </label>

                <input
                  id="namaNasabah"
                  name="namaNasabah"
                  type="text"
                  value={
                    form.namaNasabah
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  disabled={loading}
                  className="h-[47px] w-full rounded-[11px] border border-[#E0E6DB] bg-white px-4 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 disabled:bg-[#F5F6F3]"
                />
              </div>

              {/* ALAMAT */}

              <div>
                <label
                  htmlFor="alamat"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  Alamat
                </label>

                <textarea
                  id="alamat"
                  name="alamat"
                  value={
                    form.alamat
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Masukkan alamat tinggal"
                  rows={2}
                  disabled={loading}
                  className="min-h-[70px] w-full resize-none rounded-[11px] border border-[#E0E6DB] bg-white px-4 py-2.5 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 disabled:bg-[#F5F6F3]"
                />
              </div>

              {/* TELEPON */}

              <div>
                <label
                  htmlFor="telp"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  No. Telepon
                </label>

                <input
                  id="telp"
                  name="telp"
                  type="tel"
                  value={
                    form.telp
                  }
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setForm(
                      (prev) => ({
                        ...prev,
                        telp: value,
                      })
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Contoh: 081234567890"
                  autoComplete="tel"
                  inputMode="numeric"
                  disabled={loading}
                  className="h-[47px] w-full rounded-[11px] border border-[#E0E6DB] bg-white px-4 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 disabled:bg-[#F5F6F3]"
                />
              </div>

              {/* USERNAME */}

              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={
                    form.username
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Masukkan username"
                  autoComplete="username"
                  disabled={loading}
                  className="h-[47px] w-full rounded-[11px] border border-[#E0E6DB] bg-white px-4 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 disabled:bg-[#F5F6F3]"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
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
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    disabled={loading}
                    className="h-[47px] w-full rounded-[11px] border border-[#E0E6DB] bg-white px-4 pr-12 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 disabled:bg-[#F5F6F3]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#899586] hover:text-[#2A7C13]"
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

              {/* KONFIRMASI PASSWORD */}

              <div>
                <label
                  htmlFor="konfirmasiPassword"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  Konfirmasi Password
                </label>

                <div className="relative">

                  <input
                    id="konfirmasiPassword"
                    name="konfirmasiPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      form.konfirmasiPassword
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan ulang password"
                    autoComplete="new-password"
                    disabled={loading}
                    className={`h-[47px] w-full rounded-[11px] border bg-white px-4 pr-12 text-sm text-[#40513B] outline-none transition placeholder:text-[#A4AAA0] focus:ring-2 focus:ring-[#76C457]/10 ${
                      form.konfirmasiPassword &&
                      form.password !==
                        form.konfirmasiPassword
                        ? "border-[#D89A8A]"
                        : "border-[#E0E6DB] focus:border-[#76C457]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) =>
                          !prev
                      )
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#899586] hover:text-[#2A7C13]"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showConfirmPassword ? (
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

                {form.konfirmasiPassword &&
                  form.password !==
                    form.konfirmasiPassword && (
                    <p className="mt-1.5 text-xs text-[#B66A58]">
                      Password dan konfirmasi
                      password tidak sama.
                    </p>
                  )}
              </div>

              {/* FOTO */}

              <div>
                <label
                  htmlFor="foto"
                  className="mb-1.5 block text-sm font-medium text-[#345230]"
                >
                  Foto Profil{" "}
                  <span className="font-normal text-[#969E91]">
                    (opsional)
                  </span>
                </label>

                <input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={
                    handleFotoChange
                  }
                  disabled={loading}
                  className="w-full text-xs text-[#687265] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#EAF4E5] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#3F6637] hover:file:bg-[#DDEED6] disabled:opacity-60"
                />

                {foto && (
                  <p className="mt-1.5 truncate text-[11px] text-[#7B8476]">
                    File dipilih:{" "}
                    {foto.name}
                  </p>
                )}
              </div>

              {/* TERMS */}

              <label className="flex cursor-pointer items-start gap-2.5 pt-1">

                <input
                  type="checkbox"
                  checked={setuju}
                  onChange={(e) =>
                    setSetuju(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                  className="mt-[2px] h-4 w-4 shrink-0 accent-[#2A7C13]"
                />

                <span className="text-xs leading-5 text-[#727A70]">
                  Saya menyetujui{" "}
                  <button
                    type="button"
                    className="font-medium text-[#2A7C13] hover:underline"
                  >
                    Syarat & Ketentuan
                  </button>{" "}
                  yang berlaku.
                </span>

              </label>

              {/* ERROR */}

              {error && (
                <div className="rounded-[10px] border border-[#E8C9C0] bg-[#FFF8F5] px-3.5 py-2.5">
                  <p className="text-xs text-[#A55F4C]">
                    {error}
                  </p>
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="rounded-[10px] border border-[#B9D9AE] bg-[#F1F8ED] px-3.5 py-2.5">
                  <p className="text-xs text-[#2A7C13]">
                    {success}
                  </p>
                </div>
              )}

              {/* DAFTAR */}

              <button
                type="submit"
                disabled={loading}
                className="h-[49px] w-full rounded-[11px] bg-[#2A7C13] text-sm font-bold text-white shadow-[0_5px_10px_rgba(42,124,19,0.14)] transition hover:bg-[#236A10] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "MEMPROSES..."
                  : "DAFTAR"}
              </button>

              {/* LOGIN */}

              <div className="border-t border-[#EDF0EA] pt-4 text-center">

                <span className="text-xs text-[#7B8278]">
                  Sudah punya akun?{" "}
                </span>

                <Link
                  href="/nasabah-login"
                  className="text-xs font-bold text-[#2A7C13] hover:underline"
                >
                  Login
                </Link>

              </div>

            </form>

          </div>

        </section>

      </div>
    </main>
  );
}