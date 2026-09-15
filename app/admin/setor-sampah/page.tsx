"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  Scale,
  ChevronLeft,
  ChevronRight,
  Recycle,
  Clock3,
  CheckCircle2,
  XCircle,
  Filter,
  CalendarDays,
} from "lucide-react";

import VerifySetorSampah from "./verify";

type StatusSetor =
  | "menunggu_konfirmasi"
  | "diverifikasi"
  | "selesai"
  | "ditolak";

type SetorSampah = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  nasabah: {
    namaNasabah: string;
    telp: string;
  };
  status: StatusSetor;
  totalBeratKg: number;
  totalPoin: number;
};

const STATUS_OPTIONS = [
  {
    value: "semua",
    label: "Semua Status",
  },
  {
    value: "menunggu_konfirmasi",
    label: "Menunggu Konfirmasi",
  },
  {
    value: "diverifikasi",
    label: "Diverifikasi",
  },
  {
    value: "selesai",
    label: "Selesai",
  },
  {
    value: "ditolak",
    label: "Ditolak",
  },
];

const ITEMS_PER_PAGE = 8;

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
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

function formatTanggal(tanggal: string) {
  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(
    value || 0
  );
}

function StatusBadge({
  status,
}: {
  status: StatusSetor;
}) {
  const config = {
    menunggu_konfirmasi: {
      label: "Menunggu Konfirmasi",
      className:
        "bg-[#fff5df] text-[#a06a20] border-[#ead6b0]",
      icon: Clock3,
    },

    diverifikasi: {
      label: "Diverifikasi",
      className:
        "bg-[#edf3e8] text-[#607653] border-[#d3dfca]",
      icon: CheckCircle2,
    },

    selesai: {
      label: "Selesai",
      className:
        "bg-[#e8f1e5] text-[#4f7045] border-[#cbdcc5]",
      icon: CheckCircle2,
    },

    ditolak: {
      label: "Ditolak",
      className:
        "bg-[#f8e9e5] text-[#a55e52] border-[#e8c9c2]",
      icon: XCircle,
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${item.className}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
  );
}

export default function SetorSampahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * Kalau ada ?verify=ID,
   * halaman ini akan menampilkan verify.tsx
   */
  const verifyId = searchParams.get("verify");

  const [data, setData] = useState<SetorSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("semua");
  const [bulan, setBulan] = useState("");

  const [page, setPage] = useState(1);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_BASE_API_URL belum diatur di file .env.local"
        );
      }

      const params = new URLSearchParams();

      if (status !== "semua") {
        params.append("status", status);
      }

      if (bulan) {
        params.append("bulan", bulan);
      }

      const query = params.toString();

      const response = await fetch(
        `${baseUrl}/api/v1/setor-sampah/admin/list${
          query ? `?${query}` : ""
        }`,
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

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message ||
            "Gagal mengambil data setor sampah."
        );
      }

      setData(result.data || []);
      setPage(1);
    } catch (err) {
      console.error("FETCH SETOR ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    /*
     * Saat sedang membuka verify,
     * tidak perlu mengambil ulang list.
     */
    if (verifyId) {
      return;
    }

    fetchData();
  }, [status, bulan, verifyId]);

  const filteredData = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) {
      return data;
    }

    return data.filter(
      (item) =>
        item.kodeSetor
          .toLowerCase()
          .includes(keyword) ||
        item.nasabah.namaNasabah
          .toLowerCase()
          .includes(keyword) ||
        item.nasabah.telp.includes(keyword)
    );
  }, [data, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / ITEMS_PER_PAGE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedData =
    filteredData.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const summary = {
    total: data.length,

    menunggu: data.filter(
      (item) =>
        item.status ===
        "menunggu_konfirmasi"
    ).length,

    selesai: data.filter(
      (item) =>
        item.status === "selesai"
    ).length,

    ditolak: data.filter(
      (item) =>
        item.status === "ditolak"
    ).length,
  };

  /*
   * ============================
   * MODE VERIFIKASI
   * ============================
   *
   * URL:
   * /admin/setor-sampah?verify=ID
   */
  if (verifyId) {
    return (
      <VerifySetorSampah
        id={verifyId}
        onBack={() =>
          router.push(
            "/admin/setor-sampah"
          )
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277]">
              <Recycle size={16} />

              <span>Admin</span>

              <span>/</span>

              <span>Setor Sampah</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
              Setor Sampah
            </h1>

            <p className="mt-1 text-sm text-[#8c847a]">
              Kelola pengajuan dan verifikasi
              penyetoran sampah nasabah.
            </p>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* TOTAL */}
          <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-5 shadow-[0_4px_20px_rgba(86,72,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee7dc] text-[#766d61]">
              <Recycle size={19} />
            </div>

            <p className="text-xs text-[#948b80]">
              Total Pengajuan
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#403c36]">
              {summary.total}
            </p>
          </div>

          {/* MENUNGGU */}
          <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-5 shadow-[0_4px_20px_rgba(86,72,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2d8] text-[#a06a20]">
              <Clock3 size={19} />
            </div>

            <p className="text-xs text-[#948b80]">
              Menunggu
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#403c36]">
              {summary.menunggu}
            </p>
          </div>

          {/* SELESAI */}
          <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-5 shadow-[0_4px_20px_rgba(86,72,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f1e6] text-[#5d7652]">
              <CheckCircle2 size={19} />
            </div>

            <p className="text-xs text-[#948b80]">
              Selesai
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#403c36]">
              {summary.selesai}
            </p>
          </div>

          {/* DITOLAK */}
          <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-5 shadow-[0_4px_20px_rgba(86,72,52,0.04)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e9e5] text-[#a55e52]">
              <XCircle size={19} />
            </div>

            <p className="text-xs text-[#948b80]">
              Ditolak
            </p>

            <p className="mt-1 text-2xl font-semibold text-[#403c36]">
              {summary.ditolak}
            </p>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <section className="overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] shadow-[0_6px_25px_rgba(86,72,52,0.05)]">
          {/* TOOLBAR */}
          <div className="border-b border-[#eee7de] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a39a8e]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                  placeholder="Cari kode setor, nama nasabah..."
                  className="h-11 w-full rounded-xl border border-[#e5ddd3] bg-[#faf7f2] pl-10 pr-4 text-sm text-[#403c36] outline-none transition placeholder:text-[#aaa196] focus:border-[#a6b297] focus:bg-white"
                />
              </div>

              {/* FILTER */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Filter
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#938a7e]"
                  />

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#e5ddd3] bg-[#faf7f2] pl-9 pr-9 text-sm text-[#5d574f] outline-none focus:border-[#a6b297] sm:w-52"
                  >
                    {STATUS_OPTIONS.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={
                            item.value
                          }
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="relative">
                  <CalendarDays
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#938a7e]"
                  />

                  <input
                    type="month"
                    value={bulan}
                    onChange={(e) =>
                      setBulan(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#e5ddd3] bg-[#faf7f2] pl-9 pr-3 text-sm text-[#5d574f] outline-none focus:border-[#a6b297] sm:w-44"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="m-5 rounded-xl border border-[#e9c9c2] bg-[#fbefec] px-4 py-3 text-sm text-[#a55e52]">
              {error}
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-[#eee7de] bg-[#faf7f2] text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    No
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Kode Setor
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Nasabah
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Tanggal
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Berat
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Poin
                  </th>

                  <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#81786d]">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({
                    length: 6,
                  }).map(
                    (_, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#f0eae2]"
                      >
                        {Array.from({
                          length: 8,
                        }).map(
                          (
                            _,
                            cell
                          ) => (
                            <td
                              key={
                                cell
                              }
                              className="px-4 py-5"
                            >
                              <div className="h-4 animate-pulse rounded bg-[#eee8df]" />
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )
                ) : paginatedData.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee8df] text-[#8a8175]">
                        <Recycle
                          size={25}
                        />
                      </div>

                      <h3 className="mt-4 font-medium text-[#504a42]">
                        Belum ada data
                        setor sampah
                      </h3>

                      <p className="mt-1 text-sm text-[#9a9186]">
                        Data pengajuan
                        akan muncul di
                        halaman ini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(
                    (
                      item,
                      index
                    ) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#f0eae2] transition hover:bg-[#fcfaf6]"
                      >
                        <td className="px-6 py-4 text-sm text-[#8d857a]">
                          {(currentPage -
                            1) *
                            ITEMS_PER_PAGE +
                            index +
                            1}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-medium text-[#4b4740]">
                            {
                              item.kodeSetor
                            }
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-[#4b4740]">
                              {
                                item
                                  .nasabah
                                  .namaNasabah
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-[#9a9186]">
                              {
                                item
                                  .nasabah
                                  .telp
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-[#756d63]">
                          {formatTanggal(
                            item.tanggal
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-medium text-[#575148]">
                          {formatNumber(
                            item.totalBeratKg
                          )}{" "}
                          kg
                        </td>

                        <td className="px-4 py-4 text-sm font-medium text-[#647556]">
                          {formatNumber(
                            item.totalPoin
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            status={
                              item.status
                            }
                          />
                        </td>

                        {/* AKSI */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* DETAIL */}
                            <Link
                              href={`/admin/setor-sampah/detail?id=${encodeURIComponent(
                                item.id
                              )}`}
                              title="Lihat detail"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4ddd3] bg-[#faf7f2] text-[#756d63] transition hover:border-[#c9c1b5] hover:bg-[#f3eee7]"
                            >
                              <Eye
                                size={16}
                              />
                            </Link>

                            {/* VERIFIKASI */}
                            {item.status ===
                              "menunggu_konfirmasi" && (
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/setor-sampah?verify=${encodeURIComponent(
                                      item.id
                                    )}`
                                  )
                                }
                                title="Verifikasi"
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#718467] px-3 text-xs font-medium text-white transition hover:bg-[#607456]"
                              >
                                <Scale
                                  size={15}
                                />

                                Verifikasi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!loading &&
            filteredData.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-[#eee7de] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#938a7f]">
                  Menampilkan{" "}
                  <span className="font-medium text-[#625b52]">
                    {(currentPage -
                      1) *
                      ITEMS_PER_PAGE +
                      1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-[#625b52]">
                    {Math.min(
                      currentPage *
                        ITEMS_PER_PAGE,
                      filteredData.length
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-[#625b52]">
                    {
                      filteredData.length
                    }
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1
                          )
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4ddd3] text-[#756d63] transition hover:bg-[#f4efe8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) =>
                      index + 1
                  )
                    .slice(
                      Math.max(
                        0,
                        currentPage - 3
                      ),
                      Math.min(
                        totalPages,
                        currentPage + 2
                      )
                    )
                    .map(
                      (
                        pageNumber
                      ) => (
                        <button
                          type="button"
                          key={
                            pageNumber
                          }
                          onClick={() =>
                            setPage(
                              pageNumber
                            )
                          }
                          className={`h-9 min-w-9 rounded-lg border px-3 text-xs font-medium transition ${
                            currentPage ===
                            pageNumber
                              ? "border-[#718467] bg-[#718467] text-white"
                              : "border-[#e4ddd3] text-[#756d63] hover:bg-[#f4efe8]"
                          }`}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        (prev) =>
                          Math.min(
                            totalPages,
                            prev + 1
                          )
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4ddd3] text-[#756d63] transition hover:bg-[#f4efe8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}