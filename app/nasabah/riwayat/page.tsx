"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Loader2,
  Package,
  RefreshCw,
  Scale,
  Search,
  XCircle,
} from "lucide-react";

import DetailRiwayat from "./detail";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const ENV_APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type Status =
  | "menunggu_konfirmasi"
  | "dikonfirmasi"
  | "diterima"
  | "selesai"
  | "ditolak"
  | "dibatalkan"
  | string;

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
  status?: Status;
  totalBeratKg?: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;
  catatan?: string;
  catatanAdmin?: string;
  detailSetors?: DetailSetor[];
}

function getToken() {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("token") || "";
}

function getAppKey() {
  if (typeof window === "undefined") {
    return ENV_APP_KEY;
  }

  return localStorage.getItem("appKey") || ENV_APP_KEY;
}

function getHeaders(): HeadersInit {
  const token = getToken();
  const appKey = getAppKey();

  return {
    "Content-Type": "application/json",
    "x-app-key": appKey,
    Authorization: `Bearer ${token}`,
  };
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
    return <CheckCircle2 size={14} />;
  }

  if (status === "ditolak" || status === "dibatalkan") {
    return <XCircle size={14} />;
  }

  if (status === "menunggu_konfirmasi") {
    return <Clock3 size={14} />;
  }

  return <CheckCircle2 size={14} />;
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
  }).format(parsedDate);
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export default function RiwayatNasabahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const detailId = searchParams.get("detail");

  const [data, setData] = useState<SetorSampah[]>([]);
  const [detailData, setDetailData] = useState<SetorSampah | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const [bulan, setBulan] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [search, setSearch] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = bulan
        ? `?bulan=${encodeURIComponent(bulan)}`
        : "";

      const response = await fetch(
        `${API_URL}/api/v1/setor-sampah/my-setor${query}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Gagal mengambil riwayat (${response.status})`
        );
      }

      let items: SetorSampah[] = [];

      if (Array.isArray(result?.data)) {
        items = result.data;
      } else if (Array.isArray(result)) {
        items = result;
      } else if (Array.isArray(result?.data?.items)) {
        items = result.data.items;
      } else if (Array.isArray(result?.items)) {
        items = result.items;
      }

      setData(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil riwayat."
      );
    } finally {
      setLoading(false);
    }
  }, [bulan]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      setLoadingDetail(true);
      setDetailError("");
      setDetailData(null);

      const response = await fetch(
        `${API_URL}/api/v1/setor-sampah/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Gagal mengambil detail (${response.status})`
        );
      }

      const detail =
        result?.data && !Array.isArray(result.data)
          ? result.data
          : result;

      setDetailData(detail);
    } catch (err) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil detail."
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (!detailId) {
      fetchHistory();
    }
  }, [detailId, fetchHistory]);

  useEffect(() => {
    if (detailId) {
      fetchDetail(detailId);
    }
  }, [detailId, fetchDetail]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus =
        statusFilter === "semua" ||
        item.status === statusFilter;

      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.kodeSetor?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [data, statusFilter, search]);

  const totalTransaksi = data.length;

  const transaksiSelesai = data.filter(
  (item) => item.status === "selesai"
);

const totalBerat = transaksiSelesai.reduce(
  (total, item) =>
    total + Number(item.totalBeratKg || 0),
  0
);

