"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  FileText,
  Package,
  Scale,
  UserRound,
  XCircle,
} from "lucide-react";

interface KategoriSampah {
  id?: string;
  namaKategori?: string;
  jenis?: string;
}

interface DetailSetor {
  id?: string;
  kategoriSampahId?: string;
  beratKg?: number;
  subtotalPoin?: number;
  kategoriSampah?: KategoriSampah;
}

interface SetorSampah {
  id: string;
  kodeSetor?: string;
  tanggal?: string;
  status?: string;
  totalBeratKg?: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;
  catatan?: string;
  catatanAdmin?: string;
  detailSetors?: DetailSetor[];
}

interface Props {
  data: SetorSampah;
  onBack: () => void;
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "menunggu_konfirmasi":
      return "Menunggu Konfirmasi";
    case "dikonfirmasi":
      return "Dikonfirmasi";
    case "diterima":
      return "Diterima";
    case "selesai":
      return "Selesai";
    case "ditolak":
      return "Ditolak";
    case "dibatalkan":
      return "Dibatalkan";
    default:
      return status
        ? status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "Tidak diketahui";
  }
}

function getStatusClass(status?: string) {
  switch (status) {
    case "menunggu_konfirmasi":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "dikonfirmasi":
    case "diterima":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "selesai":
      return "border-green-200 bg-green-50 text-green-700";

    case "ditolak":
    case "dibatalkan":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "selesai") {
    return <CheckCircle2 size={15} />;
  }

  if (
    status === "ditolak" ||
    status === "dibatalkan"
  ) {
    return <XCircle size={15} />;
  }

  return <Clock3 size={15} />;
}

function formatDate(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export default function DetailRiwayat({
  data,
  onBack,
}: Props) {
  const totalPoin =
    data.totalPoin ??
    data.estimasiTotalPoin ??
    0;

  return (
    <div>
      {/* BACK */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2f8135] transition hover:text-[#235f29]"
      >
        <ArrowLeft size={18} />
        Kembali ke Riwayat
      </button>

      {/* HEADER */}
      <div className="mb-6 rounded-[24px] border border-[#e5e0d5] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e7f2e6] text-[#2f8135]">
              <Package size={23} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#89918b]">
                Detail Setoran
              </p>

              <h1 className="mt-1 text-xl font-bold text-[#173c2b] sm:text-2xl">
                {data.kodeSetor ||
                  "Transaksi Setor Sampah"}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-sm text-[#737b75]">
                <CalendarDays size={15} />
                {formatDate(data.tanggal)}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
              data.status
            )}`}
          >
            <StatusIcon status={data.status} />
            {getStatusLabel(data.status)}
          </span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2e6] text-[#2f8135]">
              <Scale size={19} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Total Berat
              </p>

              <p className="mt-1 font-bold text-[#173c2b]">
                {formatNumber(data.totalBeratKg)} kg
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a47721]">
              <Coins size={19} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Total Poin
              </p>

              <p className="mt-1 font-bold text-[#173c2b]">
                {formatNumber(totalPoin)} poin
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eadf] text-[#8a6847]">
              <FileText size={19} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Jumlah Jenis
              </p>

              <p className="mt-1 font-bold text-[#173c2b]">
                {data.detailSetors?.length || 0} jenis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL SAMPAH */}
      <section className="mb-6 rounded-[24px] border border-[#e5e0d5] bg-white shadow-sm">
        <div className="border-b border-[#eeeae2] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f2e6] text-[#2f8135]">
              <Package size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173c2b]">
                Detail Sampah
              </h2>

              <p className="mt-0.5 text-xs text-[#89918b]">
                Rincian sampah yang disetorkan
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!data.detailSetors ||
          data.detailSetors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ddd8ce] bg-[#fcfbf8] p-6 text-center text-sm text-[#737b75]">
              Tidak ada rincian sampah.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e8e4dc]">
              <div className="hidden grid-cols-[1fr_140px_140px] bg-[#f8f6f1] px-4 py-3 text-xs font-semibold text-[#657068] sm:grid">
                <span>Jenis Sampah</span>
                <span className="text-right">
                  Berat
                </span>
                <span className="text-right">
                  Poin
                </span>
              </div>

              <div className="divide-y divide-[#eeeae2]">
                {data.detailSetors.map(
                  (detail, index) => (
                    <div
                      key={
                        detail.id ||
                        `${detail.kategoriSampahId}-${index}`
                      }
                      className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_140px_140px] sm:items-center"
                    >
                      <div>
                        <p className="font-medium text-[#173c2b]">
                          {detail.kategoriSampah
                            ?.namaKategori ||
                            "Kategori Sampah"}
                        </p>

                        {detail.kategoriSampah
                          ?.jenis && (
                          <p className="mt-1 text-xs text-[#89918b]">
                            {
                              detail
                                .kategoriSampah
                                .jenis
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between text-sm sm:block sm:text-right">
                        <span className="text-[#89918b] sm:hidden">
                          Berat
                        </span>

                        <span className="font-medium text-[#35463b]">
                          {formatNumber(
                            detail.beratKg
                          )}{" "}
                          kg
                        </span>
                      </div>

                      <div className="flex justify-between text-sm sm:block sm:text-right">
                        <span className="text-[#89918b] sm:hidden">
                          Poin
                        </span>

                        <span className="font-semibold text-[#8a6a28]">
                          {formatNumber(
                            detail.subtotalPoin
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INFORMASI TRANSAKSI */}
      <section className="mb-6 rounded-[24px] border border-[#e5e0d5] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 font-semibold text-[#173c2b]">
          Informasi Transaksi
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f2ed] text-[#68736b]">
              <FileText size={17} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Kode Setor
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173c2b]">
                {data.kodeSetor || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f2ed] text-[#68736b]">
              <CalendarDays size={17} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Tanggal Pengajuan
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173c2b]">
                {formatDate(data.tanggal)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f2ed] text-[#68736b]">
              <Scale size={17} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Berat Keseluruhan
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173c2b]">
                {formatNumber(data.totalBeratKg)} kg
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4f2ed] text-[#68736b]">
              <UserRound size={17} />
            </div>

            <div>
              <p className="text-xs text-[#89918b]">
                Status
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173c2b]">
                {getStatusLabel(data.status)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATATAN */}
      {(data.catatan || data.catatanAdmin) && (
        <section className="mb-6 rounded-[24px] border border-[#e5e0d5] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-semibold text-[#173c2b]">
            Catatan
          </h2>

          <div className="space-y-4">
            {data.catatan && (
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <p className="mb-1 text-xs font-semibold text-[#69746d]">
                  Catatan Nasabah
                </p>

                <p className="text-sm leading-6 text-[#46544c]">
                  {data.catatan}
                </p>
              </div>
            )}

            {data.catatanAdmin && (
              <div className="rounded-2xl bg-[#e7f2e6] p-4">
                <p className="mb-1 text-xs font-semibold text-[#2f8135]">
                  Catatan Admin
                </p>

                <p className="text-sm leading-6 text-[#46544c]">
                  {data.catatanAdmin}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* BACK BUTTON */}
      <div className="pb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[#dcd7cd] bg-white px-5 py-3 text-sm font-semibold text-[#536058] shadow-sm transition hover:bg-[#f7f5f0]"
        >
          <ArrowLeft size={17} />
          Kembali ke Riwayat
        </button>
      </div>
    </div>
  );
}