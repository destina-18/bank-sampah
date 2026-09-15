"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  History,
  Leaf,
  Plus,
  Recycle,
  Sparkles,
  Wallet,
} from "lucide-react";

type UserData = {
  id?: string | number;
  username?: string;
  name?: string;
  fullName?: string;
  nama?: string;
  email?: string;
};

export default function NasabahDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // AMBIL DATA USER DARI HASIL LOGIN
  // ==========================================

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.replace("/nasabah-login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Gagal membaca data nasabah:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.replace("/nasabah-login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#e5f0e2] border-t-[#2f8135]" />

          <p className="text-sm text-[#829087]">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // NAMA NASABAH
  // ==========================================

  const namaNasabah =
    user?.name ||
    user?.fullName ||
    user?.nama ||
    user?.username ||
    "Nasabah";

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="mb-1 text-[12px] font-medium text-[#829087]">
              Selamat datang kembali 👋
            </p>

            <h1 className="text-[24px] font-bold tracking-tight text-[#173c2b] sm:text-[28px]">
              Halo, {namaNasabah}
            </h1>

            <p className="mt-1 text-[13px] text-[#66716a]">
              Selamat datang di halaman nasabah Bank Sampah.
            </p>
          </div>

          <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#e5f0e2] sm:flex">
            <Leaf
              className="h-5 w-5 text-[#2f8135]"
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* ======================================
            SALDO / POIN
        ====================================== */}

        <section className="mb-6">
          <div className="relative overflow-hidden rounded-[22px] bg-[#2f8135] p-6 shadow-sm sm:p-7">

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />

            <div className="absolute -bottom-16 right-20 h-36 w-36 rounded-full bg-white/5" />

            <div className="relative z-10">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Wallet
                      className="h-[18px] w-[18px] text-white"
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="text-[12px] font-medium text-white/80">
                    Saldo Poin
                  </span>
                </div>

                <Sparkles
                  className="h-5 w-5 text-white/60"
                  strokeWidth={1.7}
                />

              </div>

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p className="text-[26px] font-semibold tracking-tight text-white">
                    Lihat saldo poin
                  </p>

                  <p className="mt-1 text-[12px] text-white/70">
                    Informasi poin nasabah
                  </p>
                </div>

                <button
                  onClick={() => router.push("/nasabah/profile")}
                  className="hidden items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-white/15 sm:flex"
                >
                  Lihat akun

                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

              </div>

            </div>
          </div>
        </section>

        {/* ======================================
            AKSI CEPAT
        ====================================== */}

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

            {/* SETOR SAMPAH */}

            <button
              onClick={() =>
                router.push("/nasabah/setor-sampah")
              }
              className="group flex items-center gap-4 rounded-[18px] border border-[#e5e0d5] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#cbdcc8] hover:shadow-sm"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e5f0e2]">
                <Recycle
                  className="h-[21px] w-[21px] text-[#2f8135]"
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[13px] font-semibold text-[#31443a]">
                  Setor Sampah
                </p>

                <p className="mt-0.5 text-[11px] text-[#829087]">
                  Ajukan penyetoran sampah
                </p>

              </div>

              <ChevronRight
                className="h-4 w-4 text-[#a3aaa3] transition group-hover:translate-x-0.5 group-hover:text-[#2f8135]"
                strokeWidth={1.8}
              />

            </button>

            {/* RIWAYAT */}

            <button
              onClick={() =>
                router.push("/nasabah/riwayat")
              }
              className="group flex items-center gap-4 rounded-[18px] border border-[#e5e0d5] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#cbdcc8] hover:shadow-sm"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f1f3ed]">
                <History
                  className="h-[21px] w-[21px] text-[#66716a]"
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-[13px] font-semibold text-[#31443a]">
                  Riwayat Setoran
                </p>

                <p className="mt-0.5 text-[11px] text-[#829087]">
                  Lihat aktivitas penyetoran
                </p>

              </div>

              <ChevronRight
                className="h-4 w-4 text-[#a3aaa3] transition group-hover:translate-x-0.5 group-hover:text-[#2f8135]"
                strokeWidth={1.8}
              />

            </button>

          </div>
        </section>

        {/* ======================================
            INFORMASI AKUN
        ====================================== */}

        <section className="mb-7">

          <div className="mb-4">

            <h2 className="text-[16px] font-bold text-[#173c2b]">
              Informasi Akun
            </h2>

            <p className="mt-0.5 text-[11px] text-[#829087]">
              Informasi akun yang sedang digunakan
            </p>

          </div>

          <div className="rounded-[20px] border border-[#e5e0d5] bg-white p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f0e2]">
                <Leaf
                  className="h-5 w-5 text-[#2f8135]"
                  strokeWidth={1.8}
                />
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
                onClick={() =>
                  router.push("/nasabah/profile")
                }
                className="hidden items-center gap-1 text-[11px] font-medium text-[#2f8135] sm:flex"
              >
                Akun

                <ChevronRight className="h-3.5 w-3.5" />
              </button>

            </div>

          </div>
        </section>

        {/* ======================================
            CTA
        ====================================== */}

        <section className="mb-5 overflow-hidden rounded-[20px] border border-[#dce8d9] bg-[#e5f0e2] p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                <Recycle
                  className="h-[19px] w-[19px] text-[#2f8135]"
                  strokeWidth={1.8}
                />
              </div>

              <div>

                <h3 className="text-[13px] font-bold text-[#173c2b]">
                  Punya sampah yang ingin disetor?
                </h3>

                <p className="mt-1 max-w-md text-[11px] leading-relaxed text-[#66716a]">
                  Yuk, setor sampahmu dan ikut berkontribusi
                  menjaga lingkungan.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                router.push("/nasabah/setor-sampah")
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#276d2c] sm:w-auto"
            >
              <Plus
                className="h-4 w-4"
                strokeWidth={2}
              />

              Setor Sekarang
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}