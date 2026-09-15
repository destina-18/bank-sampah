"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Coins,
  Download,
  FileText,
  Package,
  Recycle,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";

type JenisSampah = {
  tonaseKg: number;
  rupiah: number;
  poin: number;
};

type LaporanData = {
  periode: string;
  rekapitulasiTonase: {
    totalKg: number;
    totalTon: number;
    totalEstimasiPembayaranRupiah: number;
    totalPoinDiterbitkan: number;
  };
  breakdownJenisSampah: {
    plastik: JenisSampah;
    kertas: JenisSampah;
    logam: JenisSampah;
    kaca: JenisSampah;
  };
  rekapitulasiPenukaranPoin: {
    totalTransaksiPenukaran: number;
    totalPoinTerpakai: number;
  };
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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatPeriode(value: string) {
  if (!value) return "-";

  const [year, month] = value.split("-");

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

const jenisConfig = [
  {
    key: "plastik" as const,
    label: "Plastik",
    description: "Sampah berbahan plastik",
  },
  {
    key: "kertas" as const,
    label: "Kertas",
    description: "Kardus dan kertas",
  },
  {
    key: "logam" as const,
    label: "Logam",
    description: "Sampah berbahan logam",
  },
  {
    key: "kaca" as const,
    label: "Kaca",
    description: "Sampah berbahan kaca",
  },
];

export default function LaporanPage() {
  const [bulan, setBulan] = useState(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [data, setData] = useState<LaporanData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLaporan() {
    try {
      setLoading(true);
      setError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_BASE_API_URL belum diatur di .env.local"
        );
      }

      if (!bulan) {
        throw new Error("Pilih bulan terlebih dahulu.");
      }

      const response = await fetch(
        `${baseUrl}/api/v1/rekapitulasi/bulanan?bulan=${bulan}`,
        {
          method: "GET",
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
          result?.message || "Gagal mengambil laporan bulanan."
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil laporan."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLaporan();
  }, [bulan]);

  function handlePrint() {
    window.print();
  }

  const totalKg =
    data?.rekapitulasiTonase.totalKg ?? 0;

  const totalTon =
    data?.rekapitulasiTonase.totalTon ?? 0;

  const totalPembayaran =
    data?.rekapitulasiTonase.totalEstimasiPembayaranRupiah ?? 0;

  const totalPoin =
    data?.rekapitulasiTonase.totalPoinDiterbitkan ?? 0;

  const totalPenukaran =
    data?.rekapitulasiPenukaranPoin.totalTransaksiPenukaran ?? 0;

  const totalPoinTerpakai =
    data?.rekapitulasiPenukaranPoin.totalPoinTerpakai ?? 0;

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-7 text-[#403c36] md:px-8 lg:px-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between print:mb-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277] print:hidden">
              <BarChart3 size={16} />
              <span>Admin</span>
              <span>/</span>
              <span>Laporan</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
              Laporan Bulanan
            </h1>

            <p className="mt-1 text-sm text-[#8c847a]">
              Rekapitulasi sampah, poin, dan estimasi pembayaran.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row print:hidden">
            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c847a]"
              />

              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="h-11 rounded-xl border border-[#e1d9cf] bg-[#fffdf9] pl-9 pr-3 text-sm text-[#625b52] outline-none transition focus:border-[#9baa91]"
              />
            </div>

            <button
              type="button"
              onClick={fetchLaporan}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dcd5cb] bg-[#fffdf9] px-4 text-sm font-medium text-[#6f675e] transition hover:bg-[#f1ece5] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#718467] px-4 text-sm font-medium text-white transition hover:bg-[#607456]"
            >
              <Download size={16} />
              Cetak Laporan
            </button>
          </div>
        </div>

        {/* Period */}
        <div className="mb-6 rounded-2xl border border-[#e6ded4] bg-[#fffdf9] px-5 py-4 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#657b59]">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs text-[#978e83]">
                Periode Laporan
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[#4b4740]">
                {formatPeriode(bulan)}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#e7cbc5] bg-[#fbefec] px-4 py-3 text-sm text-[#a55e52]">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Sampah */}
          <div className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#948b80]">
                  Total Sampah
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-28 animate-pulse rounded bg-[#ebe5dd]" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold text-[#403c36]">
                    {formatNumber(totalKg)}{" "}
                    <span className="text-sm font-medium text-[#8b8277]">
                      kg
                    </span>
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#647b59]">
                <Recycle size={19} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#9a9186]">
              Setara dengan {totalTon} ton
            </p>
          </div>

          {/* Estimasi */}
          <div className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#948b80]">
                  Estimasi Pembayaran
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-32 animate-pulse rounded bg-[#ebe5dd]" />
                ) : (
                  <p className="mt-1 text-xl font-semibold text-[#403c36]">
                    {formatRupiah(totalPembayaran)}
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1d8] text-[#a06d25]">
                <Wallet size={19} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#9a9186]">
              Perkiraan nilai sampah terkumpul
            </p>
          </div>

          {/* Poin */}
          <div className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#948b80]">
                  Poin Diterbitkan
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-24 animate-pulse rounded bg-[#ebe5dd]" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold text-[#58704e]">
                    {formatNumber(totalPoin)}
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#647b59]">
                <Coins size={19} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#9a9186]">
              Poin yang diberikan kepada nasabah
            </p>
          </div>

          {/* Penukaran */}
          <div className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#948b80]">
                  Penukaran Poin
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-24 animate-pulse rounded bg-[#ebe5dd]" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold text-[#403c36]">
                    {formatNumber(totalPenukaran)}
                  </p>
                )}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee8df] text-[#776f64]">
                <Package size={19} />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#9a9186]">
              {formatNumber(totalPoinTerpakai)} poin digunakan
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <section className="mb-6 rounded-2xl border border-[#e6ded4] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="border-b border-[#eee7de] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee8df] text-[#776f64]">
                <BarChart3 size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-[#48443d]">
                  Rincian Jenis Sampah
                </h2>

                <p className="mt-1 text-xs text-[#999086]">
                  Rekap berdasarkan jenis sampah yang terkumpul.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {jenisConfig.map((item) => {
              const value =
                data?.breakdownJenisSampah?.[item.key];

              const percentage =
                totalKg > 0 && value
                  ? (value.tonaseKg / totalKg) * 100
                  : 0;

              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-[#e8e0d6] bg-[#faf7f2] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#504b44]">
                        {item.label}
                      </p>

                      <p className="mt-0.5 text-xs text-[#978e83]">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8eee4] text-[#657b59]">
                      <Recycle size={17} />
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-5 h-8 w-24 animate-pulse rounded bg-[#e8e1d8]" />
                  ) : (
                    <>
                      <div className="mt-5 flex items-end gap-1">
                        <span className="text-2xl font-semibold text-[#46423b]">
                          {formatNumber(value?.tonaseKg ?? 0)}
                        </span>

                        <span className="mb-1 text-xs text-[#948b80]">
                          kg
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4ded5]">
                        <div
                          className="h-full rounded-full bg-[#829477] transition-all"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#938a7f]">
                            Persentase
                          </span>

                          <span className="font-medium text-[#655e55]">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-[#938a7f]">
                            Nilai
                          </span>

                          <span className="font-medium text-[#655e55]">
                            {formatRupiah(value?.rupiah ?? 0)}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-[#938a7f]">
                            Poin
                          </span>

                          <span className="font-medium text-[#617653]">
                            {formatNumber(value?.poin ?? 0)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tonase */}
          <section className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#647b59]">
                <TrendingUp size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-[#48443d]">
                  Rekapitulasi Tonase
                </h2>

                <p className="mt-1 text-xs text-[#999086]">
                  Ringkasan sampah bulan ini
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-[#eee7de]">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <span className="text-sm text-[#82796e]">
                  Total kilogram
                </span>

                <span className="font-semibold text-[#4e4942]">
                  {formatNumber(totalKg)} kg
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-[#82796e]">
                  Total tonase
                </span>

                <span className="font-semibold text-[#4e4942]">
                  {totalTon} ton
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-[#82796e]">
                  Estimasi pembayaran
                </span>

                <span className="font-semibold text-[#617653]">
                  {formatRupiah(totalPembayaran)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 last:pb-0">
                <span className="text-sm text-[#82796e]">
                  Poin diterbitkan
                </span>

                <span className="font-semibold text-[#617653]">
                  {formatNumber(totalPoin)} poin
                </span>
              </div>
            </div>
          </section>

          {/* Penukaran */}
          <section className="rounded-2xl border border-[#e6ded4] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee8df] text-[#776f64]">
                <Package size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-[#48443d]">
                  Penukaran Poin
                </h2>

                <p className="mt-1 text-xs text-[#999086]">
                  Aktivitas penukaran poin bulan ini
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#e4ddd4] bg-[#faf7f2] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#948b80]">
                    Total transaksi
                  </p>

                  <p className="mt-1 text-3xl font-semibold text-[#48443d]">
                    {formatNumber(totalPenukaran)}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#657b59]">
                  <Package size={21} />
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-[#dce5d6] bg-[#f3f7f0] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#82907b]">
                    Total poin terpakai
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#5c7252]">
                    {formatNumber(totalPoinTerpakai)}
                  </p>
                </div>

                <Coins size={21} className="text-[#718467]" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer report */}
        <div className="mt-6 flex items-center justify-between border-t border-[#e5ddd3] pt-5 text-xs text-[#9b9287] print:mt-8">
          <div className="flex items-center gap-2">
            <FileText size={14} />
            Laporan Bank Sampah Digital
          </div>

          <span>
            Periode {formatPeriode(bulan)}
          </span>
        </div>
      </div>
    </main>
  );
}