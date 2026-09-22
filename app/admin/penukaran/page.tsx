"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Gift,
  Coins,
  User,
  CalendarDays,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";

/* =========================================================
   TYPE
========================================================= */

type Nasabah = {
  id: string;
  namaNasabah: string;
  saldoPoin: number;
  telp?: string;
  alamat?: string;
};

type Hadiah = {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string | null;
};

type Penukaran = {
  id: string;
  appMakerId: string;
  kodePenukaran: string;
  tanggal: string;
  nasabahId: string;
  hadiahId: string;
  poinTerpakai: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  nasabah?: Nasabah;
  hadiah?: Hadiah;
};

type ApiResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
};

type NotaData = Record<string, unknown>;

/* =========================================================
   STATUS
========================================================= */

const STATUS_OPTIONS = [
  {
    value: "diproses",
    label: "Diproses",
  },
  {
    value: "selesai",
    label: "Selesai",
  },
];

/* =========================================================
   API HELPER
========================================================= */

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

function getHeaders() {
  const token = getToken();
  const appKey = getAppKey();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-app-key": appKey,
  };
}

/* =========================================================
   FORMAT
========================================================= */

function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(status?: string) {
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

/* =========================================================
   STATUS STYLE
========================================================= */

function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "diproses":
      return {
        className:
          "border-[#eadcbc] bg-[#faf3df] text-[#8a6d3f]",
        icon: Clock3,
      };

    case "selesai":
      return {
        className:
          "border-[#d2e3cf] bg-[#edf5ea] text-[#52734a]",
        icon: CheckCircle2,
      };

    case "ditolak":
      return {
        className:
          "border-[#e7ceca] bg-[#faefed] text-[#a15e55]",
        icon: XCircle,
      };

    case "dibatalkan":
      return {
        className:
          "border-[#e3ddd4] bg-[#f5f2ed] text-[#756e64]",
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

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminPenukaranPage() {
  const [data, setData] = useState<Penukaran[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [selectedData, setSelectedData] =
    useState<Penukaran | null>(null);

  const [showDetail, setShowDetail] = useState(false);

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [updating, setUpdating] = useState(false);

  /* =====================================================
     NOTA
  ===================================================== */

  const [showNota, setShowNota] = useState(false);

  const [notaLoading, setNotaLoading] = useState(false);

  const [notaError, setNotaError] = useState("");

  const [notaData, setNotaData] =
    useState<NotaData | null>(null);

  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  /* =====================================================
     GET PENUKARAN ADMIN
  ===================================================== */

  async function fetchPenukaran(
    isRefresh = false
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      /*
       * Endpoint sesuai Swagger:
       *
       * GET
       * /api/v1/penukaran-poin/admin/list
       */

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/admin/list`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Response API tidak valid (${response.status}).`
        );
      }

      const result: ApiResponse<
        Penukaran[]
      > = await response.json();

      console.log(
        "PENUKARAN ADMIN:",
        result
      );

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            `Gagal mengambil data penukaran (${response.status}).`
        );
      }

      setData(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH PENUKARAN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data penukaran."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPenukaran();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredData = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.kodePenukaran
          ?.toLowerCase()
          .includes(keyword) ||
        item.nasabah?.namaNasabah
          ?.toLowerCase()
          .includes(keyword) ||
        item.hadiah?.namaHadiah
          ?.toLowerCase()
          .includes(keyword);

      const matchStatus =
        filterStatus === "semua" ||
        item.status?.toLowerCase() ===
          filterStatus;

      return matchSearch && matchStatus;
    });
  }, [data, search, filterStatus]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length /
        ITEMS_PER_PAGE
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
      currentPage *
        ITEMS_PER_PAGE
    );

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  /* =====================================================
     DETAIL
  ===================================================== */

  function handleDetail(
    item: Penukaran
  ) {
    setSelectedData(item);
    setShowDetail(true);
  }

  /* =====================================================
     OPEN STATUS
  ===================================================== */

  function handleOpenStatus(
    item: Penukaran
  ) {
    setSelectedData(item);

    setSelectedStatus(
      item.status
    );

    setShowStatusModal(true);

    setError("");
    setSuccessMessage("");
  }

  /* =====================================================
     GET NOTA
  ===================================================== */

  async function handleNota(
    item: Penukaran
  ) {
    try {
      setSelectedData(item);

      setShowNota(true);

      setNotaLoading(true);

      setNotaError("");

      setNotaData(null);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      /*
       * Endpoint sesuai Swagger:
       *
       * GET
       * /api/v1/penukaran-poin/nota/{id}
       */

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/nota/${item.id}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (!response.ok) {
        let message =
          `Gagal mengambil nota (${response.status}).`;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          const result: ApiResponse<unknown> =
            await response.json();

          message =
            result.message ||
            message;
        }

        throw new Error(message);
      }

      /*
       * Jika backend suatu saat
       * langsung mengembalikan PDF.
       */

      if (
        contentType.includes(
          "application/pdf"
        )
      ) {
        const blob =
          await response.blob();

        const url =
          URL.createObjectURL(blob);

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );

        setShowNota(false);

        return;
      }

      /*
       * Jika backend mengembalikan JSON
       */

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Format nota tidak didukung (${contentType || "unknown"}).`
        );
      }

      const result: ApiResponse<NotaData> =
        await response.json();

      console.log(
        "NOTA PENUKARAN:",
        result
      );

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Gagal mengambil nota."
        );
      }

      setNotaData(
        result.data || {}
      );
    } catch (err) {
      console.error(
        "GET NOTA ERROR:",
        err
      );

      setNotaError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil nota."
      );
    } finally {
      setNotaLoading(false);
    }
  }

  /* =====================================================
     CLOSE NOTA
  ===================================================== */

  function closeNota() {
    if (notaLoading) {
      return;
    }

    setShowNota(false);
    setNotaData(null);
    setNotaError("");
  }

  /* =====================================================
     DOWNLOAD NOTA PDF
  ===================================================== */

  async function downloadNotaPdf() {
    if (!selectedData) {
      return;
    }

    try {
      setNotaError("");

      const namaNasabah =
        selectedData.nasabah
          ?.namaNasabah || "-";

      const namaHadiah =
        selectedData.hadiah
          ?.namaHadiah || "-";

      const kode =
        selectedData.kodePenukaran ||
        "-";

      const tanggal =
        formatDate(
          selectedData.tanggal
        );

      const status =
        getStatusLabel(
          selectedData.status
        );

      const poin =
        Number(
          selectedData.poinTerpakai || 0
        );

      const alamat =
        selectedData.nasabah
          ?.alamat || "-";

      const telp =
        selectedData.nasabah
          ?.telp || "-";

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      let y = 18;

      pdf.setTextColor(
        23,
        60,
        43
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(18);

      pdf.text(
        "BANK SAMPAH",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 7;

      pdf.setTextColor(
        120,
        120,
        120
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        "Nota Penukaran Poin",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 7;

      pdf.setDrawColor(
        180,
        180,
        180
      );

      pdf.line(
        15,
        y,
        pageWidth - 15,
        y
      );

      y += 10;

      const row = (
        label: string,
        value: string,
        bold = false
      ) => {
        pdf.setTextColor(
          130,
          125,
          118
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(9);

        pdf.text(
          label,
          15,
          y
        );

        pdf.setTextColor(
          64,
          60,
          54
        );

        pdf.setFont(
          "helvetica",
          bold
            ? "bold"
            : "normal"
        );

        pdf.text(
          value,
          pageWidth - 15,
          y,
          {
            align: "right",
          }
        );

        y += 7;
      };

      pdf.setTextColor(
        64,
        60,
        54
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        "Informasi Transaksi",
        15,
        y
      );

      y += 7;

      row(
        "Kode Penukaran",
        kode,
        true
      );

      row(
        "Tanggal",
        tanggal
      );

      y += 2;

      pdf.setDrawColor(
        205,
        200,
        194
      );

      pdf.setLineDashPattern(
        [2, 2],
        0
      );

      pdf.line(
        15,
        y,
        pageWidth - 15,
        y
      );

      pdf.setLineDashPattern(
        [],
        0
      );

      y += 9;

      pdf.setTextColor(
        64,
        60,
        54
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        "Data Nasabah",
        15,
        y
      );

      y += 7;

      row(
        "Nama",
        namaNasabah,
        true
      );

      row(
        "Telepon",
        telp
      );

      pdf.setTextColor(
        130,
        125,
        118
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.text(
        "Alamat",
        15,
        y
      );

      pdf.setTextColor(
        64,
        60,
        54
      );

      const alamatLines =
        pdf.splitTextToSize(
          alamat,
          70
        );

      pdf.text(
        alamatLines,
        pageWidth - 15,
        y,
        {
          align: "right",
        }
      );

      y +=
        Math.max(
          7,
          alamatLines.length * 4.5
        );

      y += 4;

      pdf.setTextColor(
        64,
        60,
        54
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        "Detail Penukaran",
        15,
        y
      );

      y += 7;

      row(
        "Hadiah",
        namaHadiah,
        true
      );

      row(
        "Poin Terpakai",
        `${formatNumber(poin)} poin`,
        true
      );

      row(
        "Status",
        status,
        true
      );

      y += 5;

      pdf.setFillColor(
        237,
        245,
        234
      );

      pdf.roundedRect(
        15,
        y,
        pageWidth - 30,
        20,
        3,
        3,
        "F"
      );

      pdf.setTextColor(
        90,
        105,
        82
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        "TOTAL POIN DIGUNAKAN",
        pageWidth / 2,
        y + 7,
        {
          align: "center",
        }
      );

      pdf.setTextColor(
        83,
        107,
        77
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(14);

      pdf.text(
        `${formatNumber(poin)} POIN`,
        pageWidth / 2,
        y + 15,
        {
          align: "center",
        }
      );

      y += 30;

      pdf.setDrawColor(
        190,
        185,
        180
      );

      pdf.line(
        15,
        y,
        pageWidth - 15,
        y
      );

      y += 8;

      pdf.setTextColor(
        145,
        140,
        133
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        "Terima kasih telah menggunakan",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 4;

      pdf.text(
        "layanan Bank Sampah.",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      y += 8;

      pdf.setFontSize(7);

      pdf.text(
        "Nota ini dibuat secara digital.",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      /* =================================================
         DOWNLOAD
      ================================================= */

      pdf.save(
        `nota-penukaran-${kode}.pdf`
      );
    } catch (err) {
      console.error(
        "DOWNLOAD NOTA ERROR:",
        err
      );

      setNotaError(
        "Gagal membuat PDF nota. Pastikan package jspdf sudah terinstall."
      );
    }
  }

  async function handleUpdateStatus() {
    if (!selectedData) {
      return;
    }

    if (!selectedStatus) {
      setError(
        "Silakan pilih status terlebih dahulu."
      );

      return;
    }

    try {
      setUpdating(true);

      setError("");
      setSuccessMessage("");

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/admin/status/${selectedData.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Response server tidak valid (${response.status}).`
        );
      }

      const result: ApiResponse<Penukaran> =
        await response.json();

      console.log(
        "UPDATE STATUS PENUKARAN:",
        result
      );

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
            "Gagal memperbarui status penukaran."
        );
      }

      setSuccessMessage(
        result.message ||
          "Status penukaran berhasil diperbarui."
      );

      setShowStatusModal(false);

      if (result.data) {
        setData((previous) =>
          previous.map((item) =>
            item.id ===
            result.data?.id
              ? result.data
              : item
          )
        );
      } else {
        await fetchPenukaran(true);
      }
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status penukaran."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <div className="h-4 w-32 animate-pulse rounded bg-[#e7e0d6]" />

            <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-[#e7e0d6]" />

            <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-[#ebe5dc]" />
          </div>

          <div className="rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-5">
            <div className="h-11 animate-pulse rounded-xl bg-[#eee9e1]" />

            <div className="mt-5 space-y-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-[#f0ece5]"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277]">
            <Gift size={16} />

            <span>Admin</span>

            <span>/</span>

            <span>Penukaran</span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
                Penukaran Poin
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8c847a]">
                Kelola dan verifikasi transaksi
                penukaran poin nasabah.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchPenukaran(true)
              }
              disabled={refreshing}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e3ddd4] bg-[#fffdf9] px-4 text-sm font-medium text-[#696157] transition hover:bg-[#f5f2ec] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {successMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#cfe0cb] bg-[#edf6eb] p-4 text-sm text-[#52744b]">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Berhasil
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
              className="text-xs underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a15e55]">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Terjadi kesalahan
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-xs underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ea] text-[#56744e]">
                <Gift size={18} />
              </div>

              <div>
                <p className="text-xs text-[#91887d]">
                  Total Penukaran
                </p>

                <p className="mt-1 text-xl font-semibold text-[#403c36]">
                  {formatNumber(
                    data.length
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* DIPROSES */}

          <div className="rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#faf3df] text-[#8a6d3f]">
                <Clock3 size={18} />
              </div>

              <div>
                <p className="text-xs text-[#91887d]">
                  Sedang Diproses
                </p>

                <p className="mt-1 text-xl font-semibold text-[#403c36]">
                  {formatNumber(
                    data.filter(
                      (item) =>
                        item.status?.toLowerCase() ===
                        "diproses"
                    ).length
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* SELESAI */}

          <div className="rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5ea] text-[#52744b]">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-xs text-[#91887d]">
                  Selesai
                </p>

                <p className="mt-1 text-xl font-semibold text-[#403c36]">
                  {formatNumber(
                    data.filter(
                      (item) =>
                        item.status?.toLowerCase() ===
                        "selesai"
                    ).length
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <section className="mb-5 rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-4">
          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">
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
                placeholder="Cari kode, nama nasabah, atau hadiah..."
                className="h-11 w-full rounded-xl border border-[#e4ddd3] bg-[#fffdf9] pl-10 pr-4 text-sm text-[#403c36] outline-none transition placeholder:text-[#aaa196] focus:border-[#a8b69e] focus:bg-white"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
              className="h-11 rounded-xl border border-[#e4ddd3] bg-[#fffdf9] px-4 text-sm text-[#696157] outline-none focus:border-[#a8b69e]"
            >
              <option value="semua">
                Semua Status
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">

              <thead>
                <tr className="border-b border-[#eee8df] bg-[#faf7f2] text-left">

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Penukaran
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Nasabah
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Hadiah
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Poin
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Tanggal
                  </th>

                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-[#8b8277]">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0ebe4] text-[#91887d]">
                        <Gift size={22} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-[#504a42]">
                        Data penukaran tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-[#958c82]">
                        Coba ubah pencarian
                        atau filter status.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(
                    (item) => {
                      const status =
                        getStatusStyle(
                          item.status
                        );

                      const StatusIcon =
                        status.icon;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#f0ebe4] last:border-b-0 hover:bg-[#fcfaf6]"
                        >

                          {/* PENUKARAN */}

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-[#403c36]">
                              {
                                item.kodePenukaran
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-[#9a9288]">
                              ID:{" "}
                              {item.id.slice(
                                0,
                                8
                              )}
                              ...
                            </p>
                          </td>

                          {/* NASABAH */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4ea] text-[#56744e]">
                                <User
                                  size={16}
                                />
                              </div>

                              <div>
                                <p className="text-sm font-medium text-[#4c4740]">
                                  {
                                    item
                                      .nasabah
                                      ?.namaNasabah ||
                                    "-"
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#9a9288]">
                                  Saldo{" "}
                                  {formatNumber(
                                    item
                                      .nasabah
                                      ?.saldoPoin
                                  )}{" "}
                                  poin
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* HADIAH */}

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-[#4c4740]">
                              {
                                item.hadiah
                                  ?.namaHadiah ||
                                "-"
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-[#9a9288]">
                              Membutuhkan{" "}
                              {formatNumber(
                                item.hadiah
                                  ?.poinDibutuhkan
                              )}{" "}
                              poin
                            </p>
                          </td>

                          {/* POIN */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <Coins
                                size={15}
                                className="text-[#7b9271]"
                              />

                              <span className="text-sm font-semibold text-[#536b4d]">
                                {formatNumber(
                                  item.poinTerpakai
                                )}
                              </span>
                            </div>
                          </td>

                          {/* TANGGAL */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-[#6f685f]">
                              <CalendarDays
                                size={14}
                                className="shrink-0 text-[#9a9288]"
                              />

                              <span className="text-xs">
                                {formatDate(
                                  item.tanggal
                                )}
                              </span>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium ${status.className}`}
                            >
                              <StatusIcon
                                size={12}
                              />

                              {getStatusLabel(
                                item.status
                              )}
                            </span>
                          </td>

                          {/* AKSI */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">

                              {/* DETAIL */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDetail(
                                    item
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ddd3] bg-white text-[#777067] transition hover:bg-[#f3f0ea]"
                                title="Detail"
                              >
                                <Eye
                                  size={15}
                                />
                              </button>

                              {/* NOTA */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleNota(
                                    item
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d9e3d5] bg-[#f3f7f1] text-[#5d7a55] transition hover:bg-[#e8f0e5]"
                                title="Buat / Lihat Nota"
                              >
                                <Download
                                  size={15}
                                />
                              </button>

                              {/* STATUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenStatus(
                                    item
                                  )
                                }
                                className="rounded-xl bg-[#5d7a55] px-3 text-[11px] font-medium text-white transition hover:bg-[#4d6847]"
                              >
                                Status
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredData.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#eee8df] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-[#91887d]">
                Menampilkan{" "}
                <span className="font-medium text-[#5b554d]">
                  {(currentPage - 1) *
                    ITEMS_PER_PAGE +
                    1}
                </span>{" "}
                -{" "}
                <span className="font-medium text-[#5b554d]">
                  {Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,
                    filteredData.length
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-[#5b554d]">
                  {filteredData.length}
                </span>{" "}
                data
              </p>

              <div className="flex items-center gap-1.5">

                <button
                  type="button"
                  disabled={
                    currentPage <= 1
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ddd3] bg-white text-[#777067] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={15}
                  />
                </button>

                <span className="px-3 text-xs text-[#696157]">
                  {currentPage} /{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ddd3] bg-white text-[#777067] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight
                    size={15}
                  />
                </button>

              </div>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          MODAL DETAIL
      ===================================================== */}

      {showDetail &&
        selectedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#403c36]/30 px-4 backdrop-blur-[2px]">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-2xl">

              <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">

                <div>
                  <h2 className="text-base font-semibold text-[#403c36]">
                    Detail Penukaran
                  </h2>

                  <p className="mt-1 text-xs text-[#958c82]">
                    {
                      selectedData.kodePenukaran
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetail(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#81796e] hover:bg-[#f3f0ea]"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="space-y-4 p-5">

                {/* STATUS */}

                <div className="rounded-xl bg-[#f5f2ec] p-4">
                  <p className="text-[10px] text-[#9a9288]">
                    Status
                  </p>

                  <div className="mt-2">
                    {(() => {
                      const status =
                        getStatusStyle(
                          selectedData.status
                        );

                      const Icon =
                        status.icon;

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${status.className}`}
                        >
                          <Icon
                            size={13}
                          />

                          {getStatusLabel(
                            selectedData.status
                          )}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* NASABAH + HADIAH */}

                <div className="grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-[#eee8df] p-4">
                    <div className="flex items-center gap-2">
                      <User
                        size={15}
                        className="text-[#7b9271]"
                      />

                      <p className="text-[10px] text-[#9a9288]">
                        Nasabah
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#403c36]">
                      {
                        selectedData
                          .nasabah
                          ?.namaNasabah ||
                        "-"
                      }
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eee8df] p-4">
                    <div className="flex items-center gap-2">
                      <Gift
                        size={15}
                        className="text-[#7b9271]"
                      />

                      <p className="text-[10px] text-[#9a9288]">
                        Hadiah
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#403c36]">
                      {
                        selectedData
                          .hadiah
                          ?.namaHadiah ||
                        "-"
                      }
                    </p>
                  </div>

                </div>

                {/* POIN + TANGGAL */}

                <div className="grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-[#eee8df] p-4">
                    <p className="text-[10px] text-[#9a9288]">
                      Poin Terpakai
                    </p>

                    <p className="mt-2 text-lg font-semibold text-[#536b4d]">
                      {formatNumber(
                        selectedData
                          .poinTerpakai
                      )}{" "}
                      poin
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#eee8df] p-4">
                    <p className="text-[10px] text-[#9a9288]">
                      Tanggal
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#403c36]">
                      {formatDate(
                        selectedData.tanggal
                      )}
                    </p>
                  </div>

                </div>

                {/* INFORMASI HADIAH */}

                <div className="rounded-xl border border-[#eee8df] p-4">
                  <p className="text-[10px] text-[#9a9288]">
                    Informasi Hadiah
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#756e64]">
                      Poin diperlukan
                    </span>

                    <span className="text-xs font-semibold text-[#536b4d]">
                      {formatNumber(
                        selectedData
                          .hadiah
                          ?.poinDibutuhkan
                      )}{" "}
                      poin
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[#756e64]">
                      Stok sekarang
                    </span>

                    <span className="text-xs font-semibold text-[#536b4d]">
                      {formatNumber(
                        selectedData
                          .hadiah
                          ?.stok
                      )}
                    </span>
                  </div>
                </div>

                {/* BUTTON STATUS */}

                <button
                  type="button"
                  onClick={() => {
                    setShowDetail(
                      false
                    );

                    handleOpenStatus(
                      selectedData
                    );
                  }}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-[#5d7a55] text-sm font-medium text-white transition hover:bg-[#4d6847]"
                >
                  Ubah Status
                </button>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          MODAL NOTA
      ===================================================== */}

      {showNota &&
        selectedData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#403c36]/30 px-4 backdrop-blur-[2px]">

            <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">

                <div>
                  <h2 className="text-base font-semibold text-[#403c36]">
                    Nota Penukaran
                  </h2>

                  <p className="mt-1 text-xs text-[#958c82]">
                    {
                      selectedData.kodePenukaran
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeNota}
                  disabled={
                    notaLoading
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#81796e] hover:bg-[#f3f0ea] disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>

              {/* LOADING */}

              {notaLoading ? (
                <div className="flex flex-col items-center justify-center px-6 py-14">

                  <Loader2
                    size={28}
                    className="animate-spin text-[#5d7a55]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#5b554d]">
                    Mengambil nota...
                  </p>

                  <p className="mt-1 text-xs text-[#958c82]">
                    Sedang mengambil data nota dari API.
                  </p>

                </div>
              ) : notaError ? (
                /* ERROR NOTA */

                <div className="p-5">

                  <div className="rounded-xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a15e55]">

                    <p className="font-semibold">
                      Nota tidak dapat diambil
                    </p>

                    <p className="mt-1 text-xs leading-5">
                      {notaError}
                    </p>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleNota(
                          selectedData
                        )
                      }
                      className="h-11 flex-1 rounded-xl bg-[#5d7a55] text-sm font-medium text-white hover:bg-[#4d6847]"
                    >
                      Coba Lagi
                    </button>

                    <button
                      type="button"
                      onClick={closeNota}
                      className="h-11 flex-1 rounded-xl border border-[#e3ddd4] bg-white text-sm font-medium text-[#696157] hover:bg-[#f5f2ec]"
                    >
                      Tutup
                    </button>

                  </div>

                </div>
              ) : (
                /* =================================================
                   NOTA CONTENT
                ================================================= */

                <div className="p-5">

                  <div className="rounded-2xl border border-[#e5ded4] bg-white p-5 shadow-[0_5px_22px_rgba(86,72,52,0.05)]">

                    {/* NOTA HEADER */}

                    <div className="text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f0e2] text-[#2f8135]">
                        <Gift
                          size={22}
                        />
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-[#173c2b]">
                        Bank Sampah
                      </h3>

                      <p className="mt-1 text-xs text-[#958c82]">
                        Nota Penukaran Poin
                      </p>

                    </div>

                    <div className="my-5 border-t border-dashed border-[#ddd6cb]" />

                    {/* DATA */}

                    <div className="space-y-3 text-sm">

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[#8b8277]">
                          Kode Penukaran
                        </span>

                        <span className="text-right font-semibold text-[#403c36]">
                          {
                            selectedData.kodePenukaran
                          }
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[#8b8277]">
                          Tanggal
                        </span>

                        <span className="text-right font-medium text-[#403c36]">
                          {formatDate(
                            selectedData.tanggal
                          )}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[#8b8277]">
                          Nasabah
                        </span>

                        <span className="text-right font-semibold text-[#403c36]">
                          {
                            selectedData
                              .nasabah
                              ?.namaNasabah ||
                            "-"
                          }
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[#8b8277]">
                          Hadiah
                        </span>

                        <span className="text-right font-semibold text-[#403c36]">
                          {
                            selectedData
                              .hadiah
                              ?.namaHadiah ||
                            "-"
                          }
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[#8b8277]">
                          Status
                        </span>

                        <span className="font-semibold text-[#536b4d]">
                          {getStatusLabel(
                            selectedData.status
                          )}
                        </span>
                      </div>

                    </div>

                    <div className="my-5 border-t border-[#e8e1d7]" />

                    {/* TOTAL */}

                    <div className="flex items-center justify-between">

                      <span className="font-semibold text-[#5b554d]">
                        Poin Terpakai
                      </span>

                      <span className="text-lg font-bold text-[#536b4d]">
                        {formatNumber(
                          selectedData
                            .poinTerpakai
                        )}{" "}
                        poin
                      </span>

                    </div>

                    {/* API INFO */}

                    {notaData &&
                      Object.keys(
                        notaData
                      ).length > 0 && (
                        <p className="mt-4 text-center text-[10px] text-[#9a9288]">
                          Data nota berhasil diambil dari API.
                        </p>
                      )}

                  </div>

                  {/* BUTTON */}

                  <div className="mt-4 flex gap-2">

                    <button
                      type="button"
                      onClick={closeNota}
                      className="h-11 flex-1 rounded-xl border border-[#e3ddd4] bg-white text-sm font-medium text-[#696157] hover:bg-[#f5f2ec]"
                    >
                      Tutup
                    </button>

                    <button
                      type="button"
                      onClick={
                        downloadNotaPdf
                      }
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5d7a55] text-sm font-medium text-white transition hover:bg-[#4d6847]"
                    >
                      <Download
                        size={16}
                      />

                      Download PDF
                    </button>

                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      {/* =====================================================
          MODAL UPDATE STATUS
      ===================================================== */}

      {showStatusModal &&
        selectedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#403c36]/30 px-4 backdrop-blur-[2px]">

            <div className="w-full max-w-md rounded-2xl border border-[#e5ded4] bg-[#fffdf9] shadow-2xl">

              <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">

                <div>
                  <h2 className="text-base font-semibold text-[#403c36]">
                    Ubah Status
                  </h2>

                  <p className="mt-1 text-xs text-[#958c82]">
                    {
                      selectedData.kodePenukaran
                    }
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    setShowStatusModal(
                      false
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#81796e] hover:bg-[#f3f0ea] disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="p-5">

                {/* INFO */}

                <div className="mb-4 rounded-xl bg-[#f5f2ec] p-4">

                  <p className="text-xs text-[#756e64]">
                    Nasabah
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#403c36]">
                    {
                      selectedData
                        .nasabah
                        ?.namaNasabah ||
                      "-"
                    }
                  </p>

                  <p className="mt-1 text-xs text-[#958c82]">
                    Hadiah:{" "}
                    {
                      selectedData
                        .hadiah
                        ?.namaHadiah ||
                      "-"
                    }
                  </p>

                </div>

                {/* SELECT */}

                <label className="mb-2 block text-xs font-medium text-[#696157]">
                  Status Penukaran
                </label>

                <select
                  value={
                    selectedStatus
                  }
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value
                    )
                  }
                  disabled={updating}
                  className="h-11 w-full rounded-xl border border-[#e3ddd4] bg-[#fffdf9] px-3 text-sm text-[#403c36] outline-none focus:border-[#a8b69e]"
                >
                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={
                          status.value
                        }
                        value={
                          status.value
                        }
                      >
                        {
                          status.label
                        }
                      </option>
                    )
                  )}
                </select>

                {/* BUTTON */}

                <div className="mt-5 flex gap-2">

                  <button
                    type="button"
                    disabled={
                      updating
                    }
                    onClick={() =>
                      setShowStatusModal(
                        false
                      )
                    }
                    className="h-11 flex-1 rounded-xl border border-[#e3ddd4] bg-white text-sm font-medium text-[#696157] hover:bg-[#f5f2ec] disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    disabled={
                      updating
                    }
                    onClick={
                      handleUpdateStatus
                    }
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5d7a55] text-sm font-medium text-white transition hover:bg-[#4d6847] disabled:opacity-60"
                  >
                    {updating && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    {updating
                      ? "Menyimpan..."
                      : "Simpan Status"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

    </main>
  );
}