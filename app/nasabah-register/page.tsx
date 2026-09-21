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

  // =====================================================
  // ENV
  // =====================================================

  const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || ""
  ).replace(/\/+$/, "");

  const APP_KEY =
    process.env.NEXT_PUBLIC_APP_KEY || "";

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // =====================================================
  // HANDLE FOTO
  // =====================================================

  const handleFotoChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setFoto(null);
      return;
    }

    // Validasi tipe file
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

    // Validasi ukuran maksimal 5 MB
    const maxSize = 5 * 1024 * 1024;

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

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegister = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ===================================================
    // CEK ENV
    // ===================================================

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

    // ===================================================
    // VALIDASI
    // ===================================================

    if (!form.namaNasabah.trim()) {
      setError("Nama nasabah wajib diisi.");
      return;
    }

    if (!form.alamat.trim()) {
      setError("Alamat wajib diisi.");
      return;
    }

    if (!form.telp.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    if (!form.username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (!form.password) {
      setError("Password wajib diisi.");
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

    // ===================================================
    // REQUEST
    // ===================================================

    try {
      setLoading(true);

      const endpoint =
        `${API_BASE_URL}/api/v1/auth/nasabah/register`;

      console.log(
        "================================="
      );
      console.log(
        "REGISTER NASABAH"
      );
      console.log(
        "Endpoint:",
        endpoint
      );
      console.log(
        "Has App Key:",
        Boolean(APP_KEY)
      );
      console.log(
        "Has Foto:",
        Boolean(foto)
      );
      console.log(
        "================================="
      );

      // =================================================
      // FORM DATA
      // =================================================

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

      // Foto OPTIONAL sesuai Swagger
      if (foto) {
        formData.append(
          "foto",
          foto
        );
      }

      // =================================================
      // FETCH
      // =================================================

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "x-app-key": APP_KEY,
          },

          // JANGAN tambahkan Content-Type di sini.
          // Browser akan otomatis membuat:
          // multipart/form-data; boundary=...
          body: formData,
        }
      );

      // =================================================
      // RESPONSE
      // =================================================

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
        data = await response.json();
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

      console.log(
        "REGISTER RESPONSE:",
        {
          status:
            response.status,
          data,
        }
      );

      // =================================================
      // ERROR API
      // =================================================

      if (!response.ok) {
        let message =
          data?.message ||
          data?.error ||
          data?.data?.message ||
          `Registrasi gagal (${response.status}).`;

        if (
          Array.isArray(message)
        ) {
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

        throw new Error(
          message
        );
      }

      // =================================================
      // BERHASIL
      // =================================================

      setSuccess(
        data?.message ||
          "Registrasi nasabah berhasil. Mengarahkan ke halaman login..."
      );

      // Reset form
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

      // Reset input foto
      const fotoInput =
        document.getElementById(
          "foto"
        ) as HTMLInputElement | null;

      if (fotoInput) {
        fotoInput.value = "";
      }

      // Redirect
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#F3EADF] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-[430px]">

        {/* CARD */}
        <div className="bg-white rounded-[28px] border border-[#E8DED3] shadow-[0_12px_35px_rgba(92,72,55,0.08)] px-6 py-7 sm:px-8 sm:py-8">

          {/* HEADER */}
          <div className="text-center mb-7">

            {/* BACK BUTTON */}
            <div className="flex justify-start mb-3">
              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#77736D] hover:bg-[#F7F1EA] transition"
                aria-label="Kembali"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* AVATAR */}
            <div className="mx-auto mb-4 w-[76px] h-[76px] rounded-full bg-[#E9E4DE] flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  fill="#A7A29B"
                />

                <path
                  d="M5.5 19.5C6.1 15.8 8.3 14 12 14C15.7 14 17.9 15.8 18.5 19.5"
                  fill="#A7A29B"
                />
              </svg>
            </div>

            <h1 className="text-[22px] font-semibold text-[#4B4741]">
              Daftar Akun
            </h1>

            <p className="mt-1 text-sm text-[#9A948C]">
              Buat akun untuk mulai menggunakan Bank Sampah
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleRegister}
            className="space-y-3.5"
          >

            {/* NAMA NASABAH */}
            <div>
              <label
                htmlFor="namaNasabah"
                className="sr-only"
              >
                User Name
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
                placeholder="Nama Lengkap"
                autoComplete="name"
                disabled={loading}
                className="w-full h-[45px] rounded-[9px] border border-[#DED8D0] bg-white px-4 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none transition focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F7F5F2] disabled:cursor-not-allowed"
              />
            </div>

            {/* ALAMAT */}
            <div>
              <label
                htmlFor="alamat"
                className="sr-only"
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
                placeholder="Alamat Tinggal"
                rows={3}
                disabled={loading}
                className="w-full min-h-[75px] rounded-[9px] border border-[#DED8D0] bg-white px-4 py-3 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none resize-none transition focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F7F5F2] disabled:cursor-not-allowed"
              />
            </div>

            {/* TELEPON */}
            <div>
              <label
                htmlFor="telp"
                className="sr-only"
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
                onChange={
                  handleChange
                }
                placeholder="No. Telepon"
                autoComplete="tel"
                inputMode="tel"
                disabled={loading}
                className="w-full h-[45px] rounded-[9px] border border-[#DED8D0] bg-white px-4 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none transition focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F7F5F2] disabled:cursor-not-allowed"
              />
            </div>

            {/* USERNAME */}
            <div>
              <label
                htmlFor="username"
                className="sr-only"
              >
                Nama
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
                placeholder="Username"
                autoComplete="username"
                disabled={loading}
                className="w-full h-[45px] rounded-[9px] border border-[#DED8D0] bg-white px-4 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none transition focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F7F5F2] disabled:cursor-not-allowed"
              />
            </div>

            {/* PASSWORD */}
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
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
                placeholder="Password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full h-[45px] rounded-[9px] border border-[#DED8D0] bg-white px-4 pr-11 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none transition focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10 disabled:bg-[#F7F5F2] disabled:cursor-not-allowed"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99928A] hover:text-[#6E675F] transition"
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

            {/* KONFIRMASI PASSWORD */}
            <div className="relative">
              <label
                htmlFor="konfirmasiPassword"
                className="sr-only"
              >
                Konfirmasi Password
              </label>

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
                placeholder="Konfirmasi Password"
                autoComplete="new-password"
                disabled={loading}
                className={`w-full h-[45px] rounded-[9px] border bg-white px-4 pr-11 text-sm text-[#514D47] placeholder:text-[#AAA49C] outline-none transition ${
                  form.konfirmasiPassword &&
                  form.password !==
                    form.konfirmasiPassword
                    ? "border-[#D69A9A]"
                    : "border-[#DED8D0] focus:border-[#B99C84] focus:ring-2 focus:ring-[#B99C84]/10"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99928A] hover:text-[#6E675F] transition"
              >
                {showConfirmPassword ? (
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

            {/* PASSWORD MATCH */}
            {form.konfirmasiPassword &&
              form.password !==
                form.konfirmasiPassword && (
                <p className="text-xs text-[#C47777] px-1">
                  Password dan konfirmasi
                  password tidak sama.
                </p>
              )}

            {/* FOTO */}
            <div>
              <label
                htmlFor="foto"
                className="block text-xs text-[#858078] mb-1.5"
              >
                Foto Profil
                <span className="text-[#AAA49C]">
                  {" "}
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
                className="w-full text-xs text-[#77736D] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#EEE8E1] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#6F675F] hover:file:bg-[#E5DED6] disabled:opacity-60"
              />

              {foto && (
                <p className="mt-1.5 text-[11px] text-[#8A837B] truncate">
                  File dipilih:{" "}
                  {foto.name}
                </p>
              )}
            </div>

            {/* TERMS */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={setuju}
                onChange={(e) =>
                  setSetuju(
                    e.target.checked
                  )
                }
                disabled={loading}
                className="mt-[2px] h-4 w-4 shrink-0 accent-[#8A9B82] cursor-pointer"
              />

              <span className="text-[12px] leading-5 text-[#858078]">
                Saya setuju dengan{" "}
                <button
                  type="button"
                  className="text-[#7D9274] font-medium hover:underline"
                >
                  Syarat & Ketentuan
                </button>
              </span>
            </label>

            {/* ERROR */}
            {error && (
              <div className="rounded-[9px] border border-[#E9CACA] bg-[#FFF7F7] px-3.5 py-2.5">
                <p className="text-xs text-[#B76565]">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-[9px] border border-[#D3E0CE] bg-[#F5F9F3] px-3.5 py-2.5">
                <p className="text-xs text-[#66805E]">
                  {success}
                </p>
              </div>
            )}

            {/* DAFTAR */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[45px] rounded-[9px] bg-[#777A76] hover:bg-[#686B67] active:scale-[0.99] text-white text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "MEMPROSES..."
                : "DAFTAR"}
            </button>

            {/* LOGIN */}
            <div className="text-center pt-1">
              <span className="text-xs text-[#969089]">
                Sudah punya akun?{" "}
              </span>

              <Link
                href="/nasabah-login"
                className="text-xs font-medium text-[#718867] hover:underline"
              >
                Login
              </Link>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[11px] text-[#AAA39B] mt-5">
          Bank Sampah
        </p>
      </div>
    </main>
  );
}