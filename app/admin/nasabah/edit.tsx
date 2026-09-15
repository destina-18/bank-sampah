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
   PROPS
========================================================= */

interface EditNasabahProps {
  open: boolean;
  nasabah: Nasabah | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "";

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
   COMPONENT
========================================================= */

export default function EditNasabah({
  open,
  nasabah,
  onClose,
  onSuccess,
  onError,
}: EditNasabahProps) {
  const [namaNasabah, setNamaNasabah] =
    useState("");

  const [alamat, setAlamat] =
    useState("");

  const [telp, setTelp] =
    useState("");

  const [foto, setFoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     ISI FORM SAAT DATA DIPILIH
  ======================================================= */

  useEffect(() => {
    if (!open || !nasabah) {
      return;
    }

    setNamaNasabah(
      nasabah.namaNasabah || ""
    );

    setAlamat(
      nasabah.alamat || ""
    );

    setTelp(
      nasabah.telp || ""
    );

    setFoto(null);

    setPreview(
      nasabah.foto || null
    );
  }, [open, nasabah]);

  /* =======================================================
     MODAL TIDAK DITAMPILKAN
  ======================================================= */

  if (!open || !nasabah) {
    return null;
  }

  /*
    PENTING:
    Simpan data nasabah yang sudah dipastikan tidak null.
    Dengan cara ini TypeScript tidak akan menganggap
    nasabah bisa null di dalam handleSubmit().
  */
  const currentNasabah = nasabah;
  const nasabahId = currentNasabah.id;

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

    if (!allowedTypes.includes(file.type)) {
      onError(
        "Foto harus berformat JPG, PNG, atau WebP."
      );

      event.target.value = "";

      return;
    }

    /* =====================================================
       VALIDASI UKURAN
    ===================================================== */

    if (file.size > 2 * 1024 * 1024) {
      onError(
        "Ukuran foto maksimal 2 MB."
      );

      event.target.value = "";

      return;
    }

    /* =====================================================
       SET FOTO
    ===================================================== */

    setFoto(file);

    setPreview(
      URL.createObjectURL(file)
    );
  }

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /* =====================================================
       VALIDASI
    ===================================================== */

    if (!namaNasabah.trim()) {
      onError(
        "Nama nasabah wajib diisi."
      );

      return;
    }

    if (!alamat.trim()) {
      onError(
        "Alamat wajib diisi."
      );

      return;
    }

    if (!telp.trim()) {
      onError(
        "Nomor telepon wajib diisi."
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

      formData.append(
        "namaNasabah",
        namaNasabah.trim()
      );

      formData.append(
        "alamat",
        alamat.trim()
      );

      formData.append(
        "telp",
        telp.trim()
      );

      if (foto) {
        formData.append(
          "foto",
          foto
        );
      }

      /* ===================================================
         REQUEST UPDATE
      =================================================== */

      const response =
        await fetch(
          `${API_URL}/api/v1/admin/nasabah/${nasabahId}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: formData,
          }
        );

      /* ===================================================
         PARSE RESPONSE
      =================================================== */

      let result;

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "Response server bukan JSON yang valid."
        );
      }

      /* ===================================================
         UNAUTHORIZED
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
         ERROR
      =================================================== */

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            `Gagal memperbarui nasabah. Status: ${response.status}`
        );
      }

      /* ===================================================
         SUCCESS
      =================================================== */

      onSuccess(
        result.message ||
          "Data nasabah berhasil diperbarui."
      );

      onClose();
    } catch (error) {
      /* ===================================================
         HANDLE ERROR
      =================================================== */

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
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#2f8135]">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}

              </div>

              {/* UPLOAD */}

              <div>
                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#e5e0d5] bg-white px-3 text-[10px] font-medium text-[#66716a] transition hover:bg-[#f1f3ed]">
                  <Upload className="h-3.5 w-3.5" />

                  Ganti Foto

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFoto}
                    className="hidden"
                  />
                </label>

                <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
                  JPG, PNG, WebP · Maks. 2 MB
                </p>
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
              value={
                currentNasabah.user
                  ?.username || "-"
              }
              disabled
              className="h-10 w-full cursor-not-allowed rounded-xl border border-[#e5e0d5] bg-[#f1f3ed] px-3.5 text-[12px] text-[#a3aaa3]"
            />

            <p className="mt-1.5 text-[9px] text-[#a3aaa3]">
              Username tidak diubah pada proses
              edit.
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
          />

          {/* =================================================
              TELEPON
          ================================================= */}

          <Field
            label="Nomor Telepon"
            value={telp}
            onChange={setTelp}
            required
            placeholder="081234567890"
          />

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
              placeholder="Alamat lengkap nasabah..."
              className="w-full resize-none rounded-xl border border-[#e5e0d5] bg-white px-3.5 py-3 text-[12px] leading-5 text-[#173c2b] outline-none placeholder:text-[#a3aaa3] focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2]"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder: string;
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
        className="h-10 w-full rounded-xl border border-[#e5e0d5] bg-white px-3.5 text-[12px] text-[#173c2b] outline-none placeholder:text-[#a3aaa3] focus:border-[#9bbd96] focus:ring-2 focus:ring-[#e5f0e2]"
      />
    </div>
  );
}