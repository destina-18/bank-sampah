"use client";

import {
  CalendarDays,
  Coins,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import type { Nasabah } from "./page";

/* =========================================================
   PROPS
========================================================= */

interface DetailNasabahProps {
  open: boolean;
  nasabah: Nasabah | null;
  onClose: () => void;
  onError: (message: string) => void;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DetailNasabah({
  open,
  nasabah,
  onClose,
  onError,
}: DetailNasabahProps) {
  /* =======================================================
     MODAL TIDAK DITAMPILKAN
  ======================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================
     DATA TIDAK ADA
  ======================================================= */

  if (!nasabah) {
    return null;
  }

  /* =======================================================
     FORMAT POIN
  ======================================================= */

  const formattedPoin = new Intl.NumberFormat(
    "id-ID"
  ).format(nasabah.saldoPoin || 0);

  /* =======================================================
     FORMAT TANGGAL
  ======================================================= */

  const formattedDate = nasabah.createdAt
    ? new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(
        new Date(nasabah.createdAt)
      )
    : "-";

  /* =======================================================
     INITIAL
  ======================================================= */

  const initial =
    nasabah.namaNasabah
      ?.charAt(0)
      .toUpperCase() || "N";

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
        aria-label="Tutup detail"
        onClick={onClose}
        className="absolute inset-0 bg-[#173c2b]/30 backdrop-blur-[2px]"
      />

      {/* =================================================
          MODAL
      ================================================= */}

      <div className="relative z-10 max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7] shadow-xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e4da] bg-[#fbfaf7] px-5 py-4">

          <div>
            <h2 className="text-[15px] font-bold text-[#173c2b]">
              Detail Nasabah
            </h2>

            <p className="mt-0.5 text-[10px] text-[#89928a]">
              Informasi lengkap data nasabah.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#89928a] transition hover:bg-[#f1f3ed] hover:text-[#66716a]"
          >
            <X
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-5">

          {/* =================================================
              PROFILE
          ================================================= */}

          <div className="rounded-2xl border border-[#e5e0d5] bg-white p-5">

            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">

              {/* FOTO */}

              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#e5f0e2]">

                {nasabah.foto ? (
                  <img
                    src={nasabah.foto}
                    alt={
                      nasabah.namaNasabah
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#2f8135]">
                    <span className="text-2xl font-bold">
                      {initial}
                    </span>
                  </div>
                )}

              </div>

              {/* INFO */}

              <div className="mt-4 min-w-0 sm:ml-4 sm:mt-0">

                <h3 className="text-[17px] font-bold text-[#173c2b]">
                  {nasabah.namaNasabah}
                </h3>

                <p className="mt-1 text-[11px] text-[#89928a]">
                  @
                  {nasabah.user
                    ?.username || "-"}
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#e5f0e2] px-2.5 py-1.5 text-[10px] font-semibold text-[#2f8135]">
                  <Coins
                    className="h-3.5 w-3.5"
                    strokeWidth={1.8}
                  />

                  {formattedPoin} poin
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DATA
          ================================================= */}

          <div className="mt-4">

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a3aaa3]">
              Informasi Nasabah
            </p>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* TELEPON */}

              <InfoCard
                icon={
                  <Phone
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                }
                label="Nomor Telepon"
                value={
                  nasabah.telp || "-"
                }
              />

              {/* USERNAME */}

              <InfoCard
                icon={
                  <UserRound
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                }
                label="Username"
                value={
                  nasabah.user
                    ?.username || "-"
                }
              />

              {/* POIN */}

              <InfoCard
                icon={
                  <Coins
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                }
                label="Saldo Poin"
                value={`${formattedPoin} poin`}
              />

              {/* TANGGAL */}

              <InfoCard
                icon={
                  <CalendarDays
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                }
                label="Tanggal Terdaftar"
                value={formattedDate}
              />

            </div>

          </div>

          {/* =================================================
              ALAMAT
          ================================================= */}

          <div className="mt-4">

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a3aaa3]">
              Alamat
            </p>

            <div className="rounded-xl border border-[#e5e0d5] bg-white p-4">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5f0e2] text-[#2f8135]">
                  <MapPin
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[11px] font-semibold text-[#66716a]">
                    Alamat Lengkap
                  </p>

                  <p className="mt-1.5 text-[11px] leading-5 text-[#89928a]">
                    {nasabah.alamat ||
                      "Alamat belum tersedia."}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div className="mt-4">

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a3aaa3]">
              Akun
            </p>

            <div className="rounded-xl border border-[#e5e0d5] bg-white p-4">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f3ed] text-[#66716a]">
                    <UserRound
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold text-[#66716a]">
                      Role
                    </p>

                    <p className="mt-1 text-[10px] text-[#89928a]">
                      {nasabah.user?.role ||
                        "NASABAH"}
                    </p>

                  </div>

                </div>

                <span className="rounded-lg bg-[#e5f0e2] px-2.5 py-1.5 text-[9px] font-semibold uppercase text-[#2f8135]">
                  Aktif
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-[#e8e4da] bg-[#f8f7f3] px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-xl bg-[#2f8135] text-[11px] font-semibold text-white transition hover:bg-[#276d2c]"
          >
            Tutup
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e0d5] bg-white p-4">

      <div className="flex gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5f0e2] text-[#2f8135]">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-medium text-[#a3aaa3]">
            {label}
          </p>

          <p className="mt-1 truncate text-[11px] font-semibold text-[#66716a]">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}