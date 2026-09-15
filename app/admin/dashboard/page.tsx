"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalNasabah: number;
  totalKategoriSampah: number;
  totalTransaksiSetor: number;
  totalHadiah: number;
  totalBeratSampahKg: number;
  totalPoinTersalurkan: number;
}

interface ApiResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNasabah: 0,
    totalKategoriSampah: 0,
    totalTransaksiSetor: 0,
    totalHadiah: 0,
    totalBeratSampahKg: 0,
    totalPoinTersalurkan: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("accesstoken");

        const appKey = localStorage.getItem("appKey");

        if (!token) {
          window.location.replace("/admin/sign-in");
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          console.error("NEXT_PUBLIC_API_URL belum diatur");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${apiUrl}/api/v1/dashboard/stats`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              ...(appKey ? { "x-app-key": appKey } : {}),
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("accesstoken");
            localStorage.removeItem("appKey");
            localStorage.removeItem("user");
            localStorage.removeItem("role");

            window.location.replace("/admin/sign-in");
            return;
          }

          throw new Error(`HTTP Error ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Gagal mengambil data dashboard"
          );
        }

        setStats(
          result.data || {
            totalNasabah: 0,
            totalKategoriSampah: 0,
            totalTransaksiSetor: 0,
            totalHadiah: 0,
            totalBeratSampahKg: 0,
            totalPoinTersalurkan: 0,
          }
        );
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value || 0);
  };

  const formatKg = (value: number) => {
    return `${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(value || 0)} kg`;
  };

  return (
    <div className="min-h-screen bg-[#f5f1e9] text-[#173c2b]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1400px]">

          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#829087]">
              Admin
            </p>

            <h1 className="text-[27px] font-semibold tracking-tight text-[#173c2b]">
              Dashboard
            </h1>

            <p className="text-[13px] text-[#89928a]">
              Ringkasan data Bank Sampah
            </p>
          </div>

          {/* MAIN STATISTICS */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Nasabah"
              value={formatNumber(stats.totalNasabah)}
              description="Nasabah terdaftar"
              icon={<UsersIcon />}
              loading={loading}
            />

            <StatCard
              title="Kategori Sampah"
              value={formatNumber(stats.totalKategoriSampah)}
              description="Kategori tersedia"
              icon={<RecycleIcon />}
              loading={loading}
            />

            <StatCard
              title="Transaksi Setor"
              value={formatNumber(stats.totalTransaksiSetor)}
              description="Total transaksi"
              icon={<TransactionIcon />}
              loading={loading}
            />

            <StatCard
              title="Hadiah"
              value={formatNumber(stats.totalHadiah)}
              description="Hadiah tersedia"
              icon={<GiftIcon />}
              loading={loading}
            />

          </div>

          {/* DETAIL */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* BERAT SAMPAH */}
            <DetailCard
              label="Berat Sampah"
              value={
                loading
                  ? "..."
                  : formatKg(stats.totalBeratSampahKg)
              }
              description="Total berat sampah yang telah disetor oleh nasabah."
              icon={<WeightIcon />}
              iconClassName="bg-[#e5f0e2] text-[#2f8135]"
            />

            {/* POIN */}
            <DetailCard
              label="Poin Tersalurkan"
              value={
                loading
                  ? "..."
                  : `${formatNumber(stats.totalPoinTersalurkan)} poin`
              }
              description="Total poin yang telah diberikan kepada nasabah."
              icon={<PointIcon />}
              iconClassName="bg-[#f1e9d7] text-[#806b43]"
            />

          </div>

          {/* OVERVIEW */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7]">

            <div className="border-b border-[#ebe7dd] px-5 py-4 sm:px-6">
              <h2 className="text-[14px] font-semibold text-[#173c2b]">
                Ikhtisar
              </h2>

              <p className="mt-1 text-[11px] text-[#89928a]">
                Data utama Bank Sampah saat ini
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

              <OverviewItem
                label="Nasabah"
                value={formatNumber(stats.totalNasabah)}
                icon={<UsersIcon />}
                loading={loading}
              />

              <OverviewItem
                label="Kategori Sampah"
                value={formatNumber(stats.totalKategoriSampah)}
                icon={<RecycleIcon />}
                loading={loading}
              />

              <OverviewItem
                label="Transaksi Setor"
                value={formatNumber(stats.totalTransaksiSetor)}
                icon={<TransactionIcon />}
                loading={loading}
              />

              <OverviewItem
                label="Hadiah"
                value={formatNumber(stats.totalHadiah)}
                icon={<GiftIcon />}
                loading={loading}
              />

              <OverviewItem
                label="Berat Sampah"
                value={formatKg(stats.totalBeratSampahKg)}
                icon={<WeightIcon />}
                loading={loading}
              />

              <OverviewItem
                label="Poin Tersalurkan"
                value={formatNumber(stats.totalPoinTersalurkan)}
                icon={<PointIcon />}
                loading={loading}
              />

            </div>
          </div>

          {/* FOOTER */}
          <div className="py-7 text-center">
            <p className="text-[10px] text-[#a3aaa3]">
              © {new Date().getFullYear()} Bank Sampah
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7] p-5 transition-all duration-200 hover:border-[#d8d2c6] hover:shadow-[0_8px_25px_rgba(23,60,43,0.05)]">

      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f0e2] text-[#2f8135]">
        {icon}
      </div>

      <p className="text-[12px] font-medium text-[#89928a]">
        {title}
      </p>

      {loading ? (
        <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-[#e8e8e1]" />
      ) : (
        <h3 className="mt-1 text-[25px] font-semibold tracking-tight text-[#173c2b]">
          {value}
        </h3>
      )}

      <p className="mt-1.5 text-[11px] text-[#a3aaa3]">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  label,
  value,
  description,
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e0d5] bg-[#fbfaf7] p-5 sm:p-6">

      <div className="flex items-start justify-between gap-5">

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#a3aaa3]">
            {label}
          </p>

          <h3 className="mt-2 text-[26px] font-semibold tracking-tight text-[#173c2b]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>

      </div>

      <div className="mt-5 border-t border-[#ebe7dd] pt-4">
        <p className="text-[11px] leading-5 text-[#89928a]">
          {description}
        </p>
      </div>

    </div>
  );
}


/* =========================================================
   OVERVIEW ITEM
========================================================= */

function OverviewItem({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#ebe7dd] p-4 last:border-b-0 sm:nth-[2n]:border-b-0 lg:border-b lg:nth-[3n]:border-b-0">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e5f0e2] text-[#2f8135]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] text-[#a3aaa3]">
          {label}
        </p>

        {loading ? (
          <div className="mt-1 h-4 w-16 animate-pulse rounded bg-[#e8e8e1]" />
        ) : (
          <p className="truncate text-[13px] font-semibold text-[#173c2b]">
            {value}
          </p>
        )}
      </div>

    </div>
  );
}


/* =========================================================
   ICONS
========================================================= */

function UsersIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}


function RecycleIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 19-2-3.5 2.5-1.5" />
      <path d="M5 15.5h6" />
      <path d="m17 5 2 3.5-2.5 1.5" />
      <path d="M19 8.5h-6" />
      <path d="m8 5 4-2 1 3" />
      <path d="M12 3 8.5 9" />
      <path d="m16 19-4 2-1-3" />
      <path d="m12 21 3.5-6" />
    </svg>
  );
}


function TransactionIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h18" />
      <path d="M7 8l-4 4 4 4" />
      <path d="M17 8l4 4-4 4" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
    </svg>
  );
}


function GiftIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M12 8H7.5a2.5 2.5 0 1 1 2.5-2.5C10 7 12 8 12 8Z" />
      <path d="M12 8h4.5A2.5 2.5 0 1 0 14 5.5C14 7 12 8 12 8Z" />
    </svg>
  );
}


function WeightIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 20h12" />
      <path d="M8 20 10 8h4l2 12" />
      <path d="M9 8h6" />
      <path d="M12 4v4" />
      <path d="M10 4h4" />
      <path d="M8 20h8" />
    </svg>
  );
}


function PointIcon({
  className = "h-5 w-5",
  strokeWidth = 1.8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9 9.5c0-1 1-1.5 3-1.5s3 .5 3 1.5-1 1.5-3 1.5-3 .5-3 1.5 1 1.5 3 1.5 3-.5 3-1.5" />
    </svg>
  );
}