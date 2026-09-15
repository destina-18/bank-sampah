"use client";

import { useState } from "react";
import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import type { Nasabah } from "./page";

/* =========================================================
   PROPS
========================================================= */

interface DeleteNasabahProps {
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

export default function DeleteNasabah({
  open,
  nasabah,
  onClose,
  onSuccess,
  onError,
}: DeleteNasabahProps) {
  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     MODAL TIDAK DITAMPILKAN
  ======================================================= */

  if (!open || !nasabah) {
    return null;
  }

  /* =======================================================
     HANDLE DELETE
  ======================================================= */

  async function handleDelete() {
    /*
      Pastikan nasabah masih tersedia.
      Ini penting supaya TypeScript tidak menganggap
      nasabah bisa bernilai null.
    */
    if (!nasabah) {
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

    /*
      Simpan ID ke variable biasa.
      Setelah ini request menggunakan nasabahId.
    */
    const nasabahId = nasabah.id;

    try {
      setLoading(true);

      /* ===================================================
         REQUEST DELETE
      =================================================== */

      const response = await fetch(
        `${API_URL}/api/v1/admin/nasabah/${nasabahId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      /* ===================================================
         PARSE RESPONSE
      =================================================== */

      let result;

      try {
        result = await response.json();
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
         ERROR RESPONSE
      =================================================== */

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Gagal menghapus nasabah. Status: ${response.status}`
        );
      }

      /* ===================================================
         BERHASIL
      =================================================== */

      onSuccess(
        result.message ||
          "Nasabah berhasil dihapus."
      );

      onClose();
    } catch (error) {
      /* ===================================================
         HANDLE ERROR
      =================================================== */

      onError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus nasabah."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">

      {/* =================================================
          OVERLAY
      ================================================= */}

      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={onClose}
        disabled={loading}
        className="absolute inset-0 bg-[#173c2b]/30 backdrop-blur-[2px]"
      />

      {/* =================================================
          DIALOG
      ================================================= */}

      <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7] p-5 shadow-xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-start gap-3">

          {/* ICON */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f9eeee] text-[#a45b5b]">
            <Trash2
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0 flex-1">

            <div className="flex items-start justify-between gap-2">

              <div>
                <h2 className="text-[15px] font-bold text-[#173c2b]">
                  Hapus Nasabah?
                </h2>

                <p className="mt-1 text-[10px] leading-5 text-[#89928a]">
                  Apakah kamu yakin ingin menghapus
                  data nasabah ini?
                </p>
              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#89928a] transition hover:bg-[#f1f3ed] hover:text-[#66716a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              </button>

            </div>
          </div>
        </div>

        {/* =================================================
            DATA NASABAH
        ================================================= */}

        <div className="mt-5 rounded-xl border border-[#e8e4da] bg-white p-4">

          <div className="flex items-center gap-3">

            {/* FOTO */}

            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#e5f0e2]">

              {nasabah.foto ? (
                <img
                  src={nasabah.foto}
                  alt={nasabah.namaNasabah}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#2f8135]">
                  <span className="text-[15px] font-bold">
                    {nasabah.namaNasabah
                      ?.charAt(0)
                      .toUpperCase() || "N"}
                  </span>
                </div>
              )}

            </div>

            {/* INFO */}

            <div className="min-w-0">

              <p className="truncate text-[12px] font-semibold text-[#173c2b]">
                {nasabah.namaNasabah}
              </p>

              <p className="mt-1 truncate text-[10px] text-[#89928a]">
                @
                {nasabah.user?.username ||
                  "-"}
              </p>

              <p className="mt-1 text-[10px] text-[#66716a]">
                {nasabah.telp || "-"}
              </p>

            </div>
          </div>
        </div>

        {/* =================================================
            WARNING
        ================================================= */}

        <div className="mt-4 rounded-xl bg-[#f9eeee] p-3">

          <div className="flex gap-2">

            <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a45b5b]" />

            <p className="text-[10px] leading-5 text-[#a45b5b]">
              Data nasabah yang sudah dihapus
              tidak dapat dikembalikan.
            </p>

          </div>

        </div>

        {/* =================================================
            BUTTON
        ================================================= */}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

          {/* BATAL */}

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-xl border border-[#e5e0d5] bg-[#fbfaf7] px-4 text-[11px] font-semibold text-[#66716a] transition hover:bg-[#f1f3ed] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          {/* HAPUS */}

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#a45b5b] px-4 text-[11px] font-semibold text-white transition hover:bg-[#914e4e] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                />

                Menghapus...
              </>
            ) : (
              <>
                <Trash2
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Hapus Nasabah
              </>
            )}

          </button>

        </div>
      </div>
    </div>
  );
}