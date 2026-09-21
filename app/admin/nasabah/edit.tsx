"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

import type { Nasabah } from "./page";

/* =========================================================
   TYPE TAMBAHAN
   ========================================================= */

type NasabahWithTanggalLahir = Nasabah & {
  tanggalLahir?: string | null;
};

/* =========================================================
   PROPS
   ========================================================= */

interface EditNasabahProps {
  open: boolean;
  nasabah: Nasabah | null;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
  onError: (message: string) => void;
}

/* =========================================================
   API URL
   ========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

/* =========================================================
   AUTH HEADERS
   ========================================================= */

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken");

  const appKey =
    localStorage.getItem("appKey");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (appKey) {
    headers["x-app-key"] = appKey;
  }

  return headers;
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
   * Kalau API sudah mengirim URL lengkap
   */
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }

  /*
   * Kalau API mengirim:
   * /uploads/nama-file.jpeg
   *
   * maka menjadi:
   * API_URL/uploads/nama-file.jpeg
   */
  return `${API_URL}${
    foto.startsWith("/")
      ? foto
      : `/${foto}`
  }`;
}

/* =========================================================
   FORMAT TANGGAL
   ========================================================= */

function formatTanggalUntukInput(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  /*
   * Kalau sudah format:
   * YYYY-MM-DD
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  /*
   * Kalau API mengirim ISO:
   * 2008-05-20T00:00:00.000Z
   */
  if (value.includes("T")) {
    return value.split("T")[0];
  }

  /*
   * Fallback
   */
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .split("T")[0];
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function EditNasabah({
  open,
  nasabah,
  onClose,
  onSuccess,
  onError,
}: EditNasabahProps) {
  /* =======================================================
     FORM STATE
     ======================================================= */

  const [namaNasabah, setNamaNasabah] =
    useState("");

  const [alamat, setAlamat] =
    useState("");

  const [telp, setTelp] =
    useState("");

  const [tanggalLahir, setTanggalLahir] =
    useState("");

  const [foto, setFoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     ISI FORM SAAT MODAL DIBUKA
     ======================================================= */

  useEffect(() => {
    if (!open || !nasabah) {
      return;
    }

    const data =
      nasabah as NasabahWithTanggalLahir;

    /*
     * Data nama dari response API:
     * namaNasabah
     */
    setNamaNasabah(
      data.namaNasabah || ""
    );

    /*
     * Data alamat
     */
    setAlamat(
      data.alamat || ""
    );

    /*
     * Data nomor telepon dari response API:
     * telp
     *
     * Bersihkan data lama agar hanya angka.
     */
    setTelp(
      (data.telp || "").replace(
        /\D/g,
        ""
      )
    );

    /*
     * Tanggal lahir hanya diisi
     * kalau memang tersedia dari GET API.
     */
    setTanggalLahir(
      formatTanggalUntukInput(
        data.tanggalLahir
      )
    );

    /*
     * Reset file baru
     */
    setFoto(null);

    /*
     * Tampilkan foto lama
     */
    setPreview(
      getFotoUrl(data.foto)
    );
  }, [open, nasabah]);

  /* =======================================================
     CLEANUP PREVIEW OBJECT URL
     ======================================================= */

  useEffect(() => {
    return () => {
      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          preview
        );
      }
    };
  }, [preview]);

  /* =======================================================
     MODAL TIDAK DITAMPILKAN
     ======================================================= */

  if (!open || !nasabah) {
    return null;
  }

  const currentNasabah = nasabah;

  const nasabahId =
    currentNasabah.id;

  /* =======================================================
     HANDLE FOTO
     ======================================================= */

  function handleFoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /* =====================================================
       VALIDASI FORMAT
       ===================================================== */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      onError(
        "Foto harus berformat JPG, PNG, atau WebP."
      );

      event.target.value = "";

      return;
    }

    /* =====================================================
       VALIDASI UKURAN
       ===================================================== */

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      onError(
        "Ukuran foto maksimal 2 MB."
      );

      event.target.value = "";

      return;
    }

    /* =====================================================
       SET FILE
       ===================================================== */

    setFoto(file);

    /*
     * Preview foto baru
     */
    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  }

  /* =======================================================
     HANDLE SUBMIT
     ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /* =====================================================
       VALIDASI NAMA
       ===================================================== */

    if (!namaNasabah.trim()) {
      onError(
        "Nama nasabah wajib diisi."
      );

      return;
    }

    /* =====================================================
       VALIDASI TELEPON
       ===================================================== */

    if (!telp.trim()) {
      onError(
        "Nomor telepon wajib diisi."
      );

      return;
    }

    /*
     * Pastikan hanya angka.
     */
    if (!/^\d+$/.test(telp)) {
      onError(
        "Nomor telepon hanya boleh berisi angka."
      );

      return;
    }

    /*
     * Minimal 10 digit.
     */
    if (telp.length < 10) {
      onError(
        "Nomor telepon minimal 10 digit."
      );

      return;
    }

    /*
     * Maksimal 15 digit.
     */
    if (telp.length > 15) {
      onError(
        "Nomor telepon maksimal 15 digit."
      );

      return;
    }

    /* =====================================================
       VALIDASI ALAMAT
       ===================================================== */

    if (!alamat.trim()) {
      onError(
        "Alamat wajib diisi."
      );

      return;
    }

    /* =====================================================
       VALIDASI TANGGAL LAHIR
       ===================================================== */

    if (!tanggalLahir.trim()) {
      onError(
        "Tanggal lahir wajib diisi sesuai endpoint API."
      );

      return;
    }

    /* =====================================================
       CEK API URL
       ===================================================== */

    if (!API_URL) {
      onError(
        "NEXT_PUBLIC_API_URL belum dikonfigurasi."
      );

      return;
    }

    try {
      setLoading(true);

      /* ===================================================
         FORM DATA
         =================================================== */

      const formData =
        new FormData();

      /*
       * UI:
       * namaNasabah
       *
       * API meminta:
       * namaLengkap
       */
      formData.append(
        "namaLengkap",
        namaNasabah.trim()
      );

      /*
       * UI:
       * telp
       *
       * API meminta:
       * noTelepon
       *
       * Tetap string di FormData,
       * tetapi isinya HANYA angka.
       */
      formData.append(
        "noTelepon",
        telp
      );

      /*
       * Alamat
       */
      formData.append(
        "alamat",
        alamat.trim()
      );

      /*
       * Tanggal lahir
       *
       * Format:
       * YYYY-MM-DD
       */
      formData.append(
        "tanggalLahir",
        tanggalLahir
      );

      /*
       * Foto hanya dikirim
       * kalau user memilih foto baru.
       */
      if (foto instanceof File) {
        formData.append(
          "foto",
          foto
        );
      }

      /* ===================================================
         DEBUG
         =================================================== */

      console.log(
        "================================="
      );

      console.log(
        "UPDATE NASABAH"
      );

      console.log(
        "================================="
      );

      console.log(
        "API URL:",
        API_URL
      );

      console.log(
        "Endpoint:",
        `${API_URL}/api/v1/admin/nasabah/${nasabahId}`
      );

      console.log(
        "Nasabah ID:",
        nasabahId
      );

      console.log(
        "Nama:",
        namaNasabah.trim()
      );

      console.log(
        "Telepon:",
        telp
      );

      console.log(
        "Telepon hanya angka:",
        /^\d+$/.test(telp)
      );

      console.log(
        "Jumlah digit:",
        telp.length
      );

      console.log(
        "Alamat:",
        alamat.trim()
      );

      console.log(
        "Tanggal Lahir:",
        tanggalLahir
      );

      console.log(
        "Foto:",
        foto
          ? foto.name
          : "Tidak mengganti foto"
      );

      /*
       * Cek isi FormData
       */
      for (
        const [
          key,
          value,
        ] of formData.entries()
      ) {
        console.log(
          `FormData ${key}:`,
          value
        );
      }

      /* ===================================================
         AUTH DEBUG
         =================================================== */

      const authHeaders =
        getAuthHeaders();

      console.log(
        "Authorization tersedia:",
        Boolean(
          authHeaders.Authorization
        )
      );

      console.log(
        "x-app-key tersedia:",
        Boolean(
          authHeaders["x-app-key"]
        )
      );

      /* ===================================================
         REQUEST PUT
         =================================================== */

      const response =
        await fetch(
          `${API_URL}/api/v1/admin/nasabah/${nasabahId}`,
          {
            method: "PUT",

            /*
             * Authorization + x-app-key
             */
            headers:
              authHeaders,

            /*
             * JANGAN tambahkan:
             *
             * Content-Type: multipart/form-data
             *
             * karena browser akan membuat
             * boundary otomatis.
             */
            body: formData,
          }
        );

      /* ===================================================
         PARSE RESPONSE
         =================================================== */

      let result: {
        statusCode?: number;
        success?: boolean;
        message?: string;

        data?: {
          id?: string;
          appMakerId?: string;
          userId?: string;

          /*
           * Response API menggunakan
           * namaNasabah
           */
          namaNasabah?: string;

          alamat?: string;

          /*
           * Response API menggunakan
           * telp
           */
          telp?: string;

          saldoPoin?: number;
          foto?: string;
          createdAt?: string;
          updatedAt?: string;

          /*
           * Ditambahkan sebagai optional
           * kalau suatu saat API mengirimnya.
           */
          tanggalLahir?: string;
        };

        errors?: unknown;
      };

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "Response server bukan JSON yang valid."
        );
      }

      /* ===================================================
         DEBUG RESPONSE
         =================================================== */

      console.log(
        "================================="
      );

      console.log(
        "RESPONSE UPDATE NASABAH"
      );

      console.log(
        "================================="
      );

      console.log(
        "HTTP Status:",
        response.status
      );

      console.log(
        "Response:",
        result
      );

      /* ===================================================
         AUTH ERROR
         =================================================== */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Sesi login sudah tidak valid. Silakan login kembali."
        );
      }

      /* ===================================================
         API ERROR
         =================================================== */

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ||
            `Gagal memperbarui nasabah. Status: ${response.status}`
        );
      }

      /* ===================================================
         DATA HASIL UPDATE
         =================================================== */

      console.log(
        "================================="
      );

      console.log(
        "DATA TERBARU DARI API"
      );

      console.log(
        "================================="
      );

      console.log(
        result.data
      );

      /* ===================================================
         SUCCESS
         =================================================== */

      await onSuccess(
        result.message ||
          "Data nasabah berhasil diperbarui."
      );

      /*
       * Tutup modal setelah berhasil.
       */
      onClose();

    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "ERROR UPDATE NASABAH"
      );

      console.error(
        "================================="
      );

      console.error(
        error
      );

      onError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui nasabah."
      );

    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

      {/* =================================================
          OVERLAY
          ================================================= */}

      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        disabled={loading}
        className="absolute inset-0 bg-[#173c2b]/30 backdrop-blur-[2px]"
      />

      {/* =================================================
          MODAL
          ================================================= */}

      <div className="relative z-10 max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7] shadow-xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e4da] bg-[#fbfaf7] px-5 py-4">

          <div>
            <h2 className="text-[15px] font-bold text-[#173c2b]">
              Edit Nasabah
            </h2>

            <p className="mt-0.5 text-[10px] text-[#89928a]">
              Perbarui informasi nasabah.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#89928a] transition hover:bg-[#f1f3ed] hover:text-[#66716a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>

        </div>

        {/* =================================================
            FORM
            ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          {/* =================================================
              FOTO
              ================================================= */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
              Foto Profil

              <span className="ml-1 font-normal text-[#a3aaa3]">
                (Opsional)
              </span>
            </label>

            <div className="flex items-center gap-4">

              {/* PREVIEW */}

              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-[#e5f0e2]">

                {preview ? (
                  <img
                    src={preview}
                    alt={
                      namaNasabah ||
                      "Foto nasabah"
                    }
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#2f8135]">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}

              </div>

              {/* UPLOAD */}

              <div>
                <label
                  className={`inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e0d5] bg-white px-3 text-[10px] font-medium text-[#66716a] transition ${
                    loading
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-[#f1f3ed]"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />

                  Ganti Foto

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFoto}
                    disabled={loading}
                    className="hidden"
                  />
                </label>

                <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
                  JPG, PNG, WebP · Maks. 2 MB
                </p>

                {foto && (
                  <p className="mt-1 text-[9px] font-medium text-[#5C8A54]">
                    Foto baru: {foto.name}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* =================================================
              USERNAME
              ================================================= */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
              Username
            </label>

            <input
              type="text"
              value={
                currentNasabah.user?.username ||
                "-"
              }
              disabled
              readOnly
              className="h-10 w-full cursor-not-allowed rounded-xl border border-[#e5e0d5] bg-[#f1f3ed] px-3.5 text-[12px] text-[#a3aaa3]"
            />

            <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
              Username tidak diubah pada proses edit.
            </p>
          </div>

          {/* =================================================
              NAMA NASABAH
              ================================================= */}

          <Field
            label="Nama Nasabah"
            value={namaNasabah}
            onChange={setNamaNasabah}
            required
            placeholder="Nama lengkap nasabah"
            disabled={loading}
          />

          {/* =================================================
              NOMOR TELEPON
              ================================================= */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
              Nomor Telepon

              <span className="ml-1 text-[#a45b5b]">
                *
              </span>
            </label>

            <input
              type="tel"
              inputMode="numeric"
              value={telp}
              onChange={(event) => {
                /*
                 * Hanya izinkan angka.
                 *
                 * Contoh:
                 * 08123abc456
                 * menjadi:
                 * 08123456
                 */
                const numericValue =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                /*
                 * Maksimal 15 digit.
                 */
                setTelp(
                  numericValue.slice(
                    0,
                    15
                  )
                );
              }}
              required
              disabled={loading}
              maxLength={15}
              placeholder="081234567890"
              className="h-10 w-full rounded-xl border border-[#e5e0d5] bg-white px-3.5 text-[12px] text-[#173c2b] outline-none placeholder:text-[#a3aaa3] focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2] disabled:cursor-not-allowed disabled:bg-[#f1f3ed]"
            />

            <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
              Nomor telepon hanya boleh menggunakan angka, 10–15 digit.
            </p>
          </div>

          {/* =================================================
              TANGGAL LAHIR
              ================================================= */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
              Tanggal Lahir

              <span className="ml-1 text-[#a45b5b]">
                *
              </span>
            </label>

            <input
              type="date"
              value={tanggalLahir}
              onChange={(event) =>
                setTanggalLahir(
                  event.target.value
                )
              }
              disabled={loading}
              className="h-10 w-full rounded-xl border border-[#e5e0d5] bg-white px-3.5 text-[12px] text-[#173c2b] outline-none focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2] disabled:cursor-not-allowed disabled:bg-[#f1f3ed]"
            />

            <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
              Format tanggal mengikuti data yang diminta API.
            </p>
          </div>

          {/* =================================================
              ALAMAT
              ================================================= */}

          <div>
            <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
              Alamat

              <span className="ml-1 text-[#a45b5b]">
                *
              </span>
            </label>

            <textarea
              value={alamat}
              onChange={(event) =>
                setAlamat(
                  event.target.value
                )
              }
              rows={4}
              disabled={loading}
              placeholder="Alamat lengkap nasabah..."
              className="w-full resize-none rounded-xl border border-[#e5e0d5] bg-white px-3.5 py-3 text-[12px] leading-5 text-[#173c2b] outline-none placeholder:text-[#a3aaa3] focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2] disabled:cursor-not-allowed disabled:bg-[#f1f3ed]"
            />
          </div>

          {/* =================================================
              BUTTON
              ================================================= */}

          <div className="flex flex-col-reverse gap-2 border-t border-[#eeeae1] pt-4 sm:flex-row sm:justify-end">

            {/* BATAL */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-[#e5e0d5] bg-[#fbfaf7] px-4 text-[11px] font-semibold text-[#66716a] transition hover:bg-[#f1f3ed] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            {/* SIMPAN */}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-5 text-[11px] font-semibold text-white transition hover:bg-[#276d2c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Menyimpan...
                </>
              ) : (
                <>
                  <Save
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  Simpan Perubahan
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT FIELD
   ========================================================= */

function Field({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold text-[#66716a]">
        {label}

        {required && (
          <span className="ml-1 text-[#a45b5b]">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-[#e5e0d5] bg-white px-3.5 text-[12px] text-[#173c2b] outline-none placeholder:text-[#a3aaa3] focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2] disabled:cursor-not-allowed disabled:bg-[#f1f3ed]"
      />
    </div>
  );
}