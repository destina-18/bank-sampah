"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Recycle,
  Coins,
  Banknote,
  Loader2,
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
  {
    value: "semua",
    label: "Semua Jenis",
  },
  {
    value: "plastik",
    label: "Plastik",
  },
  {
    value: "kertas",
    label: "Kertas",
  },
  {
    value: "logam",
    label: "Logam",
  },
  {
    value: "kaca",
    label: "Kaca",
  },
];

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
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
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(
    value || 0
  );
}

function getJenisStyle(jenis: string) {
  switch (jenis?.toLowerCase()) {
    case "plastik":
      return {
        badge:
          "bg-[#e8f2e6] text-[#4f7045] border-[#d2e2cd]",
        icon: "bg-[#edf5ea] text-[#5c7a53]",
      };

    case "kertas":
      return {
        badge:
          "bg-[#f5eee1] text-[#8a6d45] border-[#e7dbc7]",
        icon: "bg-[#f8f2e8] text-[#95784e]",
      };

    case "logam":
      return {
        badge:
          "bg-[#eceeea] text-[#687269] border-[#dce0da]",
        icon: "bg-[#f0f2ef] text-[#737c75]",
      };

    case "kaca":
      return {
        badge:
          "bg-[#e7f0ef] text-[#4f7470] border-[#d0e0de]",
        icon: "bg-[#edf5f4] text-[#5d807c]",
      };

    default:
      return {
        badge:
          "bg-[#f0ece7] text-[#716a62] border-[#e2dbd2]",
        icon: "bg-[#f5f1eb] text-[#777067]",
      };
  }
}

