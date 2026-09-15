"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Coins,
  Search,
  History,
  CheckCircle2,
  Clock3,
  XCircle,
  Package,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type Hadiah = {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string | null;
};

type Penukaran = {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  poinTerpakai: number;
  status: string;
  hadiah?: {
    namaHadiah: string;
    poinDibutuhkan?: number;
  };
};

type DashboardSummary = {
  saldoPoinSaatIni: number;
  totalPoinDidapat?: number;
  totalPoinDitukar?: number;
};

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");
}

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case "diproses":
      return "Diproses";

    case "selesai":
      return "Selesai";

    case "ditolak":
      return "Ditolak";

    case "dibatalkan":
      return "Dibatalkan";

    default:
      return status || "-";
  }
}

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "selesai":
      return {
        className:
          "border-[#d2e3cf] bg-[#edf5ea] text-[#52734a]",
        icon: CheckCircle2,
      };

    case "diproses":
      return {
        className:
          "border-[#eadcbc] bg-[#faf3df] text-[#8a6d3f]",
        icon: Clock3,
      };

    case "ditolak":
    case "dibatalkan":
      return {
        className:
          "border-[#e7ceca] bg-[#faefed] text-[#a15e55]",
        icon: XCircle,
      };

    default:
      return {
        className:
          "border-[#e3ddd4] bg-[#f5f2ed] text-[#756e64]",
        icon: Clock3,
      };
  }
}

