"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import TambahNasabah from "./tambah";
import DetailNasabah from "./detail";
import EditNasabah from "./edit";
import DeleteNasabah from "./delete";

/* =========================================================
   TYPE NASABAH
========================================================= */

export interface Nasabah {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string | null;

  user?: {
    username: string;
    role: string;
  };

  createdAt?: string;
}

/* =========================================================
   API RESPONSE
========================================================= */

interface ApiResponse<T> {
  statusCode?: number;
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  timestamp?: string;
}

/* =========================================================
   API URL
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

/* =========================================================
   AUTH HEADERS
========================================================= */

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken");

  const appKey = localStorage.getItem("appKey");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (appKey) {
    headers["x-app-key"] = appKey;
  }

  return headers;
}

/* =========================================================
   PAGE
========================================================= */

export default function NasabahPage() {
  /* =======================================================
     DATA
  ======================================================= */

  const [nasabah, setNasabah] = useState<Nasabah[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     MODAL
  ======================================================= */

  const [showTambah, setShowTambah] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  /* =======================================================
     SELECTED NASABAH
  ======================================================= */

  const [selectedNasabah, setSelectedNasabah] =
    useState<Nasabah | null>(null);

  /* =======================================================
     TOAST
  ======================================================= */

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* =======================================================
     FETCH DATA
  ======================================================= */

  async function fetchNasabah(showInitialLoading = false) {
    try {
      if (showInitialLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      const response = await fetch(
        `${API_URL}/api/v1/admin/nasabah`,
        {
          method: "GET",
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      let result: ApiResponse<Nasabah[]>;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Response server bukan JSON yang valid."
        );
      }

      /* ===================================================
         AUTH ERROR
      =================================================== */

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        logoutAndRedirect();
        return;
      }

      /* ===================================================
         API ERROR
      =================================================== */

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Gagal mengambil data nasabah. Status: ${response.status}`
        );
      }

      /* ===================================================
         SET DATA
      =================================================== */

      setNasabah(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data nasabah."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchNasabah(true);
  }, []);

  /* =========================================================
     TOAST AUTO CLOSE
  ========================================================= */

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  /* =========================================================
     FILTER SEARCH
  ========================================================= */

  const filteredNasabah = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return nasabah;
    }

    return nasabah.filter((item) => {
      const nama =
        item.namaNasabah?.toLowerCase() || "";

      const username =
        item.user?.username?.toLowerCase() || "";

      const telp =
        item.telp?.toLowerCase() || "";

      const alamat =
        item.alamat?.toLowerCase() || "";

      return (
        nama.includes(keyword) ||
        username.includes(keyword) ||
        telp.includes(keyword) ||
        alamat.includes(keyword)
      );
    });
  }, [nasabah, search]);

  /* =========================================================
     SUCCESS
  ========================================================= */

  function showSuccess(message: string) {
    setToast({
      type: "success",
      message,
    });

    // Refresh data setelah tambah/edit/delete
    fetchNasabah(false);
  }

  /* =========================================================
     ERROR
  ========================================================= */

  function showError(message: string) {
    setToast({
      type: "error",
      message,
    });
  }

  /* =========================================================
     DETAIL
  ========================================================= */

  function handleDetail(item: Nasabah) {
    setSelectedNasabah(item);
    setShowDetail(true);
  }

  /* =========================================================
     EDIT
  ========================================================= */

  function handleEdit(item: Nasabah) {
    setSelectedNasabah(item);
    setShowEdit(true);
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function handleDelete(item: Nasabah) {
    setSelectedNasabah(item);
    setShowDelete(true);
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function logoutAndRedirect() {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("appKey");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    document.cookie =
      "token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accessToken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accesstoken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    window.location.replace("/admin/sign-in");
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F2EDE0] text-[#2C4A30]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1400px]">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-7">
            <p className="mb-1 text-[12px] font-medium text-[#737A70]">
              Admin Panel
            </p>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E7E0D0] text-[#5C8A54]">
                    <Users
                      className="h-5 w-5"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[#2C4A30] sm:text-[29px]">
                      Nasabah
                    </h1>

                    <p className="mt-0.5 text-[12px] text-[#737A70]">
                      Kelola data nasabah Bank Sampah.
                    </p>
                  </div>

                </div>
              </div>

              {/* TAMBAH */}

              <button
                type="button"
                onClick={() => setShowTambah(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2C4A30] px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#486F43] active:scale-[0.98]"
              >
                <Plus
                  className="h-[17px] w-[17px]"
                  strokeWidth={2}
                />

                Tambah Nasabah
              </button>
            </div>
          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}

            <div className="relative w-full sm:max-w-[420px]">

              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A59C]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama, username, telepon..."
                className="h-11 w-full rounded-xl border border-[#D8D0BF] bg-[#FBF8F0] pl-10 pr-10 text-[12px] text-[#2C4A30] outline-none placeholder:text-[#9A9E96] transition focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#A0A59C] transition hover:bg-[#E7E0D0] hover:text-[#2C4A30]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

            </div>

            {/* RIGHT TOOLBAR */}

            <div className="flex items-center justify-between gap-3 sm:justify-end">

              <div className="flex items-center gap-2 text-[11px] text-[#737A70]">

                <span className="rounded-lg bg-[#E7E0D0] px-2.5 py-1.5 font-semibold text-[#5C8A54]">
                  {filteredNasabah.length}
                </span>

                <span>
                  {search
                    ? "hasil ditemukan"
                    : "nasabah"}
                </span>

              </div>

              <button
                type="button"
                onClick={() => fetchNasabah(false)}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#D8D0BF] bg-[#FBF8F0] px-3.5 text-[10px] font-medium text-[#68705F] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>

            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          {loading ? (
            <LoadingState />
          ) : filteredNasabah.length === 0 ? (
            <EmptyState
              searching={Boolean(search)}
            />
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] shadow-sm md:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[950px]">

                    <thead>
                      <tr className="border-b border-[#D8D0BF] bg-[#E7E0D0]">

                        <th className="w-[60px] px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          No
                        </th>

                        <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Nasabah
                        </th>

                        <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Username
                        </th>

                        <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Telepon
                        </th>

                        <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Alamat
                        </th>

                        <th className="px-4 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Saldo Poin
                        </th>

                        <th className="w-[150px] px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#68705F]">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {filteredNasabah.map(
                        (item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-[#E7E0D0] last:border-0 transition hover:bg-[#F2EDE0]"
                          >

                            {/* NO */}

                            <td className="px-5 py-4 text-[12px] font-medium text-[#737A70]">
                              {index + 1}
                            </td>

                            {/* NASABAH */}

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">

                                <Avatar
                                  nasabah={item}
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-[12px] font-semibold text-[#2C4A30]">
                                    {item.namaNasabah}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-[#9A9E96]">
                                    Nasabah
                                  </p>
                                </div>

                              </div>
                            </td>

                            {/* USERNAME */}

                            <td className="px-4 py-4 text-[12px] text-[#68705F]">
                              {item.user?.username || "-"}
                            </td>

                            {/* TELEPON */}

                            <td className="px-4 py-4 text-[12px] text-[#68705F]">
                              {item.telp || "-"}
                            </td>

                            {/* ALAMAT */}

                            <td className="max-w-[220px] px-4 py-4">
                              <p className="truncate text-[12px] text-[#68705F]">
                                {item.alamat || "-"}
                              </p>
                            </td>

                            {/* POIN */}

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center rounded-lg bg-[#F0E6C9] px-2.5 py-1.5 text-[11px] font-semibold text-[#A9812F]">
                                {formatNumber(
                                  item.saldoPoin
                                )}{" "}
                                poin
                              </span>
                            </td>

                            {/* AKSI */}

                            <td className="px-4 py-4">
                              <div className="flex justify-center gap-1">

                                <ActionButton
                                  title="Detail"
                                  onClick={() =>
                                    handleDetail(item)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </ActionButton>

                                <ActionButton
                                  title="Edit"
                                  onClick={() =>
                                    handleEdit(item)
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </ActionButton>

                                <ActionButton
                                  title="Hapus"
                                  danger
                                  onClick={() =>
                                    handleDelete(item)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </ActionButton>

                              </div>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              </div>

              {/* =================================================
                  MOBILE CARD
              ================================================= */}

              <div className="space-y-3 md:hidden">

                {filteredNasabah.map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] p-4 shadow-sm"
                    >

                      <div className="flex gap-3">

                        <Avatar
                          nasabah={item}
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <p className="truncate text-[13px] font-semibold text-[#2C4A30]">
                                {item.namaNasabah}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-[#737A70]">
                                @
                                {item.user?.username ||
                                  "-"}
                              </p>

                            </div>

                            <span className="shrink-0 rounded-lg bg-[#F0E6C9] px-2 py-1 text-[9px] font-semibold text-[#A9812F]">
                              {formatNumber(
                                item.saldoPoin
                              )}{" "}
                              poin
                            </span>

                          </div>

                          <div className="mt-3 space-y-1">

                            <p className="text-[10px] text-[#68705F]">
                              <span className="font-medium text-[#737A70]">
                                Telepon:
                              </span>{" "}
                              {item.telp || "-"}
                            </p>

                            <p className="text-[10px] leading-5 text-[#68705F]">
                              <span className="font-medium text-[#737A70]">
                                Alamat:
                              </span>{" "}
                              {item.alamat || "-"}
                            </p>

                          </div>

                        </div>
                      </div>

                      {/* MOBILE ACTION */}

                      <div className="mt-4 flex items-center justify-between border-t border-[#E7E0D0] pt-3">

                        <span className="text-[9px] text-[#9A9E96]">
                          #
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <div className="flex gap-1.5">

                          <button
                            type="button"
                            onClick={() =>
                              handleDetail(item)
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#EEEEEE] px-3 text-[10px] font-medium text-[#68705F] transition hover:bg-[#E7E0D0]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E7E0D0] px-3 text-[10px] font-medium text-[#2C4A30] transition hover:bg-[#D8D0BF]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEEEEE] text-[#8A7168] transition hover:bg-[#E7E0D0]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      </div>

                    </div>
                  )
                )}

              </div>
            </>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="py-7 text-center">
            <p className="text-[11px] text-[#8D938A]">
              © {new Date().getFullYear()} Bank Sampah ·
              Admin Panel
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          MODAL TAMBAH
      ===================================================== */}

      <TambahNasabah
        open={showTambah}
        onClose={() => {
          setShowTambah(false);
        }}
        onSuccess={showSuccess}
        onError={showError}
      />

      {/* =====================================================
          MODAL DETAIL
      ===================================================== */}

      <DetailNasabah
        open={showDetail}
        nasabah={selectedNasabah}
        onClose={() => {
          setShowDetail(false);
          setSelectedNasabah(null);
        }}
        onError={showError}
      />

      {/* =====================================================
          MODAL EDIT
      ===================================================== */}

      <EditNasabah
        open={showEdit}
        nasabah={selectedNasabah}
        onClose={() => {
          setShowEdit(false);
          setSelectedNasabah(null);
        }}
        onSuccess={showSuccess}
        onError={showError}
      />

      {/* =====================================================
          MODAL DELETE
      ===================================================== */}

      <DeleteNasabah
        open={showDelete}
        nasabah={selectedNasabah}
        onClose={() => {
          setShowDelete(false);
          setSelectedNasabah(null);
        }}
        onSuccess={showSuccess}
        onError={showError}
      />

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] w-[calc(100%-40px)] max-w-[380px]">

          <div className="flex items-start gap-3 rounded-xl border border-[#D8D0BF] bg-[#FBF8F0] p-4 shadow-lg">

            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5C8A54]" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8A7168]" />
            )}

            <div className="min-w-0 flex-1">

              <p className="text-[11px] font-semibold text-[#2C4A30]">
                {toast.type === "success"
                  ? "Berhasil"
                  : "Terjadi Kesalahan"}
              </p>

              <p className="mt-0.5 text-[10px] leading-5 text-[#737A70]">
                {toast.message}
              </p>

            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[#A0A59C] transition hover:text-[#2C4A30]"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  nasabah,
}: {
  nasabah: Nasabah;
}) {
  /*
    API mengembalikan foto seperti:

    /uploads/img-1789903772476-727212775.webp

    Karena itu bukan URL lengkap, kita gabungkan
    dengan API_URL.
  */

  const fotoUrl = nasabah.foto
    ? nasabah.foto.startsWith("http://") ||
      nasabah.foto.startsWith("https://")
      ? nasabah.foto
      : `${API_URL}${
          nasabah.foto.startsWith("/")
            ? nasabah.foto
            : `/${nasabah.foto}`
        }`
    : null;

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#E7E0D0]">

      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={nasabah.namaNasabah}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";

            event.currentTarget.nextElementSibling?.classList.remove(
              "hidden"
            );
          }}
        />
      ) : null}

      <div
        className={`h-full w-full items-center justify-center text-[#5C8A54] ${
          fotoUrl ? "hidden" : "flex"
        }`}
      >
        <UserRound
          className="h-5 w-5"
          strokeWidth={1.8}
        />
      </div>

    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
        danger
          ? "text-[#8A7168] hover:bg-[#EEEEEE]"
          : "text-[#68705F] hover:bg-[#E7E0D0] hover:text-[#2C4A30]"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0]">

      <div className="hidden md:block">

        <div className="border-b border-[#D8D0BF] bg-[#E7E0D0] px-5 py-4">
          <div className="h-3 w-32 animate-pulse rounded bg-[#EEEEEE]" />
        </div>

        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex animate-pulse items-center gap-4 border-b border-[#E7E0D0] px-5 py-5"
          >

            <div className="h-10 w-10 rounded-xl bg-[#EEEEEE]" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[#EEEEEE]" />
              <div className="h-2.5 w-24 rounded bg-[#EEEEEE]" />
            </div>

            <div className="h-3 w-24 rounded bg-[#EEEEEE]" />
            <div className="h-3 w-20 rounded bg-[#EEEEEE]" />

          </div>
        ))}

      </div>

      <div className="space-y-3 p-4 md:hidden">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex animate-pulse gap-3 rounded-xl border border-[#E7E0D0] p-4"
          >

            <div className="h-11 w-11 rounded-xl bg-[#EEEEEE]" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[#EEEEEE]" />
              <div className="h-2.5 w-24 rounded bg-[#EEEEEE]" />
              <div className="h-2.5 w-full rounded bg-[#EEEEEE]" />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  searching,
}: {
  searching: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] px-5 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E0D0] text-[#5C8A54]">

        {searching ? (
          <Search className="h-6 w-6" />
        ) : (
          <Users className="h-6 w-6" />
        )}

      </div>

      <h3 className="mt-4 text-[14px] font-semibold text-[#2C4A30]">
        {searching
          ? "Nasabah tidak ditemukan"
          : "Belum ada nasabah"}
      </h3>

      <p className="mx-auto mt-1 max-w-[350px] text-[11px] leading-5 text-[#737A70]">
        {searching
          ? "Coba gunakan kata kunci pencarian yang berbeda."
          : "Data nasabah yang ditambahkan akan muncul di halaman ini."}
      </p>

    </div>
  );
}

/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(
    value || 0
  );
}