export default function KategoriSampahPage() {
  const [data, setData] = useState<
    KategoriSampah[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [jenis, setJenis] =
    useState("semua");

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
            "Content-Type":
              "application/json",
            "x-app-key": getAppKey(),
            Authorization: `Bearer ${getToken()}`,
          },
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        const text =
          await response.text();

        console.error(
          "Response bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid (${response.status}).`
        );
      }

      const result =
        await response.json();

      console.log(
        "KATEGORI SAMPAH:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        let message =
          result?.message ||
          "Gagal mengambil kategori sampah.";

        if (
          Array.isArray(message)
        ) {
          message =
            message.join(", ");
        }

        throw new Error(message);
      }

      /*
       * API:
       * {
       *   success: true,
       *   data: [...]
       * }
       */
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

      return (
        matchSearch && matchJenis
      );
    });
  }, [data, search, jenis]);

  const totalJenis = data.length;

  const totalPoin = data.reduce(
    (total, item) =>
      total + Number(item.poinPerKg || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277]">
            <Recycle size={16} />

            <span>Nasabah</span>

            <span>/</span>

            <span>
              Kategori Sampah
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
                Kategori Sampah
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8c847a]">
                Lihat jenis sampah yang
                dapat disetorkan beserta
                harga dan poin yang kamu
                dapatkan.
              </p>
            </div>

            {/* INFO JUMLAH */}
            <div className="flex items-center gap-2 rounded-xl border border-[#e4ddd3] bg-[#fffdf9] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f2e6] text-[#5c7a53]">
                <PackageOpen
                  size={18}
                />
              </div>

              <div>
                <p className="text-[11px] text-[#968d82]">
                  Jenis tersedia
                </p>

                <p className="text-sm font-semibold text-[#403c36]">
                  {totalJenis} kategori
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            INFO CARDS
        ====================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* HARGA */}
          <div className="rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4eadc] text-[#98754d]">
                <Banknote size={20} />
              </div>

              <div>
                <p className="text-xs text-[#948b80]">
                  Harga sesuai kategori
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#403c36]">
                  Dihitung per kilogram
                </p>
              </div>
            </div>
          </div>

          {/* POIN */}
          <div className="rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] p-5 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f2e6] text-[#5c7a53]">
                <Coins size={20} />
              </div>

              <div>
                <p className="text-xs text-[#948b80]">
                  Total nilai poin kategori
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#403c36]">
                  {formatNumber(
                    totalPoin
                  )}{" "}
                  poin/kg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            FILTER
        ====================================== */}

        <section className="mb-6 rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] p-4 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* SEARCH */}

            <div className="relative w-full md:max-w-md">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a29a8f]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Cari jenis sampah..."
                className="h-11 w-full rounded-xl border border-[#e4ddd3] bg-[#faf7f2] pl-10 pr-4 text-sm text-[#403c36] outline-none transition placeholder:text-[#aaa196] focus:border-[#a8b69e] focus:bg-white"
              />
            </div>

            {/* JENIS */}

            <div className="relative">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958c81]"
              />

              <select
                value={jenis}
                onChange={(e) =>
                  setJenis(
                    e.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-[#e4ddd3] bg-[#faf7f2] pl-9 pr-10 text-sm text-[#5d574f] outline-none focus:border-[#a8b69e] md:w-52"
              >
                {JENIS_OPTIONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a55e52]">
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
                onClick={
                  fetchKategori
                }
                className="mt-3 font-medium underline underline-offset-2"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            LOADING
        ====================================== */}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#e7dfd5] bg-[#fffdf9]"
              >
                <div className="h-48 animate-pulse bg-[#eee9e1]" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#eee9e1]" />

                  <div className="h-4 w-1/3 animate-pulse rounded bg-[#eee9e1]" />

                  <div className="h-16 animate-pulse rounded-xl bg-[#eee9e1]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          /* =====================================
             EMPTY
          ====================================== */

          <div className="rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] px-6 py-16 text-center shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eee9e1] text-[#91887d]">
              <PackageOpen
                size={28}
              />
            </div>

            <h3 className="mt-4 font-semibold text-[#504a42]">
              Kategori tidak ditemukan
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#958c81]">
              Coba ubah kata pencarian
              atau filter jenis sampah.
            </p>

            {(search ||
              jenis !== "semua") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setJenis("semua");
                }}
                className="mt-4 rounded-xl bg-[#718467] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#607456]"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          /* =====================================
             CARDS
          ====================================== */

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.map(
              (item) => {
                const style =
                  getJenisStyle(
                    item.jenis
                  );

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(86,72,52,0.08)]"
                  >
                    {/* FOTO */}

                    <div className="relative h-48 overflow-hidden bg-[#eee9e1]">
                      {item.foto ? (
                        <img
                          src={
                            item.foto
                          }
                          alt={
                            item.namaKategori
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#eef2ea] text-[#7c8c75]">
                          <Recycle
                            size={45}
                            strokeWidth={
                              1.4
                            }
                          />
                        </div>
                      )}

                      {/* BADGE JENIS */}

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
                      <h2 className="min-h-[48px] text-[17px] font-semibold leading-6 text-[#403c36]">
                        {
                          item.namaKategori
                        }
                      </h2>

                      <p className="mt-1 text-xs text-[#978e83]">
                        Nilai berdasarkan
                        setiap 1 kilogram
                      </p>

                      {/* HARGA */}

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[#e7dfd5] bg-[#faf7f2] p-3.5">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f2e9dc] text-[#96754e]">
                              <Banknote
                                size={14}
                              />
                            </div>

                            <span className="text-[11px] text-[#948b80]">
                              Harga
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-[#514b43]">
                            {formatRupiah(
                              item.hargaPerKg
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#a0988d]">
                            / kg
                          </p>
                        </div>

                        {/* POIN */}

                        <div className="rounded-xl border border-[#dce6d8] bg-[#f1f5ef] p-3.5">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e2ecde] text-[#5c7653]">
                              <Coins
                                size={14}
                              />
                            </div>

                            <span className="text-[11px] text-[#778473]">
                              Poin
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-[#526b4b]">
                            {formatNumber(
                              item.poinPerKg
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#8a9685]">
                            poin / kg
                          </p>
                        </div>
                      </div>

                      {/* INFO */}

                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f5f2eb] px-3.5 py-3">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.icon}`}
                        >
                          <Recycle
                            size={14}
                          />
                        </div>

                        <p className="text-xs leading-5 text-[#777067]">
                          Setorkan sampah
                          sesuai kategori
                          untuk mendapatkan
                          poin.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* =====================================
            FOOTER NOTE
        ====================================== */}

        {!loading &&
          filteredData.length >
            0 && (
            <div className="mt-7 rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8f2e6] text-[#5c7a53]">
                  <Recycle
                    size={15}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#625b52]">
                    Informasi
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-[#948b80]">
                    Harga dan poin yang
                    ditampilkan mengikuti
                    data kategori sampah
                    yang tersedia di Bank
                    Sampah.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </main>
  );
}