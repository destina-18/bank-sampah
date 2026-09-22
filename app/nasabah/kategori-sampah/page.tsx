"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Recycle,
  Coins,
  Banknote,
  AlertCircle,
  PackageOpen,
  Filter,
} from "lucide-react";

type KategoriSampah = {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string | null;
};

const JENIS_OPTIONS = [
  { value: "semua", label: "Semua Jenis" },
  { value: "plastik", label: "Plastik" },
  { value: "kertas", label: "Kertas" },
  { value: "logam", label: "Logam" },
  { value: "kaca", label: "Kaca" },
];

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

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/+$/, "");
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function getJenisStyle(jenis: string) {
  switch (jenis?.toLowerCase()) {
    case "plastik":
      return {
        badge:
          "bg-[#EEF7EA] text-[#2A7C13] border-[#D4E8CE]",
        icon:
          "bg-[#E5F3DF] text-[#2A7C13]",
      };

    case "kertas":
      return {
        badge:
          "bg-[#FFF8CF] text-[#806D25] border-[#F0DFA2]",
        icon:
          "bg-[#FFF8CF] text-[#806D25]",
      };

    case "logam":
      return {
        badge:
          "bg-[#F8FAF5] text-[#5E6B5A] border-[#DDE8D8]",
        icon:
          "bg-[#EEF7EA] text-[#5E6B5A]",
      };

    case "kaca":
      return {
        badge:
          "bg-[#EEF7EA] text-[#3D7040] border-[#D4E8CE]",
        icon:
          "bg-[#E5F3DF] text-[#477746]",
      };

    default:
      return {
        badge:
          "bg-[#FBE6C2] text-[#7C6338] border-[#F0DDBB]",
        icon:
          "bg-[#FBE6C2] text-[#80663A]",
      };
  }
}

