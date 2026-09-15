"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Recycle,
  XCircle,
} from "lucide-react";

type SetorDetail = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: string;
  totalBeratKg: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;
  catatan?: string;
  catatanAdmin?: string;

  detailSetors?: {
    kategoriSampahId: string;
    beratKg: number;
    subtotalPoin: number;

    kategoriSampah?: {
      namaKategori?: string;
      jenis?: string;
    };
  }[];
};

type Props = {
  data: SetorDetail;
  onBack: () => void;
};

export default function DetailSetorSampah({
  data,
  onBack,
}: Props) {
  // ==========================================
  // FORMAT TANGGAL
  // ==========================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return "Menunggu Konfirmasi";

      case "diverifikasi":
        return "Diverifikasi";

      case "selesai":
        return "Selesai";

      case "ditolak":
        return "Ditolak";

      default:
        return status;
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return {
          wrapper:
            "bg-[#fff5dc]",
          text:
            "text-[#b17d24]",
          icon:
            "text-[#c49135]",
        };

      case "diverifikasi":
        return {
          wrapper:
            "bg-[#eef4fa]",
          text:
            "text-[#567895]",
          icon:
            "text-[#567895]",
        };

      case "selesai":
        return {
          wrapper:
            "bg-[#e5f0e2]",
          text:
            "text-[#2f8135]",
          icon:
            "text-[#2f8135]",
        };

      case "ditolak":
        return {
          wrapper:
            "bg-[#fff0f0]",
          text:
            "text-[#b76565]",
          icon:
            "text-[#b76565]",
        };

      default:
        return {
          wrapper:
            "bg-[#f1f3ed]",
          text:
            "text-[#66716a]",
          icon:
            "text-[#66716a]",
        };
    }
  };

  // ==========================================
  // STATUS ICON
  // ==========================================

  const getStatusIcon = (
    status: string
  ) => {
    switch (status) {
      case "menunggu_konfirmasi":
        return Clock3;

      case "ditolak":
        return XCircle;

      default:
        return CheckCircle2;
    }
  };

  const statusStyle =
    getStatusStyle(
      data.status
    );

  const StatusIcon =
    getStatusIcon(
      data.status
    );

  const totalPoin =
    data.totalPoin ??
    data.estimasiTotalPoin ??
    0;

  return (
    <div className="w-full">

      {/* ======================================
          BACK
      ====================================== */}

      <button
        type="button"
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-[12px] font-medium text-[#66716a] transition hover:text-[#2f8135]"
      >
        <ArrowLeft className="h-4 w-4" />

        Kembali ke Setor Sampah
      </button>

      {/* ======================================
          TITLE
      ====================================== */}

      <div className="mb-6">

        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#929b95]">
          Detail Penyetoran
        </p>

        <h1 className="mt-1 text-[23px] font-bold tracking-tight text-[#173c2b]">
          {data.kodeSetor}
        </h1>

      </div>

      {/* ======================================
          STATUS CARD
      ====================================== */}

      <section className="mb-5 overflow-hidden rounded-[22px] bg-[#2f8135] p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-[10px] text-white/65">
              Status Penyetoran
            </p>

            <div className="mt-2 flex items-center gap-2">

              <StatusIcon
                className="h-5 w-5 text-white"
                strokeWidth={1.8}
              />

              <h2 className="text-[18px] font-semibold text-white">
                {getStatusLabel(
                  data.status
                )}
              </h2>

            </div>

            <p className="mt-2 text-[10px] text-white/65">
              Pengajuan kamu telah diterima sistem.
            </p>

          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/10">

            <Recycle
              className="h-6 w-6 text-white"
              strokeWidth={1.7}
            />

          </div>

        </div>

      </section>

      {/* ======================================
          INFO TRANSAKSI
      ====================================== */}

      <section className="mb-5 rounded-[20px] border border-[#e5e0d5] bg-white p-5">

        <div className="mb-5">

          <h2 className="text-[13px] font-semibold text-[#31443a]">
            Informasi Penyetoran
          </h2>

          <p className="mt-0.5 text-[10px] text-[#929b95]">
            Informasi pengajuan penyetoran kamu.
          </p>

        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          {/* KODE */}

          <div>

            <p className="text-[10px] text-[#a3aaa3]">
              Kode Transaksi
            </p>

            <p className="mt-1 text-[12px] font-semibold text-[#31443a]">
              {data.kodeSetor}
            </p>

          </div>

          {/* TANGGAL */}

          <div>

            <p className="text-[10px] text-[#a3aaa3]">
              Tanggal Penyetoran
            </p>

            <div className="mt-1 flex items-center gap-1.5">

              <CalendarDays className="h-3.5 w-3.5 text-[#2f8135]" />

              <p className="text-[12px] text-[#31443a]">
                {formatDate(
                  data.tanggal
                )}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          DETAIL SAMPAH
      ====================================== */}

      <section className="mb-5 overflow-hidden rounded-[20px] border border-[#e5e0d5] bg-white">

        <div className="border-b border-[#eeeae1] p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f0e2]">

              <Recycle
                className="h-4 w-4 text-[#2f8135]"
                strokeWidth={1.8}
              />

            </div>

            <div>

              <h2 className="text-[13px] font-semibold text-[#31443a]">
                Detail Sampah
              </h2>

              <p className="mt-0.5 text-[10px] text-[#929b95]">
                Rincian sampah yang kamu ajukan.
              </p>

            </div>

          </div>

        </div>

        <div className="divide-y divide-[#eeeae1]">

          {data.detailSetors &&
          data.detailSetors.length > 0 ? (
            data.detailSetors.map(
              (item, index) => (
                <div
                  key={`${item.kategoriSampahId}-${index}`}
                  className="flex items-center gap-3 p-5"
                >

                  {/* ICON */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5f0e2]">

                    <Recycle
                      className="h-5 w-5 text-[#2f8135]"
                      strokeWidth={1.7}
                    />

                  </div>

                  {/* NAMA */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[12px] font-semibold text-[#31443a]">
                      {item
                        .kategoriSampah
                        ?.namaKategori ||
                        "-"}
                    </p>

                    <p className="mt-1 text-[10px] capitalize text-[#929b95]">
                      {item
                        .kategoriSampah
                        ?.jenis ||
                        "Sampah"}
                    </p>

                  </div>

                  {/* BERAT + POIN */}

                  <div className="text-right">

                    <p className="text-[12px] font-semibold text-[#31443a]">
                      {item.beratKg} kg
                    </p>

                    <p className="mt-1 text-[10px] font-medium text-[#2f8135]">
                      +{item.subtotalPoin} Poin
                    </p>

                  </div>

                </div>
              )
            )
          ) : (
            <div className="p-5">

              <p className="text-[11px] text-[#929b95]">
                Tidak ada detail sampah.
              </p>

            </div>
          )}

        </div>

      </section>

      {/* ======================================
          TOTAL
      ====================================== */}

      <section className="mb-5 rounded-[20px] border border-[#dce8d9] bg-[#e5f0e2] p-5">

        <div className="grid grid-cols-2 gap-5">

          <div>

            <p className="text-[10px] text-[#66805e]">
              Total Berat
            </p>

            <p className="mt-1 text-[20px] font-bold text-[#173c2b]">
              {data.totalBeratKg} kg
            </p>

          </div>

          <div className="text-right">

            <p className="text-[10px] text-[#66805e]">
              Estimasi Total Poin
            </p>

            <p className="mt-1 text-[20px] font-bold text-[#2f8135]">
              {totalPoin} Poin
            </p>

          </div>

        </div>

      </section>

      {/* ======================================
          CATATAN
      ====================================== */}

      <section className="mb-5 rounded-[20px] border border-[#e5e0d5] bg-white p-5">

        <h2 className="text-[13px] font-semibold text-[#31443a]">
          Catatan
        </h2>

        <div className="mt-3 rounded-xl bg-[#faf9f6] p-4">

          <p className="text-[11px] leading-relaxed text-[#66716a]">
            {data.catatan ||
              "Tidak ada catatan."}
          </p>

        </div>

        {data.catatanAdmin && (
          <div className="mt-4">

            <p className="mb-2 text-[11px] font-semibold text-[#31443a]">
              Catatan Admin
            </p>

            <div className="rounded-xl bg-[#f5f9f3] p-4">

              <p className="text-[11px] leading-relaxed text-[#66716a]">
                {data.catatanAdmin}
              </p>

            </div>

          </div>
        )}

      </section>

      {/* ======================================
          STATUS INFO
      ====================================== */}

      <div
        className={`mb-5 flex items-start gap-3 rounded-[16px] p-4 ${statusStyle.wrapper}`}
      >

        <StatusIcon
          className={`mt-0.5 h-4 w-4 shrink-0 ${statusStyle.icon}`}
        />

        <div>

          <p
            className={`text-[11px] font-semibold ${statusStyle.text}`}
          >
            {getStatusLabel(
              data.status
            )}
          </p>

          <p className="mt-1 text-[10px] leading-relaxed text-[#829087]">

            {data.status ===
            "menunggu_konfirmasi"
              ? "Pengajuan kamu sedang menunggu konfirmasi dari admin."
              : data.status ===
                "diverifikasi"
              ? "Pengajuan kamu sudah diverifikasi oleh admin."
              : data.status ===
                "selesai"
              ? "Penyetoran kamu telah selesai dan poin sudah diproses."
              : data.status ===
                "ditolak"
              ? "Pengajuan penyetoran kamu ditolak oleh admin."
              : "Status penyetoran sedang diproses."}

          </p>

        </div>

      </div>

      {/* ======================================
          BACK BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={onBack}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e5e0d5] bg-white text-[12px] font-semibold text-[#66716a] transition hover:bg-[#f1f3ed] hover:text-[#2f8135]"
      >

        <ArrowLeft className="h-4 w-4" />

        Buat Penyetoran Baru

      </button>

    </div>
  );
}