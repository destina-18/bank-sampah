"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Download,
  FileText,
  Loader2,
  MapPin,
  Package,
  Phone,
  Scale,
  UserRound,
  XCircle,
} from "lucide-react";

import { useState } from "react";

/* =========================================================
   TYPES
========================================================= */

interface KategoriSampah {
  id?: string;
  appMakerId?: string;
  namaKategori?: string;
  hargaPerKg?: number;
  poinPerKg?: number;
  jenis?: string;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface DetailSetor {
  id?: string;
  setorId?: string;
  kategoriSampahId?: string;
  beratKg?: number;
  subtotalPoin?: number;
  kategoriSampah?: KategoriSampah;
}

interface Nasabah {
  id?: string;
  appMakerId?: string;
  userId?: string;
  namaNasabah?: string;
  alamat?: string;
  telp?: string;
  saldoPoin?: number;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface SetorSampah {
  id: string;
  appMakerId?: string;
  kodeSetor?: string;
  tanggal?: string;
  nasabahId?: string;
  status?: string;
  totalBeratKg?: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;
  catatan?: string;
  catatanAdmin?: string;
  createdAt?: string;
  updatedAt?: string;
  nasabah?: Nasabah;
  detailSetors?: DetailSetor[];
}

interface Props {
  data: SetorSampah;
  onBack: () => void;
}

/* =========================================================
   STATUS
========================================================= */

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
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )
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

function StatusIcon({
  status,
}: {
  status?: string;
}) {
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

/* =========================================================
   FORMAT
========================================================= */

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
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}

function formatRupiah(value?: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

/* =========================================================
   COMPONENT
========================================================= */

export default function DetailRiwayat({
  data,
  onBack,
}: Props) {
  const [downloading, setDownloading] =
    useState(false);

  const totalPoin =
    data.totalPoin ??
    data.estimasiTotalPoin ??
    0;

  const nasabah = data.nasabah;

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  async function handleDownloadPdf() {
    /*
     * Nota PDF hanya boleh diunduh
     * apabila status sudah selesai.
     */
    if (data.status !== "selesai") {
      alert(
        "Nota PDF hanya dapat diunduh setelah penyetoran selesai."
      );
      return;
    }

    try {
      setDownloading(true);

      /*
       * Import jsPDF hanya ketika tombol
       * ditekan supaya tidak membebani
       * halaman saat pertama dibuka.
       */

      const { default: jsPDF } =
        await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      let y = 20;

      /* ===================================================
         HEADER
      =================================================== */

      pdf.setFillColor(
        47,
        129,
        53
      );

      pdf.roundedRect(
        15,
        12,
        pageWidth - 30,
        25,
        4,
        4,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(17);

      pdf.text(
        "BANK SAMPAH",
        22,
        23
      );

      pdf.setFontSize(9);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "Nota Bukti Penyetoran Sampah",
        22,
        30
      );

      y = 48;

      /* ===================================================
         JUDUL
      =================================================== */

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(15);

      pdf.text(
        "DETAIL TRANSAKSI",
        15,
        y
      );

      y += 9;

      /* ===================================================
         KODE & STATUS
      =================================================== */

      pdf.setFontSize(9);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setTextColor(
        90,
        90,
        90
      );

      pdf.text(
        "Kode Setor",
        15,
        y
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.text(
        data.kodeSetor || "-",
        50,
        y
      );

      y += 7;

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setTextColor(
        90,
        90,
        90
      );

      pdf.text(
        "Tanggal",
        15,
        y
      );

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.text(
        formatDate(data.tanggal),
        50,
        y
      );

      y += 7;

      pdf.setTextColor(
        90,
        90,
        90
      );

      pdf.text(
        "Status",
        15,
        y
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setTextColor(
        47,
        129,
        53
      );

      pdf.text(
        getStatusLabel(data.status),
        50,
        y
      );

      y += 13;

      /* ===================================================
         GARIS
      =================================================== */

      pdf.setDrawColor(
        220,
        220,
        220
      );

      pdf.line(
        15,
        y,
        pageWidth - 15,
        y
      );

      y += 10;

      /* ===================================================
         NASABAH
      =================================================== */

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.text(
        "Informasi Nasabah",
        15,
        y
      );

      y += 8;

      pdf.setFontSize(9);

      const writeInfo = (
        label: string,
        value: string
      ) => {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setTextColor(
          100,
          100,
          100
        );

        pdf.text(
          label,
          15,
          y
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setTextColor(
          40,
          40,
          40
        );

        pdf.text(
          value,
          55,
          y
        );

        y += 7;
      };

      writeInfo(
        "Nama",
        nasabah?.namaNasabah || "-"
      );

      writeInfo(
        "Telepon",
        nasabah?.telp || "-"
      );

      writeInfo(
        "Alamat",
        nasabah?.alamat || "-"
      );

      writeInfo(
        "Saldo Poin",
        `${formatNumber(
          nasabah?.saldoPoin
        )} poin`
      );

      y += 4;

      /* ===================================================
         DETAIL SAMPAH
      =================================================== */

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.text(
        "Detail Sampah",
        15,
        y
      );

      y += 8;

      /* TABLE HEADER */

      pdf.setFillColor(
        245,
        243,
        238
      );

      pdf.roundedRect(
        15,
        y - 5,
        pageWidth - 30,
        9,
        2,
        2,
        "F"
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        80,
        90,
        84
      );

      pdf.text(
        "Jenis Sampah",
        18,
        y
      );

      pdf.text(
        "Berat",
        103,
        y
      );

      pdf.text(
        "Harga/Kg",
        130,
        y
      );

      pdf.text(
        "Poin",
        172,
        y
      );

      y += 9;

      /* TABLE CONTENT */

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      for (
        const detail of
          data.detailSetors || []
      ) {
        const kategori =
          detail.kategoriSampah;

        pdf.setTextColor(
          45,
          55,
          49
        );

        pdf.text(
          kategori?.namaKategori ||
            "Kategori Sampah",
          18,
          y
        );

        pdf.text(
          `${formatNumber(
            detail.beratKg
          )} kg`,
          103,
          y
        );

        pdf.text(
          formatRupiah(
            kategori?.hargaPerKg
          ),
          130,
          y
        );

        pdf.text(
          `${formatNumber(
            detail.subtotalPoin
          )}`,
          172,
          y
        );

        y += 8;

        /*
         * Jika tabel terlalu panjang,
         * buat halaman baru.
         */

        if (y > 265) {
          pdf.addPage();
          y = 20;
        }
      }

      /* ===================================================
         TOTAL
      =================================================== */

      y += 3;

      pdf.setDrawColor(
        220,
        220,
        220
      );

      pdf.line(
        15,
        y,
        pageWidth - 15,
        y
      );

      y += 9;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.text(
        "TOTAL BERAT",
        15,
        y
      );

      pdf.text(
        `${formatNumber(
          data.totalBeratKg
        )} kg`,
        103,
        y
      );

      y += 8;

      pdf.text(
        "TOTAL POIN",
        15,
        y
      );

      pdf.setTextColor(
        138,
        106,
        40
      );

      pdf.text(
        `${formatNumber(
          totalPoin
        )} poin`,
        103,
        y
      );

      /* ===================================================
         CATATAN
      =================================================== */

      if (
        data.catatan ||
        data.catatanAdmin
      ) {
        y += 12;

        pdf.setTextColor(
          23,
          60,
          43
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(10);

        pdf.text(
          "Catatan",
          15,
          y
        );

        y += 7;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
          80,
          80,
          80
        );

        if (data.catatan) {
          pdf.text(
            `Nasabah: ${data.catatan}`,
            15,
            y,
            {
              maxWidth:
                pageWidth - 30,
            }
          );

          y += 7;
        }

        if (data.catatanAdmin) {
          pdf.text(
            `Admin: ${data.catatanAdmin}`,
            15,
            y,
            {
              maxWidth:
                pageWidth - 30,
            }
          );
        }
      }

      /* ===================================================
         FOOTER
      =================================================== */

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      pdf.setDrawColor(
        225,
        225,
        225
      );

      pdf.line(
        15,
        pageHeight - 25,
        pageWidth - 15,
        pageHeight - 25
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        130,
        130,
        130
      );

      pdf.text(
        "Terima kasih telah berpartisipasi dalam Bank Sampah.",
        pageWidth / 2,
        pageHeight - 18,
        {
          align: "center",
        }
      );

      /* ===================================================
         SAVE
      =================================================== */

      const fileName =
        `Nota-${data.kodeSetor || "Setoran"}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error(
        "Gagal membuat PDF:",
        error
      );

      alert(
        "Gagal membuat nota PDF. Pastikan package jsPDF sudah terinstall."
      );
    } finally {
      setDownloading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>

      {/* =====================================================
          BACK
      ===================================================== */}

      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2f8135] transition hover:text-[#235f29]"
      >
        <ArrowLeft size={18} />

        Kembali ke Riwayat
      </button>

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            <StatusIcon
              status={data.status}
            />

            {getStatusLabel(
              data.status
            )}
          </span>
        </div>
      </div>

      {/* =====================================================
          DOWNLOAD PDF
          HANYA UNTUK STATUS SELESAI
      ===================================================== */}

      {data.status === "selesai" && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#276d2c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Membuat PDF...
              </>
            ) : (
              <>
                <Download size={17} />

                Download Nota PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

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
                {formatNumber(
                  data.totalBeratKg
                )}{" "}
                kg
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
                {formatNumber(
                  totalPoin
                )}{" "}
                poin
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
                {data.detailSetors?.length ||
                  0}{" "}
                jenis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          INFORMASI NASABAH
      ===================================================== */}

      {nasabah && (
        <section className="mb-6 rounded-[24px] border border-[#e5e0d5] bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2e6] text-[#2f8135]">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-[#173c2b]">
                Informasi Nasabah
              </h2>

              <p className="mt-0.5 text-xs text-[#89918b]">
                Data nasabah pemilik transaksi
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-[#fcfbf8] p-4">
              <p className="text-xs text-[#89918b]">
                Nama Nasabah
              </p>

              <p className="mt-1 font-semibold text-[#173c2b]">
                {nasabah.namaNasabah ||
                  "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#fcfbf8] p-4">
              <div className="flex items-center gap-2">

                <Phone
                  size={15}
                  className="text-[#2f8135]"
                />

                <p className="text-xs text-[#89918b]">
                  Nomor Telepon
                </p>
              </div>

              <p className="mt-1 font-semibold text-[#173c2b]">
                {nasabah.telp || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#fcfbf8] p-4 sm:col-span-2">
              <div className="flex items-center gap-2">

                <MapPin
                  size={15}
                  className="text-[#2f8135]"
                />

                <p className="text-xs text-[#89918b]">
                  Alamat
                </p>
              </div>

              <p className="mt-1 text-sm leading-6 text-[#35463b]">
                {nasabah.alamat || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#edf5ea] p-4 sm:col-span-2">
              <p className="text-xs text-[#71836c]">
                Saldo Poin Nasabah
              </p>

              <p className="mt-1 text-lg font-bold text-[#52744b]">
                {formatNumber(
                  nasabah.saldoPoin
                )}{" "}
                poin
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          DETAIL SAMPAH
      ===================================================== */}

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

              <div className="hidden grid-cols-[1fr_110px_140px_120px] bg-[#f8f6f1] px-4 py-3 text-xs font-semibold text-[#657068] sm:grid">

                <span>
                  Jenis Sampah
                </span>

                <span className="text-right">
                  Berat
                </span>

                <span className="text-right">
                  Harga / Kg
                </span>

                <span className="text-right">
                  Poin
                </span>
              </div>

              <div className="divide-y divide-[#eeeae2]">

                {data.detailSetors.map(
                  (detail, index) => {
                    const kategori =
                      detail.kategoriSampah;

                    return (
                      <div
                        key={
                          detail.id ||
                          `${detail.kategoriSampahId}-${index}`
                        }
                        className="grid gap-4 px-4 py-4 sm:grid-cols-[1fr_110px_140px_120px] sm:items-center"
                      >

                        <div>
                          <p className="font-semibold text-[#173c2b]">
                            {kategori?.namaKategori ||
                              "Kategori Sampah"}
                          </p>

                          {kategori?.jenis && (
                            <span className="mt-1 inline-flex rounded-full bg-[#e7f2e6] px-2.5 py-1 text-[10px] font-medium capitalize text-[#2f8135]">
                              {kategori.jenis}
                            </span>
                          )}

                          {kategori?.poinPerKg !==
                            undefined && (
                            <p className="mt-2 text-xs text-[#89918b]">
                              {formatNumber(
                                kategori.poinPerKg
                              )}{" "}
                              poin / kg
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
                            Harga / Kg
                          </span>

                          <span className="font-medium text-[#536058]">
                            {formatRupiah(
                              kategori?.hargaPerKg
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm sm:block sm:text-right">

                          <span className="text-[#89918b] sm:hidden">
                            Poin
                          </span>

                          <span className="font-semibold text-[#8a6a28]">
                            {formatNumber(
                              detail.subtotalPoin
                            )}{" "}
                            poin
                          </span>
                        </div>

                      </div>
                    );
                  }
                )}
              </div>

              <div className="border-t border-[#e8e4dc] bg-[#f8f6f1] px-4 py-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-[#526158]">
                    Total
                  </span>

                  <div className="text-right">

                    <p className="text-sm font-bold text-[#173c2b]">
                      {formatNumber(
                        data.totalBeratKg
                      )}{" "}
                      kg
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#8a6a28]">
                      {formatNumber(
                        totalPoin
                      )}{" "}
                      poin
                    </p>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          INFORMASI TRANSAKSI
      ===================================================== */}

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
                {formatNumber(
                  data.totalBeratKg
                )}{" "}
                kg
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
                {getStatusLabel(
                  data.status
                )}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          CATATAN
      ===================================================== */}

      {(data.catatan ||
        data.catatanAdmin) && (
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

      {/* =====================================================
          DOWNLOAD BUTTON
      ===================================================== */}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

        {data.status === "selesai" && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#276d2c] disabled:opacity-60"
          >
            {downloading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Membuat Nota...
              </>
            ) : (
              <>
                <Download size={17} />

                Download Nota PDF
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dcd7cd] bg-white px-5 py-3 text-sm font-semibold text-[#536058] shadow-sm transition hover:bg-[#f7f5f0]"
        >
          <ArrowLeft size={17} />

          Kembali ke Riwayat
        </button>
      </div>
    </div>
  );
}