export default function KategoriSampahPage() {
  const [data, setData] = useState<KategoriSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("semua");

  async function fetchKategori() {
    try {
      setLoading(true);
      setError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur di .env.local"
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/kategori-sampah`,
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

      const contentType =
        response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid (${response.status}).`
        );
      }

      const result = await response.json();

      console.log(
        "KATEGORI SAMPAH:",
        result
      );

      if (!response.ok || !result?.success) {
        let message =
          result?.message ||
          "Gagal mengambil kategori sampah.";

        if (Array.isArray(message)) {
          message = message.join(", ");
        }

        throw new Error(message);
      }

      setData(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH KATEGORI ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data kategori sampah."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKategori();
  }, []);

  const filteredData = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.namaKategori
          .toLowerCase()
          .includes(keyword) ||
        item.jenis
          .toLowerCase()
          .includes(keyword);

      const matchJenis =
        jenis === "semua" ||
        item.jenis.toLowerCase() ===
          jenis.toLowerCase();

      return matchSearch && matchJenis;
    });
  }, [data, search, jenis]);

  const totalJenis = data.length;

  const totalPoin = data.reduce(
    (total, item) =>
      total + Number(item.poinPerKg || 0),
    0
  );

  const resetFilter = () => {
    setSearch("");
    setJenis("semua");
  };

  return (
    <main className="min-h-screen bg-[#F8FAF5] px-5 py-7 text-[#243321] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#71806D]">
            <Recycle size={16} />
            <span>Nasabah</span>
            <span>/</span>
            <span>Kategori Sampah</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#243321] md:text-3xl">
                Kategori Sampah
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#71806D]">
                Lihat jenis sampah yang dapat
                disetorkan beserta harga dan
                poin yang kamu dapatkan.
              </p>
            </div>

            {/* JUMLAH KATEGORI */}
            <div className="flex items-center gap-2 rounded-xl border border-[#DDE8D8] bg-white px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF7EA] text-[#2A7C13]">
                <PackageOpen size={18} />
              </div>

              <div>
                <p className="text-[11px] text-[#71806D]">
                  Jenis tersedia
                </p>

                <p className="text-sm font-semibold text-[#243321]">
                  {totalJenis} kategori
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">

          {/* HARGA */}
          <div className="rounded-2xl border border-[#DDE8D8] bg-white p-5 shadow-[0_5px_22px_rgba(42,124,19,0.04)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBE6C2] text-[#80663A]">
                <Banknote size={20} />
              </div>

              <div>
                <p className="text-xs text-[#71806D]">
                  Harga sesuai kategori
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#243321]">
                  Dihitung per kilogram
                </p>
              </div>
            </div>
          </div>

          {/* POIN */}
          <div className="rounded-2xl border border-[#DDE8D8] bg-white p-5 shadow-[0_5px_22px_rgba(42,124,19,0.04)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF8CF] text-[#806D25]">
                <Coins size={20} />
              </div>

              <div>
                <p className="text-xs text-[#71806D]">
                  Total nilai poin kategori
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#243321]">
                  {formatNumber(totalPoin)} poin/kg
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* FILTER */}
        <section className="mb-6 rounded-2xl border border-[#DDE8D8] bg-white p-4 shadow-[0_5px_22px_rgba(42,124,19,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            {/* SEARCH */}
            <div className="relative w-full md:max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71806D]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari jenis sampah..."
                className="h-11 w-full rounded-xl border border-[#DDE8D8] bg-[#F8FAF5] pl-10 pr-4 text-sm text-[#243321] outline-none transition placeholder:text-[#9BA69A] focus:border-[#76C457] focus:bg-white focus:ring-2 focus:ring-[#76C457]/10"
              />
            </div>

            {/* JENIS */}
            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71806D]"
              />

              <select
                value={jenis}
                onChange={(e) =>
                  setJenis(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-[#DDE8D8] bg-[#F8FAF5] pl-9 pr-10 text-sm text-[#4D5A49] outline-none focus:border-[#76C457] focus:ring-2 focus:ring-[#76C457]/10 md:w-52"
              >
                {JENIS_OPTIONS.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E9C9C2] bg-[#FFF4F1] p-4 text-sm text-[#A55E52]">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Data tidak dapat dimuat
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchKategori}
                className="mt-3 font-medium underline underline-offset-2"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#DDE8D8] bg-white"
                >
                  <div className="h-48 animate-pulse bg-[#EEF7EA]" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEF7EA]" />

                    <div className="h-4 w-1/3 animate-pulse rounded bg-[#EEF7EA]" />

                    <div className="h-16 animate-pulse rounded-xl bg-[#EEF7EA]" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : filteredData.length === 0 ? (

          /* EMPTY */
          <div className="rounded-2xl border border-[#DDE8D8] bg-white px-6 py-16 text-center shadow-[0_5px_22px_rgba(42,124,19,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBE6C2] text-[#80663A]">
              <PackageOpen size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-[#3B4937]">
              Kategori tidak ditemukan
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#71806D]">
              Coba ubah kata pencarian
              atau filter jenis sampah.
            </p>

            {(search || jenis !== "semua") && (
              <button
                type="button"
                onClick={resetFilter}
                className="mt-4 rounded-xl bg-[#2A7C13] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#236A10]"
              >
                Reset Filter
              </button>
            )}
          </div>

        ) : (

          /* CARDS */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((item) => {
              const style =
                getJenisStyle(item.jenis);

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#DDE8D8] bg-white shadow-[0_5px_22px_rgba(42,124,19,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(42,124,19,0.08)]"
                >

                  {/* FOTO */}
                  <div className="relative h-48 overflow-hidden bg-[#EEF7EA]">
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={item.namaKategori}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EEF7EA] text-[#2A7C13]">
                        <Recycle
                          size={45}
                          strokeWidth={1.4}
                        />
                      </div>
                    )}

                    {/* BADGE */}
                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize ${style.badge}`}
                      >
                        {item.jenis}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <h2 className="min-h-[48px] text-[17px] font-semibold leading-6 text-[#243321]">
                      {item.namaKategori}
                    </h2>

                    <p className="mt-1 text-xs text-[#71806D]">
                      Nilai berdasarkan setiap
                      1 kilogram
                    </p>

                    {/* HARGA + POIN */}
                    <div className="mt-5 grid grid-cols-2 gap-3">

                      {/* HARGA */}
                      <div className="rounded-xl border border-[#F0DDBB] bg-[#FFF4DF] p-3.5">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBE6C2] text-[#80663A]">
                            <Banknote size={14} />
                          </div>

                          <span className="text-[11px] text-[#80663A]">
                            Harga
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-[#51462F]">
                          {formatRupiah(
                            item.hargaPerKg
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#8E8067]">
                          / kg
                        </p>
                      </div>

                      {/* POIN */}
                      <div className="rounded-xl border border-[#D4E8CE] bg-[#EEF7EA] p-3.5">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E5F3DF] text-[#2A7C13]">
                            <Coins size={14} />
                          </div>

                          <span className="text-[11px] text-[#2A7C13]">
                            Poin
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-[#2A7C13]">
                          {formatNumber(
                            item.poinPerKg
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#5E6F59]">
                          poin / kg
                        </p>
                      </div>

                    </div>

                    {/* INFO */}
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#F8FAF5] px-3.5 py-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.icon}`}
                      >
                        <Recycle size={14} />
                      </div>

                      <p className="text-xs leading-5 text-[#5E6F59]">
                        Setorkan sampah sesuai
                        kategori untuk
                        mendapatkan poin.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* FOOTER NOTE */}
        {!loading &&
          filteredData.length > 0 && (
            <div className="mt-7 rounded-2xl border border-[#DDE8D8] bg-white px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF7EA] text-[#2A7C13]">
                  <Recycle size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#3B4937]">
                    Informasi
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[#71806D]">
                    Harga dan poin yang
                    ditampilkan mengikuti data
                    kategori sampah yang
                    tersedia di Bank Sampah.
                  </p>
                </div>
              </div>
            </div>
          )}

      </div>
    </main>
  );
}