const totalPoin = transaksiSelesai.reduce(
  (total, item) =>
    total +
    Number(
      item.totalPoin ??
        item.estimasiTotalPoin ??
        0
    ),
  0
);

  const groupedData = useMemo(() => {
    const groups: Record<string, SetorSampah[]> = {};

    filteredData.forEach((item) => {
      const date = item.tanggal
        ? new Date(item.tanggal)
        : null;

      const key =
        date && !Number.isNaN(date.getTime())
          ? new Intl.DateTimeFormat("id-ID", {
              month: "long",
              year: "numeric",
            }).format(date)
          : "Tanggal Tidak Diketahui";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.entries(groups);
  }, [filteredData]);

  function handleOpenDetail(id: string) {
    router.push(
      `/nasabah/riwayat?detail=${encodeURIComponent(id)}`
    );
  }

  function handleBack() {
    router.push("/nasabah/riwayat");
  }

  if (detailId) {
    if (loadingDetail) {
      return (
        <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-[#2f8135]">
              <Loader2
                size={32}
                className="animate-spin"
              />
              <p className="text-sm text-[#6b756d]">
                Memuat detail transaksi...
              </p>
            </div>
          </div>
        </main>
      );
    }

    if (detailError || !detailData) {
      return (
        <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <button
              type="button"
              onClick={handleBack}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#2f8135] transition hover:text-[#235f29]"
            >
              <ArrowLeft size={18} />
              Kembali ke Riwayat
            </button>

            <div className="rounded-[20px] border border-red-100 bg-white p-8 text-center shadow-sm">
              <XCircle
                size={40}
                className="mx-auto mb-3 text-red-400"
              />

              <h2 className="text-lg font-semibold text-[#173c2b]">
                Detail tidak dapat dimuat
              </h2>

              <p className="mt-2 text-sm text-[#6b756d]">
                {detailError || "Data transaksi tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={() => fetchDetail(detailId)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2f8135] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#276d2c]"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <DetailRiwayat
            data={detailData}
            onBack={handleBack}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f2e6] text-[#2f8135]">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#173c2b] sm:text-3xl">
                Riwayat Setor Sampah
              </h1>

              <p className="mt-1 text-sm text-[#6b756d]">
                Lihat semua riwayat penyetoran sampah kamu.
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#7a817c]">
                  Total Transaksi
                </p>

                <p className="mt-2 text-2xl font-bold text-[#173c2b]">
                  {formatNumber(totalTransaksi)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2e6] text-[#2f8135]">
                <Package size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#7a817c]">
                  Total Berat
                </p>

                <p className="mt-2 text-2xl font-bold text-[#173c2b]">
                  {formatNumber(totalBerat)}{" "}
                  <span className="text-base font-medium">
                    kg
                  </span>
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eadf] text-[#8a6847]">
                <Scale size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#7a817c]">
                  Total Poin
                </p>

                <p className="mt-2 text-2xl font-bold text-[#173c2b]">
                  {formatNumber(totalPoin)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a47721]">
                <Coins size={19} />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-7 rounded-[20px] border border-[#e5e0d5] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto] md:items-end">
            {/* SEARCH */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#35463b]">
                Cari transaksi
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa19b]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari kode setor..."
                  className="h-11 w-full rounded-xl border border-[#ddd8ce] bg-[#fcfbf8] pl-10 pr-4 text-sm text-[#173c2b] outline-none transition placeholder:text-[#a4aaa5] focus:border-[#2f8135] focus:ring-2 focus:ring-[#2f8135]/10"
                />
              </div>
            </div>

            {/* MONTH */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#35463b]">
                Bulan
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa19b]"
                />

                <input
                  type="month"
                  value={bulan}
                  onChange={(e) =>
                    setBulan(e.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#ddd8ce] bg-[#fcfbf8] pl-10 pr-3 text-sm text-[#173c2b] outline-none focus:border-[#2f8135] focus:ring-2 focus:ring-[#2f8135]/10"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#35463b]">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#ddd8ce] bg-[#fcfbf8] px-3 text-sm text-[#173c2b] outline-none focus:border-[#2f8135] focus:ring-2 focus:ring-[#2f8135]/10"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu_konfirmasi">
                  Menunggu Konfirmasi
                </option>
                <option value="dikonfirmasi">
                  Dikonfirmasi
                </option>
                <option value="diterima">Diterima</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
                <option value="dibatalkan">
                  Dibatalkan
                </option>
              </select>
            </div>

            {/* RESET */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setBulan("");
                setStatusFilter("semua");
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd8ce] bg-white px-4 text-sm font-medium text-[#536058] transition hover:bg-[#f7f5f0]"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-[18px] border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <div>
              <p className="font-semibold">
                Gagal memuat riwayat
              </p>
              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchHistory}
              className="shrink-0 rounded-lg bg-white px-3 py-2 font-medium text-red-700 shadow-sm hover:bg-red-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[20px] border border-[#e5e0d5] bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={30}
                className="animate-spin text-[#2f8135]"
              />

              <p className="text-sm text-[#737b75]">
                Memuat riwayat...
              </p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          /* EMPTY */
          <div className="rounded-[20px] border border-[#e5e0d5] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f2e6] text-[#2f8135]">
              <Package size={25} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#173c2b]">
              Belum ada riwayat
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737b75]">
              Belum ada transaksi penyetoran yang sesuai
              dengan filter yang kamu pilih.
            </p>
          </div>
        ) : (
          /* LIST */
          <div className="space-y-7">
            {groupedData.map(
              ([month, transactions]) => (
                <section key={month}>
                  <div className="mb-3 flex items-center gap-3">
                    <h2 className="text-sm font-semibold capitalize text-[#526158]">
                      {month}
                    </h2>

                    <div className="h-px flex-1 bg-[#e5e0d5]" />
                  </div>

                  <div className="space-y-3">
                    {transactions.map((item) => {
                      const point =
                        item.totalPoin ??
                        item.estimasiTotalPoin ??
                        0;

                      return (
                        <div
                          key={item.id}
                          className="group rounded-[20px] border border-[#e5e0d5] bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:p-5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f2e6] text-[#2f8135] sm:flex">
                              <Package size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-semibold text-[#173c2b]">
                                  {item.kodeSetor ||
                                    "Transaksi Setor"}
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                                    item.status
                                  )}`}
                                >
                                  <StatusIcon
                                    status={item.status}
                                  />

                                  {getStatusLabel(
                                    item.status
                                  )}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#7a817c]">
                                <span>
                                  {formatDate(
                                    item.tanggal
                                  )}
                                </span>

                                <span>
                                  {formatNumber(
                                    item.totalBeratKg
                                  )}{" "}
                                  kg
                                </span>

                                <span className="font-medium text-[#8a6a28]">
                                  {formatNumber(point)}{" "}
                                  poin
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDetail(
                                  item.id
                                )
                              }
                              aria-label="Lihat detail transaksi"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e1ddd4] bg-[#fcfbf8] text-[#536058] transition group-hover:border-[#c8dec7] group-hover:bg-[#e7f2e6] group-hover:text-[#2f8135]"
                            >
                              <ArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}