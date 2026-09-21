"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  Plus,
  Recycle,
  Sparkles,
  Wallet,
  Scale,
  Gift,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type UserData = {
  id?: string | number;
  username?: string;
  name?: string;
  fullName?: string;
  nama?: string;
  email?: string;
};

type SetoranTerakhir = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: string;
  totalBeratKg: number;
  totalPoin: number;
  catatan?: string;
};

type PenukaranTerakhir = {
  id: string;
  kodePenukaran?: string;
  tanggal?: string;
  poinTerpakai?: number;
  status?: string;
  hadiah?: {
    namaHadiah?: string;
  };
};

type DashboardData = {
  saldoPoin: number;
  totalPengajuanSetor: number;
  totalPenukaranHadiah: number;
  totalPoinDiperoleh: number;
  setorTerakhir: SetoranTerakhir[];
  penukaranTerakhir: PenukaranTerakhir[];
};

type DashboardResponse = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: DashboardData;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");
}

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken") ||
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

function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value ?? 0));
}

function formatKg(value: number | undefined | null) {
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))} kg`;
}

function formatTanggal(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status?: string) {
  switch (status?.toLowerCase()) {
    case "menunggu_konfirmasi":
      return "Menunggu Konfirmasi";
    case "diverifikasi":
      return "Diverifikasi";
    case "selesai":
      return "Selesai";
    case "ditolak":
      return "Ditolak";
    default:
      return status || "-";
  }
}

function getStatusClass(status?: string) {
  switch (status?.toLowerCase()) {
    case "selesai":
      return "bg-[#e4f1df] text-[#2e7d32]";
    case "diverifikasi":
      return "bg-[#dcebd7] text-[#205c29]";
    case "menunggu_konfirmasi":
      return "bg-[#f4f0df] text-[#8a7435]";
    case "ditolak":
      return "bg-[#f6e7e5] text-[#a04d45]";
    default:
      return "bg-[#f1f3ed] text-[#66716a]";
  }
}

export default function NasabahDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const token = getToken();
      const appKey = getAppKey();
      const storedUser = localStorage.getItem("user");
      const baseUrl = getBaseUrl();

      if (!token) {
        router.replace("/nasabah-login");
        return;
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          console.warn("Data user di localStorage tidak valid.");
        }
      }

      if (!appKey) {
        setError(
          "App Key belum ditemukan. Pastikan NEXT_PUBLIC_APP_KEY sudah diatur."
        );
        return;
      }

      if (!baseUrl) {
        setError(
          "NEXT_PUBLIC_API_URL atau NEXT_PUBLIC_BASE_API_URL belum ditemukan di .env.local."
        );
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/v1/dashboard/summary`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-app-key": appKey,
          },
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accesstoken");
        router.replace("/nasabah-login");
        return;
      }

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Response bukan JSON:", text);
        setError(
          `API tidak mengembalikan JSON. Status: ${response.status}.`
        );
        return;
      }

      const result: DashboardResponse = await response.json();
      console.log("Dashboard API:", result);

      if (response.status === 403) {
        setError(
          result.message ||
            "Akses dashboard ditolak. Pastikan token yang digunakan adalah token Nasabah."
        );
        return;
      }

      if (!response.ok || result.success === false) {
        setError(
          result.message ||
            `Gagal mengambil dashboard. Status: ${response.status}`
        );
        return;
      }

      if (result.data) {
        setDashboard(result.data);
      } else {
        setError("Data dashboard tidak tersedia dari API.");
      }
    } catch (err) {
      console.error("Gagal mengambil dashboard:", err);
      setError(
        "Tidak dapat terhubung ke server. Periksa koneksi API dan Base URL."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const namaNasabah =
    user?.name ||
    user?.fullName ||
    user?.nama ||
    user?.username ||
    "Nasabah";

  const saldoPoin = dashboard?.saldoPoin ?? 0;
  const totalPoinDidapat = dashboard?.totalPoinDiperoleh ?? 0;
  const jumlahPenukaran = dashboard?.totalPenukaranHadiah ?? 0;

  // API summary tidak menyediakan total berat khusus semua setoran selesai.
  // Untuk kartu "Sampah berhasil disetor", hitung hanya status selesai/diverifikasi.
  const totalSampahBerhasil =
    dashboard?.setorTerakhir?.reduce((total, item) => {
      const status = item.status?.toLowerCase();
      if (status === "selesai" || status === "diverifikasi") {
        return total + Number(item.totalBeratKg || 0);
      }
      return total;
    }, 0) ?? 0;

  const transaksiSetor = dashboard?.setorTerakhir?.[0] ?? null;
  const transaksiTukar = dashboard?.penukaranTerakhir?.[0] ?? null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f1df]">
            <RefreshCw
              className="h-5 w-5 animate-spin text-[#2e7d32]"
              strokeWidth={1.8}
            />
          </div>
          <p className="text-sm font-medium text-[#31443a]">
            Memuat dashboard...
          </p>
          <p className="mt-1 text-xs text-[#829087]">
            Mengambil data nasabah
          </p>
        </div>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[24px] border border-[#eadbd8] bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6e7e5]">
              <AlertCircle className="h-5 w-5 text-[#a04d45]" />
            </div>
            <h2 className="text-lg font-bold text-[#173c2b]">
              Dashboard tidak dapat dimuat
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#829087]">
              {error}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                onClick={() => fetchDashboard()}
                className="rounded-xl bg-[#2e7d32] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#205c29]"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => router.replace("/nasabah-login")}
                className="rounded-xl border border-[#dce5d8] bg-[#f4f8f1] px-5 py-2.5 text-xs font-semibold text-[#2e7d32]"
              >
                Kembali Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[12px] font-medium text-[#829087]">
              Selamat datang kembali
            </p>
            <h1 className="text-[24px] font-bold tracking-tight text-[#173c2b] sm:text-[28px]">
              Halo, {namaNasabah}
            </h1>
            <p className="mt-1 text-[13px] text-[#66716a]">
              Pantau poin dan aktivitas Bank Sampah kamu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5d8] bg-white text-[#2e7d32] transition hover:bg-[#f4f8f1] disabled:opacity-50"
              title="Refresh dashboard"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-[#e4f1df] sm:flex">
              <Leaf className="h-5 w-5 text-[#2e7d32]" />
            </div>
          </div>
        </div>

        {error && dashboard && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fffaf0] px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#9a7b39]" />
            <p className="flex-1 text-xs text-[#75633d]">{error}</p>
            <button
              onClick={() => fetchDashboard(true)}
              className="text-xs font-semibold text-[#2e7d32]"
            >
              Coba lagi
            </button>
          </div>
        )}

        <section className="mb-6">
          <div className="relative overflow-hidden rounded-[24px] bg-[#2e7d32] p-6 shadow-sm sm:p-7">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5" />
            <div className="absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-white/5" />
            <div className="absolute right-24 top-10 h-10 w-10 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Wallet className="h-[19px] w-[19px] text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white/80">
                      Saldo Poin Saat Ini
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/55">
                      Data dari dashboard nasabah
                    </p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-white/55" />
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[34px] font-bold tracking-tight text-white">
                    {formatNumber(saldoPoin)}
                  </p>
                  <p className="mt-1 text-[12px] text-white/70">
                    poin tersedia
                  </p>
                </div>

                <button
                  onClick={() => router.push("/nasabah/tukar-poin")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  Tukar Poin
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#173c2b]">
              Ringkasan Aktivitas
            </h2>
            <p className="mt-0.5 text-[11px] text-[#829087]">
              Ringkasan aktivitas akun kamu
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f1df]">
                  <Scale className="h-[18px] w-[18px] text-[#2e7d32]" />
                </div>
                <span className="text-[10px] font-medium text-[#9aa49d]">
                  TOTAL
                </span>
              </div>
              <p className="text-[24px] font-bold tracking-tight text-[#173c2b]">
                {formatKg(totalSampahBerhasil)}
              </p>
              <p className="mt-1 text-[11px] text-[#829087]">
                Sampah berhasil disetor
              </p>
            </div>

            <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f1]">
                  <Sparkles className="h-[18px] w-[18px] text-[#2e7d32]" />
                </div>
                <span className="text-[10px] font-medium text-[#9aa49d]">
                  DIDAPAT
                </span>
              </div>
              <p className="text-[24px] font-bold tracking-tight text-[#173c2b]">
                {formatNumber(totalPoinDidapat)}
              </p>
              <p className="mt-1 text-[11px] text-[#829087]">
                Total poin yang diperoleh
              </p>
            </div>

            <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f1]">
                  <Gift className="h-[18px] w-[18px] text-[#2e7d32]" />
                </div>
                <span className="text-[10px] font-medium text-[#9aa49d]">
                  PENUKARAN
                </span>
              </div>
              <p className="text-[24px] font-bold tracking-tight text-[#173c2b]">
                {formatNumber(jumlahPenukaran)}
              </p>
              <p className="mt-1 text-[11px] text-[#829087]">
                Total transaksi penukaran hadiah
              </p>
            </div>
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#173c2b]">
                Transaksi Terakhir
              </h2>
              <p className="mt-0.5 text-[11px] text-[#829087]">
                Aktivitas setor dan penukaran terbaru
              </p>
            </div>

            <button
              onClick={() => router.push("/nasabah/riwayat")}
              className="hidden items-center gap-1 text-[11px] font-semibold text-[#2e7d32] sm:flex"
            >
              Lihat semua
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f1df]">
                  <Recycle className="h-[18px] w-[18px] text-[#2e7d32]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#31443a]">
                    Setoran Terakhir
                  </p>
                  <p className="text-[10px] text-[#829087]">
                    Transaksi penyetoran sampah
                  </p>
                </div>
              </div>

              {transaksiSetor ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-[#173c2b]">
                      {transaksiSetor.kodeSetor || "-"}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusClass(
                        transaksiSetor.status
                      )}`}
                    >
                      {formatStatus(transaksiSetor.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f7f8f4] p-3">
                      <p className="text-[9px] text-[#9aa49d]">Tanggal</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#31443a]">
                        {formatTanggal(transaksiSetor.tanggal)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f7f8f4] p-3">
                      <p className="text-[9px] text-[#9aa49d]">Berat</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#31443a]">
                        {formatKg(transaksiSetor.totalBeratKg)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#edf0eb] pt-3">
                    <span className="text-[10px] text-[#829087]">
                      Poin transaksi
                    </span>
                    <span className="text-[13px] font-bold text-[#2e7d32]">
                      +{formatNumber(transaksiSetor.totalPoin)} poin
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-[#f7f8f4] px-4 py-6 text-center">
                  <p className="text-xs text-[#829087]">
                    Belum ada transaksi setoran.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f1]">
                  <Gift className="h-[18px] w-[18px] text-[#2e7d32]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#31443a]">
                    Penukaran Terakhir
                  </p>
                  <p className="text-[10px] text-[#829087]">
                    Transaksi penukaran poin
                  </p>
                </div>
              </div>

              {transaksiTukar ? (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-[#173c2b]">
                      {transaksiTukar.kodePenukaran || "-"}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusClass(
                        transaksiTukar.status
                      )}`}
                    >
                      {formatStatus(transaksiTukar.status)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#f7f8f4] p-3">
                    <p className="text-[9px] text-[#9aa49d]">Hadiah</p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-[#31443a]">
                      {transaksiTukar.hadiah?.namaHadiah || "-"}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-[#829087]">
                      {formatTanggal(transaksiTukar.tanggal)}
                    </span>
                    <span className="text-[13px] font-bold text-[#a04d45]">
                      -{formatNumber(transaksiTukar.poinTerpakai)} poin
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-[#f7f8f4] px-4 py-6 text-center">
                  <p className="text-xs text-[#829087]">
                    Belum ada transaksi penukaran.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/nasabah/riwayat")}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-[#dce5d8] bg-white py-2.5 text-[11px] font-semibold text-[#2e7d32] sm:hidden"
          >
            Lihat Riwayat
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </section>

        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#173c2b]">
              Aksi Cepat
            </h2>
            <p className="mt-0.5 text-[11px] text-[#829087]">
              Kelola aktivitas kamu
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => router.push("/nasabah/setor-sampah")}
              className="group flex items-center gap-4 rounded-[18px] border border-[#dce5d8] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#c5ddbf] hover:shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e4f1df]">
                <Recycle className="h-[21px] w-[21px] text-[#2e7d32]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#31443a]">
                  Setor Sampah
                </p>
                <p className="mt-0.5 text-[11px] text-[#829087]">
                  Ajukan penyetoran sampah
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#a3aaa3] transition group-hover:text-[#2e7d32]" />
            </button>

            <button
              onClick={() => router.push("/nasabah/tukar-poin")}
              className="group flex items-center gap-4 rounded-[18px] border border-[#dce5d8] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#c5ddbf] hover:shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f4f8f1]">
                <Gift className="h-[21px] w-[21px] text-[#2e7d32]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#31443a]">
                  Tukar Poin
                </p>
                <p className="mt-0.5 text-[11px] text-[#829087]">
                  Tukarkan poin dengan hadiah
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#a3aaa3] transition group-hover:text-[#2e7d32]" />
            </button>
          </div>
        </section>

        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#173c2b]">
              Informasi Akun
            </h2>
            <p className="mt-0.5 text-[11px] text-[#829087]">
              Informasi akun yang sedang digunakan
            </p>
          </div>

          <div className="rounded-[20px] border border-[#dce5d8] bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e4f1df]">
                <Leaf className="h-5 w-5 text-[#2e7d32]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#31443a]">
                  {namaNasabah}
                </p>
                <p className="mt-1 truncate text-[11px] text-[#829087]">
                  {user?.email || "Email belum tersedia"}
                </p>
                {user?.username && (
                  <p className="mt-0.5 text-[10px] text-[#a3aaa3]">
                    Username: {user.username}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push("/nasabah/profile")}
                className="hidden items-center gap-1 text-[11px] font-medium text-[#2e7d32] sm:flex"
              >
                Akun
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-[20px] border border-[#dcebd7] bg-[#e4f1df] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                <Recycle className="h-[19px] w-[19px] text-[#2e7d32]" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-[#173c2b]">
                  Punya sampah yang ingin disetor?
                </h3>
                <p className="mt-1 max-w-md text-[11px] leading-relaxed text-[#66716a]">
                  Yuk, setor sampahmu dan kumpulkan poin untuk ditukarkan
                  dengan hadiah.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/nasabah/setor-sampah")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#205c29] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Setor Sekarang
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
