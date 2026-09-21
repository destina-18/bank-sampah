"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  FileText,
  Loader2,
  MapPin,
  Package,
  Phone,
  Recycle,
  Wallet,
} from "lucide-react";

type StatusSetor =
  | "menunggu_konfirmasi"
  | "diverifikasi"
  | "selesai"
  | "ditolak";

type KategoriSampah = {
  id?: string;
  namaKategori?: string;
  hargaPerKg?: number;
  poinPerKg?: number;
  jenis?: string;
  foto?: string | null;
};

type DetailSetor = {
  id: string;
  setorId?: string;
  kategoriSampahId?: string;
  beratKg: number;
  subtotalPoin: number;
  kategoriSampah?: KategoriSampah;
};

type Nasabah = {
  id?: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin?: number;
  foto?: string | null;
};

type DetailSetorResponse = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  nasabahId?: string;
  status: StatusSetor;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  catatanAdmin?: string;
  createdAt?: string;
  updatedAt?: string;
  nasabah: Nasabah;
  detailSetors: DetailSetor[];
};

const STATUS_LABEL: Record<StatusSetor, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  diverifikasi: "Diverifikasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

function getStatusClass(status: StatusSetor) {
  switch (status) {
    case "selesai":
      return "bg-[#e5f3e8] text-[#467052] border-[#c9e3ce]";

    case "diverifikasi":
      return "bg-[#e7f0f8] text-[#4d6c86] border-[#cbddea]";

    case "ditolak":
      return "bg-[#f8e6e4] text-[#9b5d58] border-[#ebcbc7]";

    default:
      return "bg-[#f8efd9] text-[#94763d] border-[#eadcb9]";
  }
}

function formatDate(date?: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken") ||
    ""
  );
}

function getAppKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("appKey") ||
    localStorage.getItem("app_key") ||
    process.env.NEXT_PUBLIC_APP_KEY ||
    ""
  );
}

