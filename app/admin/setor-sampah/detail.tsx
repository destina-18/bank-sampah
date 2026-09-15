"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleUserRound,
  MapPin,
  Phone,
  Recycle,
  Scale,
  Coins,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

type DetailSetor = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: "menunggu_konfirmasi" | "diverifikasi" | "selesai" | "ditolak";
  nasabah: {
    namaNasabah: string;
    alamat: string;
    telp: string;
  };
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
  catatanAdmin?: string;
  detailSetors: {
    kategori: string;
    jenis: string;
    beratKg: number;
    poinPerKg: number;
    subtotalPoin: number;
  }[];
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function getAppKey() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("appKey") ||
    localStorage.getItem("app_key") ||
    process.env.NEXT_PUBLIC_APP_KEY ||
    ""
  );
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");
}

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: DetailSetor["status"] }) {
  const config = {
    menunggu_konfirmasi: {
      label: "Menunggu Konfirmasi",
      icon: Clock3,
      className: "bg-[#fff4dc] text-[#a06a20] border-[#ead5ad]",
    },
    diverifikasi: {
      label: "Diverifikasi",
      icon: CheckCircle2,
      className: "bg-[#edf3e8] text-[#607653] border-[#d3dfca]",
    },
    selesai: {
      label: "Selesai",
      icon: CheckCircle2,
      className: "bg-[#e8f1e5] text-[#4f7045] border-[#cbdcc5]",
    },
    ditolak: {
      label: "Ditolak",
      icon: XCircle,
      className: "bg-[#f8e9e5] text-[#a55e52] border-[#e8c9c2]",
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium ${item.className}`}
    >
      <Icon size={14} />
      {item.label}
    </span>
  );
}

export default function DetailSetorSampahPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<DetailSetor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ID transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    async function fetchDetail() {
      try {
        setLoading(true);

        const response = await fetch(
          `${getBaseUrl()}/api/v1/setor-sampah/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-app-key": getAppKey(),
              Authorization: `Bearer ${getToken()}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result?.message || "Gagal mengambil detail transaksi."
          );
        }

        setData(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded bg-[#e9e2d9]" />
          <div className="mt-7 h-48 animate-pulse rounded-2xl bg-[#eee8df]" />
          <div className="mt-5 h-72 animate-pulse rounded-2xl bg-[#eee8df]" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/setor-sampah"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#746c61] hover:text-[#4d4841]"
          >
            <ArrowLeft size={17} />
            Kembali
          </Link>

          <div className="rounded-2xl border border-[#e8d0ca] bg-[#fffaf8] p-8 text-center text-sm text-[#a55e52]">
            {error || "Data tidak ditemukan."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/setor-sampah"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#746c61] transition hover:text-[#4d4841]"
        >
          <ArrowLeft size={17} />
          Kembali ke Setor Sampah
        </Link>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#938a7e]">
              <Recycle size={15} />
              Setor Sampah
              <span>/</span>
              Detail
            </div>

            <h1 className="mt-2 text-2xl font-semibold text-[#39362f]">
              Detail Setoran
            </h1>

            <p className="mt-1 text-sm text-[#938a7e]">
              Informasi lengkap transaksi penyetoran sampah.
            </p>
          </div>

          <StatusBadge status={data.status} />
        </div>

        {/* Transaction Header */}
        <section className="mb-5 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-xs text-[#978e83]">Kode Setor</p>
              <p className="mt-1 font-semibold text-[#4b4740]">
                {data.kodeSetor}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#978e83]">Tanggal Setor</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#4b4740]">
                <CalendarDays size={16} className="text-[#7b896f]" />
                {formatTanggal(data.tanggal)}
              </div>
            </div>

            <div>
              <p className="text-xs text-[#978e83]">Total Berat</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#4b4740]">
                <Scale size={16} className="text-[#7b896f]" />
                {data.totalBeratKg} kg
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.4fr]">
          {/* Nasabah */}
          <section className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee8df] text-[#7b7469]">
                <CircleUserRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[#48443d]">Data Nasabah</h2>
                <p className="text-xs text-[#999086]">
                  Informasi pemilik setoran
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#978e83]">Nama Nasabah</p>
                <p className="mt-1 text-sm font-medium text-[#4b4740]">
                  {data.nasabah.namaNasabah}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#978e83]">No. Telepon</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-[#625b52]">
                  <Phone size={15} className="text-[#7d896f]" />
                  {data.nasabah.telp}
                </div>
              </div>

              <div>
                <p className="text-xs text-[#978e83]">Alamat</p>
                <div className="mt-1 flex items-start gap-2 text-sm leading-6 text-[#625b52]">
                  <MapPin
                    size={15}
                    className="mt-1 shrink-0 text-[#7d896f]"
                  />
                  {data.nasabah.alamat || "-"}
                </div>
              </div>
            </div>
          </section>

          {/* Ringkasan */}
          <section className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#657c59]">
                <Coins size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-[#48443d]">
                  Ringkasan Poin
                </h2>
                <p className="text-xs text-[#999086]">
                  Hasil perhitungan penyetoran
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#dce5d6] bg-[#f4f8f1] p-5">
              <p className="text-xs text-[#7c8875]">Total Poin</p>
              <p className="mt-1 text-3xl font-semibold text-[#59704f]">
                {new Intl.NumberFormat("id-ID").format(data.totalPoin)}
              </p>
                <p className="mt-1 text-xs text-[#899482]">poin</p>
            </div>

            {data.catatan && (
              <div className="mt-4 rounded-xl border border-[#ebe3d9] bg-[#faf7f2] p-4">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#837a6e]" />
                  <p className="text-xs font-medium text-[#6e665c]">
                    Catatan Nasabah
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#756d63]">
                  {data.catatan}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Detail Sampah */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="border-b border-[#eee7de] p-6">
            <h2 className="font-semibold text-[#48443d]">
              Detail Sampah
            </h2>
            <p className="mt-1 text-xs text-[#999086]">
              Rincian kategori dan berat sampah yang disetorkan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="bg-[#faf7f2] text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-[#82796e]">
                    No
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold text-[#82796e]">
                    Kategori
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold text-[#82796e]">
                    Jenis
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold text-[#82796e]">
                    Berat
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold text-[#82796e]">
                    Poin / Kg
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#82796e]">
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.detailSetors.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#f0eae2] text-sm"
                  >
                    <td className="px-6 py-4 text-[#948b80]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 font-medium text-[#4e4942]">
                      {item.kategori}
                    </td>
                    <td className="px-4 py-4 capitalize text-[#756d63]">
                      {item.jenis}
                    </td>
                    <td className="px-4 py-4 text-[#756d63]">
                      {item.beratKg} kg
                    </td>
                    <td className="px-4 py-4 text-[#756d63]">
                      {item.poinPerKg}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[#617653]">
                      {item.subtotalPoin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.catatanAdmin && (
            <div className="border-t border-[#eee7de] p-6">
              <div className="rounded-xl border border-[#e3ddd3] bg-[#faf7f2] p-4">
                <p className="text-xs font-semibold text-[#6e665c]">
                  Catatan Admin
                </p>
                <p className="mt-2 text-sm leading-6 text-[#756d63]">
                  {data.catatanAdmin}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Action */}
        {data.status === "menunggu_konfirmasi" && (
          <div className="mt-5 flex justify-end">
            <Link
              href={`/admin/setor-sampah/edit?id=${data.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#718467] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#607456]"
            >
              <Scale size={17} />
              Verifikasi & Timbang
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}