export default function TukarPoinPage() {
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [riwayat, setRiwayat] = useState<Penukaran[]>([]);

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loadingHadiah, setLoadingHadiah] =
    useState(true);

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  const [loadingRiwayat, setLoadingRiwayat] =
    useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedHadiah, setSelectedHadiah] =
    useState<Hadiah | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [showHistory, setShowHistory] =
    useState(false);

  // ==========================================
  // HEADER FETCH
  // ==========================================

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-app-key": getAppKey(),
      Authorization: `Bearer ${getToken()}`,
    };
  }

  // ==========================================
  // FETCH KATALOG HADIAH
  // ==========================================

  async function fetchHadiah() {
    try {
      setLoadingHadiah(true);
      setError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/hadiah`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response server tidak valid (${response.status}).`
        );
      }

      const result = await response.json();

      console.log(
        "KATALOG HADIAH:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil katalog hadiah."
        );
      }

      setHadiah(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH HADIAH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil katalog hadiah."
      );
    } finally {
      setLoadingHadiah(false);
    }
  }

  // ==========================================
  // FETCH SALDO POIN
  // ==========================================

  async function fetchSummary() {
    try {
      setLoadingSummary(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/v1/dashboard/summary`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Response summary bukan JSON."
        );
      }

      const result = await response.json();

      console.log(
        "DASHBOARD SUMMARY:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil saldo poin."
        );
      }

      setSummary(
        result.data || null
      );
    } catch (err) {
      console.error(
        "FETCH SUMMARY ERROR:",
        err
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  // ==========================================
  // FETCH RIWAYAT PENUKARAN
  // ==========================================

  async function fetchRiwayat() {
    try {
      setLoadingRiwayat(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/my-penukaran`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "Response riwayat bukan JSON."
        );
      }

      const result = await response.json();

      console.log(
        "RIWAYAT PENUKARAN:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil riwayat penukaran."
        );
      }

      setRiwayat(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH RIWAYAT ERROR:",
        err
      );
    } finally {
      setLoadingRiwayat(false);
    }
  }

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchHadiah();
    fetchSummary();
    fetchRiwayat();
  }, []);

  // ==========================================
  // FILTER HADIAH
  // ==========================================

  const filteredHadiah = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    if (!keyword) {
      return hadiah;
    }

    return hadiah.filter((item) =>
      item.namaHadiah
        .toLowerCase()
        .includes(keyword)
    );
  }, [hadiah, search]);

  const saldoPoin =
    Number(
      summary?.saldoPoinSaatIni || 0
    );

  // ==========================================
  // BUKA MODAL
  // ==========================================

  function handleSelectHadiah(
    item: Hadiah
  ) {
    setActionError("");
    setSuccessMessage("");

    setSelectedHadiah(item);
    setShowModal(true);
  }

  // ==========================================
  // TUTUP MODAL
  // ==========================================

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setShowModal(false);
    setSelectedHadiah(null);
    setActionError("");
  }

  // ==========================================
  // TUKAR POIN
  // ==========================================

  async function handleTukar() {
    if (!selectedHadiah) {
      return;
    }

    const hadiah = selectedHadiah;

    // Cek stok
    if (hadiah.stok <= 0) {
      setActionError(
        "Hadiah ini sedang habis."
      );
      return;
    }

    // Cek saldo
    if (
      saldoPoin <
      hadiah.poinDibutuhkan
    ) {
      setActionError(
        `Poin kamu belum cukup. Kamu membutuhkan ${formatNumber(
          hadiah.poinDibutuhkan
        )} poin, sedangkan saldo kamu ${formatNumber(
          saldoPoin
        )} poin.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/tukar`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            hadiahId: hadiah.id,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response server tidak valid (${response.status}).`
        );
      }

      const result = await response.json();

      console.log(
        "HASIL TUKAR POIN:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Penukaran poin gagal."
        );
      }

      const data = result.data;

      setSuccessMessage(
        `Penukaran berhasil diajukan. Kode transaksi: ${
          data?.kodePenukaran || "-"
        }`
      );

      setShowModal(false);
      setSelectedHadiah(null);

      // Refresh saldo, katalog, dan riwayat
      await Promise.all([
        fetchSummary(),
        fetchHadiah(),
        fetchRiwayat(),
      ]);
    } catch (err) {
      console.error(
        "TUKAR POIN ERROR:",
        err
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Penukaran poin gagal."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277]">
            <Gift size={16} />

            <span>Nasabah</span>

            <span>/</span>

            <span>Tukar Poin</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
                Tukar Poin
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8c847a]">
                Gunakan poin yang kamu
                kumpulkan untuk mendapatkan
                hadiah atau voucher yang
                tersedia.
              </p>
            </div>

            {/* RIWAYAT BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowHistory(
                  !showHistory
                )
              }
              className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                showHistory
                  ? "border-[#cfdcc9] bg-[#e8f2e6] text-[#4f7048]"
                  : "border-[#e3ddd4] bg-[#fffdf9] text-[#696157] hover:bg-[#f5f2ec]"
              }`}
            >
              <History size={17} />

              <span>
                Riwayat Penukaran
              </span>
            </button>
          </div>
        </div>

        {/* ======================================
            SALDO POIN
        ====================================== */}

        <section className="mb-7 overflow-hidden rounded-2xl border border-[#dce6d8] bg-[#edf4ea]">
          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dbe9d6] text-[#56744e]">
                <Coins
                  size={27}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <p className="text-xs font-medium text-[#73826d]">
                  Saldo Poin Kamu
                </p>

                {loadingSummary ? (
                  <div className="mt-2 h-8 w-28 animate-pulse rounded-lg bg-[#dce7d8]" />
                ) : (
                  <p className="mt-0.5 text-2xl font-semibold tracking-tight text-[#405a3b]">
                    {formatNumber(
                      saldoPoin
                    )}{" "}
                    <span className="text-sm font-medium">
                      poin
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#d9e4d5] bg-white/60 px-4 py-3">
              <p className="text-[11px] text-[#84917e]">
                Poin yang telah ditukar
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[#53674e]">
                {formatNumber(
                  summary?.totalPoinDitukar ||
                    0
                )}{" "}
                poin
              </p>
            </div>
          </div>
        </section>

        {/* ======================================
            SUCCESS MESSAGE
        ====================================== */}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#cfe0cb] bg-[#edf6eb] p-4 text-sm text-[#52744b]">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Penukaran berhasil
              </p>

              <p className="mt-1">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="text-xs font-medium text-[#52744b] underline underline-offset-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a15e55]">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Katalog hadiah tidak dapat
                dimuat
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchHadiah}
                className="mt-3 font-medium underline underline-offset-2"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* ======================================
            RIWAYAT PENUKARAN
        ====================================== */}

        {showHistory && (
          <section className="mb-7 rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="border-b border-[#eee8df] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0ebe4] text-[#777067]">
                  <History size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#4a453e]">
                    Riwayat Penukaran
                  </h2>

                  <p className="text-xs text-[#968d82]">
                    Daftar penukaran poin
                    yang pernah kamu lakukan.
                  </p>
                </div>
              </div>
            </div>

            {loadingRiwayat ? (
              <div className="space-y-3 p-5">
                {Array.from({
                  length: 3,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-[#f0ece5]"
                  />
                ))}
              </div>
            ) : riwayat.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Package
                  size={28}
                  className="mx-auto text-[#aaa197]"
                />

                <p className="mt-3 text-sm font-medium text-[#655f56]">
                  Belum ada penukaran
                </p>

                <p className="mt-1 text-xs text-[#9a9288]">
                  Riwayat penukaran kamu akan
                  muncul di sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#eee8df]">
                {riwayat.map(
                  (item) => {
                    const status =
                      getStatusStyle(
                        item.status
                      );

                    const StatusIcon =
                      status.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3efe9] text-[#777067]">
                            <Gift
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#4c4740]">
                              {
                                item
                                  .hadiah
                                  ?.namaHadiah
                              }
                            </p>

                            <p className="mt-1 text-xs text-[#958c82]">
                              {
                                item.kodePenukaran
                              }{" "}
                              ·{" "}
                              {formatDate(
                                item.tanggal
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 md:justify-end">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#536b4d]">
                              -
                              {formatNumber(
                                item.poinTerpakai
                              )}{" "}
                              poin
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium ${status.className}`}
                          >
                            <StatusIcon
                              size={13}
                            />

                            {getStatusLabel(
                              item.status
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        )}

        {/* ======================================
            SEARCH
        ====================================== */}

        <section className="mb-6">
          <div className="relative max-w-md">
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
              placeholder="Cari hadiah atau voucher..."
              className="h-11 w-full rounded-xl border border-[#e4ddd3] bg-[#fffdf9] pl-10 pr-4 text-sm text-[#403c36] outline-none transition placeholder:text-[#aaa196] focus:border-[#a8b69e] focus:bg-white"
            />
          </div>
        </section>

        {/* ======================================
            TITLE KATALOG
        ====================================== */}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#4a453e]">
              Pilihan Hadiah
            </h2>

            <p className="mt-0.5 text-xs text-[#958c82]">
              Pilih hadiah yang sesuai
              dengan jumlah poinmu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchHadiah();
              fetchSummary();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ddd3] bg-[#fffdf9] text-[#81796e] transition hover:bg-[#f3f0ea]"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ======================================
            LOADING HADIAH
        ====================================== */}

        {loadingHadiah ? (
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
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#eee9e1]" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#eee9e1]" />

                  <div className="h-11 animate-pulse rounded-xl bg-[#eee9e1]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredHadiah.length ===
          0 ? (
          /* ======================================
             EMPTY
          ====================================== */

          <div className="rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eee9e1] text-[#91887d]">
              <Gift size={28} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#504a42]">
              Hadiah tidak ditemukan
            </h3>

            <p className="mt-1 text-xs text-[#958c81]">
              Coba gunakan kata pencarian
              yang lain.
            </p>
          </div>
        ) : (
          /* ======================================
             KATALOG
          ====================================== */

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHadiah.map(
              (item) => {
                const cukupPoin =
                  saldoPoin >=
                  item.poinDibutuhkan;

                const tersedia =
                  item.stok > 0;

                const bisaTukar =
                  cukupPoin &&
                  tersedia;

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(86,72,52,0.08)]"
                  >
                    {/* FOTO */}

                    <div className="relative h-48 overflow-hidden bg-[#eee9e1]">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={
                            item.namaHadiah
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
                        <div className="flex h-full items-center justify-center bg-[#edf2e9] text-[#73856d]">
                          <Gift
                            size={48}
                            strokeWidth={
                              1.4
                            }
                          />
                        </div>
                      )}

                      {/* STOK */}

                      <div className="absolute right-4 top-4">
                        <span
                          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                            tersedia
                              ? "border-[#d7e3d2] bg-[#eff5ec] text-[#5b754f]"
                              : "border-[#e5cfca] bg-[#faf0ee] text-[#a05f55]"
                          }`}
                        >
                          {tersedia
                            ? `Stok ${item.stok}`
                            : "Stok habis"}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3 className="min-h-[48px] text-[16px] font-semibold leading-6 text-[#403c36]">
                        {
                          item.namaHadiah
                        }
                      </h3>

                      {/* POIN */}

                      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#dfe9db] bg-[#f0f5ee] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e1ecdd] text-[#5c7753]">
                            <Coins
                              size={15}
                            />
                          </div>

                          <span className="text-xs text-[#74816f]">
                            Poin dibutuhkan
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-[#4f6c49]">
                          {formatNumber(
                            item.poinDibutuhkan
                          )}
                        </p>
                      </div>

                      {/* STATUS POIN */}

                      {!cukupPoin &&
                        tersedia && (
                          <p className="mt-3 text-[11px] text-[#a06b61]">
                            Poin kamu belum
                            mencukupi untuk
                            hadiah ini.
                          </p>
                        )}

                      {/* BUTTON */}

                      <button
                        type="button"
                        disabled={
                          !bisaTukar
                        }
                        onClick={() =>
                          handleSelectHadiah(
                            item
                          )
                        }
                        className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                          bisaTukar
                            ? "bg-[#6f8467] text-white hover:bg-[#5f7557]"
                            : "cursor-not-allowed bg-[#ebe7e0] text-[#aaa197]"
                        }`}
                      >
                        <span>
                          {!tersedia
                            ? "Stok Habis"
                            : !cukupPoin
                            ? "Poin Belum Cukup"
                            : "Tukar Sekarang"}
                        </span>

                        {bisaTukar && (
                          <ArrowRight
                            size={16}
                          />
                        )}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* ======================================
            INFO
        ====================================== */}

        <div className="mt-7 rounded-2xl border border-[#e5ded4] bg-[#fffdf9] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0ebe4] text-[#776f65]">
              <Gift size={15} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#625b52]">
                Cara menukar poin
              </p>

              <p className="mt-1 text-xs leading-5 text-[#948b80]">
                Pilih hadiah yang tersedia,
                pastikan saldo poin mencukupi,
                lalu tekan tombol Tukar
                Sekarang. Setelah pengajuan
                berhasil, penukaran akan
                berstatus diproses sampai
                diselesaikan oleh admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          MODAL KONFIRMASI
      ========================================= */}

      {showModal &&
        selectedHadiah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f342f]/35 px-5 backdrop-blur-[2px]">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-[0_20px_60px_rgba(47,52,47,0.16)]">
              {/* HEADER */}

              <div className="border-b border-[#eee8df] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2e6] text-[#587551]">
                    <Gift size={19} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#403c36]">
                      Konfirmasi Penukaran
                    </h3>

                    <p className="mt-0.5 text-xs text-[#958c82]">
                      Pastikan hadiah yang kamu
                      pilih sudah benar.
                    </p>
                  </div>
                </div>
              </div>

              {/* CONTENT */}

              <div className="px-6 py-5">
                <div className="flex gap-4 rounded-xl border border-[#e8e1d8] bg-[#faf7f2] p-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#eee9e1]">
                    {selectedHadiah.foto ? (
                      <img
                        src={
                          selectedHadiah.foto
                        }
                        alt={
                          selectedHadiah.namaHadiah
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#7b8975]">
                        <Gift
                          size={27}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5 text-[#47423b]">
                      {
                        selectedHadiah.namaHadiah
                      }
                    </p>

                    <p className="mt-2 text-xs text-[#8f867b]">
                      Poin dibutuhkan
                    </p>

                    <p className="text-sm font-semibold text-[#55714e]">
                      {formatNumber(
                        selectedHadiah.poinDibutuhkan
                      )}{" "}
                      poin
                    </p>
                  </div>
                </div>

                {/* RINGKASAN */}

                <div className="mt-4 space-y-3 rounded-xl border border-[#e8e1d8] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8d857b]">
                      Saldo saat ini
                    </span>

                    <span className="font-medium text-[#504a43]">
                      {formatNumber(
                        saldoPoin
                      )}{" "}
                      poin
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8d857b]">
                      Poin digunakan
                    </span>

                    <span className="font-medium text-[#a16058]">
                      -
                      {formatNumber(
                        selectedHadiah.poinDibutuhkan
                      )}{" "}
                      poin
                    </span>
                  </div>

                  <div className="border-t border-[#eee8df] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#5a544c]">
                        Sisa saldo
                      </span>

                      <span className="text-base font-semibold text-[#4f6b49]">
                        {formatNumber(
                          saldoPoin -
                            selectedHadiah.poinDibutuhkan
                        )}{" "}
                        poin
                      </span>
                    </div>
                  </div>
                </div>

                {/* ERROR */}

                {actionError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e7c9c2] bg-[#fbefec] p-3 text-xs text-[#a15e55]">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {actionError}
                    </span>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="flex gap-3 border-t border-[#eee8df] px-6 py-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={closeModal}
                  className="h-11 flex-1 rounded-xl border border-[#e0d9d0] bg-[#faf7f2] text-sm font-medium text-[#71695f] transition hover:bg-[#f3efe9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={
                    isSubmitting ||
                    saldoPoin <
                      selectedHadiah.poinDibutuhkan ||
                    selectedHadiah.stok <= 0
                  }
                  onClick={handleTukar}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#6f8467] text-sm font-medium text-white transition hover:bg-[#5f7557] disabled:cursor-not-allowed disabled:bg-[#c7c4be]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Memproses...
                    </>
                  ) : (
                    <>
                      Konfirmasi Tukar
                      <ArrowRight
                        size={16}
                      />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}