export default function DetailSetorSampah({
  id,
}: {
  id: string;
}) {
  const [data, setData] =
    useState<DetailSetorResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "";

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_BASE_API_URL belum dikonfigurasi."
        );
      }

      const token = getToken();
      const appKey = getAppKey();

      if (!token) {
        throw new Error(
          "Token autentikasi tidak ditemukan."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/setor-sampah/${encodeURIComponent(
          id
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(appKey
              ? { "x-app-key": appKey }
              : {}),
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Gagal mengambil detail penyetoran (${response.status}).`
        );
      }

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message ||
            "Data detail penyetoran tidak ditemukan."
        );
      }

      setData(result.data);
    } catch (err) {
      console.error("FETCH DETAIL SETOR ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("ID penyetoran tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchDetail();
  }, [id]);

  /*
   * =========================================================
   * GENERATE NOTA PDF
   * =========================================================
   *
   * PDF HANYA BOLEH DIBUAT JIKA STATUS = SELESAI
   */
  const generateNotaPdf = async () => {
    if (!data) {
      return;
    }

    /*
     * Pengaman tambahan.
     * Walaupun fungsi ini dipanggil dari tempat lain,
     * PDF tetap tidak akan dibuat jika belum selesai.
     */
    if (data.status !== "selesai") {
      alert(
        "Nota PDF hanya dapat dibuat setelah penyetoran selesai."
      );
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF();

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      let y = 20;

      /*
       * HEADER
       */
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);

      pdf.text(
        "BANK SAMPAH",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 9;

      pdf.setFontSize(14);

      pdf.text(
        "NOTA PENYETORAN SAMPAH",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 15;

      /*
       * INFORMASI TRANSAKSI
       */
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      pdf.text(
        `Kode Setor : ${data.kodeSetor}`,
        15,
        y
      );

      y += 7;

      pdf.text(
        `Tanggal : ${formatDateTime(data.tanggal)}`,
        15,
        y
      );

      y += 7;

      pdf.text(
        `Status : ${
          STATUS_LABEL[data.status] ||
          data.status
        }`,
        15,
        y
      );

      y += 12;

      /*
       * DATA NASABAH
       */
      pdf.setFont("helvetica", "bold");

      pdf.text(
        "DATA NASABAH",
        15,
        y
      );

      y += 7;

      pdf.setFont("helvetica", "normal");

      pdf.text(
        `Nama : ${
          data.nasabah?.namaNasabah || "-"
        }`,
        15,
        y
      );

      y += 7;

      pdf.text(
        `Telepon : ${
          data.nasabah?.telp || "-"
        }`,
        15,
        y
      );

      y += 7;

      pdf.text(
        `Alamat : ${
          data.nasabah?.alamat || "-"
        }`,
        15,
        y
      );

      y += 12;

      /*
       * DETAIL SAMPAH
       */
      pdf.setFont("helvetica", "bold");

      pdf.text(
        "DETAIL SAMPAH",
        15,
        y
      );

      y += 8;

      pdf.setFont("helvetica", "normal");

      data.detailSetors?.forEach(
        (item, index) => {
          const kategori =
            item.kategoriSampah
              ?.namaKategori || "-";

          const berat = `${formatNumber(
            item.beratKg
          )} kg`;

          const harga = formatCurrency(
            item.kategoriSampah
              ?.hargaPerKg
          );

          const poin = `${formatNumber(
            item.subtotalPoin
          )} poin`;

          pdf.text(
            `${index + 1}. ${kategori}`,
            15,
            y
          );

          y += 6;

          pdf.text(
            `Berat: ${berat}`,
            20,
            y
          );

          y += 6;

          pdf.text(
            `Harga/kg: ${harga}`,
            20,
            y
          );

          y += 6;

          pdf.text(
            `Subtotal poin: ${poin}`,
            20,
            y
          );

          y += 9;

          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
        }
      );

      /*
       * TOTAL
       */
      pdf.setFont("helvetica", "bold");

      pdf.text(
        `Total Berat : ${formatNumber(
          data.totalBeratKg
        )} kg`,
        15,
        y
      );

      y += 7;

      pdf.text(
        `Total Poin : ${formatNumber(
          data.totalPoin
        )} poin`,
        15,
        y
      );

      y += 12;

      /*
       * CATATAN NASABAH
       */
      if (data.catatan) {
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          "Catatan",
          15,
          y
        );

        y += 6;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        const notes =
          pdf.splitTextToSize(
            data.catatan,
            pageWidth - 30
          );

        pdf.text(
          notes,
          15,
          y
        );

        y +=
          notes.length * 5 + 5;
      }

      /*
       * CATATAN ADMIN
       */
      if (data.catatanAdmin) {
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.text(
          "Catatan Admin",
          15,
          y
        );

        y += 6;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        const notesAdmin =
          pdf.splitTextToSize(
            data.catatanAdmin,
            pageWidth - 30
          );

        pdf.text(
          notesAdmin,
          15,
          y
        );

        y +=
          notesAdmin.length * 5 + 5;
      }

      y += 10;

      /*
       * FOOTER
       */
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.text(
        "Dokumen ini dibuat secara otomatis oleh sistem Bank Sampah.",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      /*
       * SIMPAN PDF
       */
      pdf.save(
        `Nota-${data.kodeSetor || "Setoran"}.pdf`
      );
    } catch (err) {
      console.error(
        "GENERATE PDF ERROR:",
        err
      );

      alert(
        "Gagal membuat PDF. Pastikan package jspdf sudah terinstall."
      );
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1e8]">
        <div className="flex flex-col items-center gap-3 text-[#82796e]">
          <Loader2 className="h-8 w-8 animate-spin" />

          <p className="text-sm">
            Memuat detail penyetoran...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f7f1e8] p-6">
        <div className="mx-auto max-w-5xl">

          <Link
            href="/admin/setor-sampah"
            className="inline-flex items-center gap-2 text-sm text-[#82796e] hover:text-[#5f584f]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="mt-6 rounded-2xl border border-[#eadbd0] bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f8e6e4]">
              <FileText className="h-7 w-7 text-[#9b5d58]" />
            </div>

            <h2 className="text-lg font-semibold text-[#514b44]">
              Gagal Memuat Data
            </h2>

            <p className="mt-2 text-sm text-[#82796e]">
              {error ||
                "Data penyetoran tidak ditemukan."}
            </p>

            <button
              onClick={fetchDetail}
              className="mt-5 rounded-xl bg-[#82796e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6f675e]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * DETAIL PAGE
   * =========================================================
   */
  return (
    <div className="min-h-screen bg-[#f7f1e8] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin/setor-sampah"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#82796e] transition hover:text-[#5f584f]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Setor Sampah
            </Link>

            <h1 className="text-2xl font-bold text-[#514b44]">
              Detail Penyetoran
            </h1>

            <p className="mt-1 text-sm text-[#82796e]">
              Informasi lengkap transaksi
              penyetoran sampah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* STATUS */}
            <span
              className={`rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass(
                data.status
              )}`}
            >
              {STATUS_LABEL[data.status] ||
                data.status}
            </span>

            {/* DOWNLOAD PDF
                HANYA STATUS SELESAI */}
            {data.status === "selesai" && (
              <button
                type="button"
                onClick={generateNotaPdf}
                className="inline-flex items-center gap-2 rounded-xl bg-[#82796e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6f675e]"
              >
                <FileText className="h-4 w-4" />
                Download Nota PDF
              </button>
            )}
          </div>
        </div>

        {/* MAIN INFORMATION */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* TRANSACTION */}
          <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm lg:col-span-2">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eadf]">
                <Recycle className="h-5 w-5 text-[#82796e]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#514b44]">
                  Informasi Penyetoran
                </h2>

                <p className="text-sm text-[#9a9085]">
                  {data.kodeSetor}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <InfoItem
                icon={
                  <FileText className="h-4 w-4" />
                }
                label="Kode Setor"
                value={data.kodeSetor}
              />

              <InfoItem
                icon={
                  <CalendarDays className="h-4 w-4" />
                }
                label="Tanggal"
                value={formatDate(
                  data.tanggal
                )}
              />

              <InfoItem
                icon={
                  <Package className="h-4 w-4" />
                }
                label="Total Berat"
                value={`${formatNumber(
                  data.totalBeratKg
                )} kg`}
              />

              <InfoItem
                icon={
                  <Wallet className="h-4 w-4" />
                }
                label="Total Poin"
                value={`${formatNumber(
                  data.totalPoin
                )} poin`}
              />
            </div>
          </div>

          {/* NASABAH */}
          <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3eadf]">
                <CircleUserRound className="h-5 w-5 text-[#82796e]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#514b44]">
                  Nasabah
                </h2>

                <p className="text-sm text-[#9a9085]">
                  Data nasabah
                </p>
              </div>
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-[#9a9085]">
                  Nama
                </p>

                <p className="mt-1 font-medium text-[#514b44]">
                  {data.nasabah
                    ?.namaNasabah || "-"}
                </p>
              </div>

              <div className="flex gap-3">

                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#82796e]" />

                <div>
                  <p className="text-xs text-[#9a9085]">
                    Telepon
                  </p>

                  <p className="mt-1 text-sm text-[#514b44]">
                    {data.nasabah?.telp ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">

                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#82796e]" />

                <div>
                  <p className="text-xs text-[#9a9085]">
                    Alamat
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#514b44]">
                    {data.nasabah
                      ?.alamat || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">

          {/* TOTAL BERAT */}
          <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#9a9085]">
                  Total Berat Sampah
                </p>

                <p className="mt-2 text-2xl font-bold text-[#514b44]">
                  {formatNumber(
                    data.totalBeratKg
                  )}

                  <span className="ml-1 text-base font-medium">
                    kg
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf4e9]">
                <Recycle className="h-6 w-6 text-[#5f7b5f]" />
              </div>
            </div>
          </div>

          {/* TOTAL POIN */}
          <div className="rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-[#9a9085]">
                  Total Poin
                </p>

                <p className="mt-2 text-2xl font-bold text-[#514b44]">
                  {formatNumber(
                    data.totalPoin
                  )}

                  <span className="ml-1 text-base font-medium">
                    poin
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8efd9]">
                <Wallet className="h-6 w-6 text-[#94763d]" />
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL TABLE */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadbd0] bg-white shadow-sm">

          <div className="border-b border-[#eee3da] px-5 py-4">

            <h2 className="font-semibold text-[#514b44]">
              Detail Sampah
            </h2>

            <p className="mt-1 text-sm text-[#9a9085]">
              Rincian jenis sampah yang
              disetorkan.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-[#eee3da] bg-[#fcf9f5]">

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    No
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Kategori Sampah
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Jenis
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Berat
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Harga / Kg
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Poin / Kg
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#82796e]">
                    Subtotal Poin
                  </th>
                </tr>
              </thead>

              <tbody>

                {data.detailSetors?.length >
                0 ? (
                  data.detailSetors.map(
                    (item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#f1e8e1] last:border-0"
                      >

                        <td className="px-5 py-4 text-sm text-[#82796e]">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-[#514b44]">
                            {item
                              .kategoriSampah
                              ?.namaKategori ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f3eadf] px-3 py-1 text-xs text-[#82796e]">
                            {item
                              .kategoriSampah
                              ?.jenis ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-[#514b44]">
                          {formatNumber(
                            item.beratKg
                          )}{" "}
                          kg
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-[#514b44]">
                          {formatCurrency(
                            item
                              .kategoriSampah
                              ?.hargaPerKg
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-[#514b44]">
                          {formatNumber(
                            item
                              .kategoriSampah
                              ?.poinPerKg
                          )}{" "}
                          poin
                        </td>

                        <td className="px-5 py-4 text-right">

                          <span className="font-semibold text-[#5f7b5f]">
                            {formatNumber(
                              item.subtotalPoin
                            )}
                          </span>{" "}

                          <span className="text-sm text-[#82796e]">
                            poin
                          </span>

                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm text-[#9a9085]"
                    >
                      Tidak ada detail
                      sampah.
                    </td>
                  </tr>
                )}

              </tbody>

              <tfoot>
                <tr className="bg-[#fcf9f5]">

                  <td
                    colSpan={3}
                    className="px-5 py-4 text-right font-semibold text-[#514b44]"
                  >
                    Total
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-[#514b44]">
                    {formatNumber(
                      data.totalBeratKg
                    )}{" "}
                    kg
                  </td>

                  <td colSpan={2}></td>

                  <td className="px-5 py-4 text-right font-semibold text-[#5f7b5f]">
                    {formatNumber(
                      data.totalPoin
                    )}{" "}
                    poin
                  </td>

                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* NOTES */}
        {(data.catatan ||
          data.catatanAdmin) && (
          <div className="mt-5 rounded-2xl border border-[#eadbd0] bg-white p-5 shadow-sm">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eadf]">
                <FileText className="h-5 w-5 text-[#82796e]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#514b44]">
                  Catatan
                </h2>

                <p className="text-sm text-[#9a9085]">
                  Catatan penyetoran
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {data.catatan && (
                <div className="rounded-xl bg-[#fcf9f5] p-4">

                  <p className="mb-1 text-xs font-medium text-[#9a9085]">
                    Catatan Nasabah
                  </p>

                  <p className="text-sm leading-6 text-[#514b44]">
                    {data.catatan}
                  </p>
                </div>
              )}

              {data.catatanAdmin && (
                <div className="rounded-xl bg-[#fcf9f5] p-4">

                  <p className="mb-1 text-xs font-medium text-[#9a9085]">
                    Catatan Admin
                  </p>

                  <p className="text-sm leading-6 text-[#514b44]">
                    {data.catatanAdmin}
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#eadbd0] bg-white p-5 text-sm shadow-sm md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-2 text-[#82796e]">

            {data.status ===
            "selesai" ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#5f7b5f]" />

                <span>
                  Penyetoran telah selesai.
                </span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />

                <span>
                  Status penyetoran:{" "}
                  {STATUS_LABEL[
                    data.status
                  ] || data.status}
                </span>
              </>
            )}

          </div>

          <span className="text-xs text-[#aaa096]">
            Dibuat:{" "}
            {formatDateTime(
              data.createdAt
            )}
          </span>

        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#fcf9f5] p-4">

      <div className="mt-0.5 text-[#82796e]">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-[#9a9085]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#514b44]">
          {value}
        </p>

      </div>
    </div>
  );
}