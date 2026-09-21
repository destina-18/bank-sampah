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
  RefreshCw,
  X,
  Download,
  FileText,
} from "lucide-react";

import jsPDF from "jspdf";

/* =========================================================
   TYPES
========================================================= */

type Hadiah = {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string | null;
};

type Nasabah = {
  id?: string;
  namaNasabah?: string;
  alamat?: string;
  telp?: string;
  saldoPoin?: number;
};

type HadiahNota = {
  id?: string;
  namaHadiah?: string;
  poinDibutuhkan?: number;
  stok?: number;
  foto?: string | null;
};

type Penukaran = {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  poinTerpakai: number;
  status: string;

  nasabah?: Nasabah;

  hadiah?: HadiahNota;
};

type NotaData = {
  id: string;
  kodePenukaran: string;
  tanggal: string;
  poinTerpakai: number;
  status: string;

  nasabah?: Nasabah;

  hadiah?: HadiahNota;
};

type DashboardSummary = {
  saldoPoin: number;
  totalPengajuanSetor: number;
  totalPenukaranHadiah: number;
  totalPoinDiperoleh: number;
};

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
    "x-app-key": appKey,
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await response.text();

    console.error("Response bukan JSON:", text);

    throw new Error(
      `Response server tidak valid (${response.status}).`
    );
  }

  return response.json();
}

/* =========================================================
   FORMATTER
========================================================= */

function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value ?? 0)
  );
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
   STATUS
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

    case "menunggu_konfirmasi":
      return "Menunggu Konfirmasi";

    default:
      return status || "-";
  }
}

function getStatusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "selesai":
      return {
        className:
          "border-[#d2e3cf] bg-[#edf5ea] text-[#52734a]",
        icon: CheckCircle2,
      };

    case "diproses":
    case "menunggu_konfirmasi":
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

/* =========================================================
   PAGE
========================================================= */

export default function TukarPoinPage() {
  const [hadiah, setHadiah] = useState<Hadiah[]>([]);
  const [riwayat, setRiwayat] = useState<Penukaran[]>([]);
  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [loadingHadiah, setLoadingHadiah] = useState(true);
  const [loadingSummary, setLoadingSummary] =
    useState(true);
  const [loadingRiwayat, setLoadingRiwayat] =
    useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedHadiah, setSelectedHadiah] =
    useState<Hadiah | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [actionError, setActionError] = useState("");

  /* =========================================================
     NOTA
  ========================================================= */

  const [selectedNota, setSelectedNota] =
    useState<Penukaran | null>(null);

  const [notaData, setNotaData] =
    useState<NotaData | null>(null);

  const [showNotaModal, setShowNotaModal] =
    useState(false);

  const [loadingNota, setLoadingNota] =
    useState(false);

  const [notaError, setNotaError] = useState("");

  const [downloadingPdf, setDownloadingPdf] =
    useState(false);

  /* =========================================================
     GET HADIAH
  ========================================================= */

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

      const result = await readJson(response);

      console.log("KATALOG HADIAH:", result);

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          result?.message ||
            "Akses ditolak. Pastikan token yang digunakan adalah token Nasabah."
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil katalog hadiah."
        );
      }

      setHadiah(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error("FETCH HADIAH ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil katalog hadiah."
      );
    } finally {
      setLoadingHadiah(false);
    }
  }

  /* =========================================================
     GET SUMMARY
  ========================================================= */

  async function fetchSummary() {
    try {
      setLoadingSummary(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/dashboard/summary`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await readJson(response);

      console.log(
        "DASHBOARD SUMMARY:",
        result
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("accesstoken");

        window.location.replace(
          "/nasabah-login"
        );

        return;
      }

      if (response.status === 403) {
        throw new Error(
          result?.message ||
            "Token yang digunakan bukan tipe token Nasabah."
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil saldo poin."
        );
      }

      setSummary(result?.data || null);
    } catch (err) {
      console.error(
        "FETCH SUMMARY ERROR:",
        err
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil saldo poin."
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  /* =========================================================
     GET RIWAYAT
  ========================================================= */

  async function fetchRiwayat() {
    try {
      setLoadingRiwayat(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/my-penukaran`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result = await readJson(response);

      console.log(
        "RIWAYAT PENUKARAN:",
        result
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          result?.message ||
            "Akses riwayat penukaran ditolak."
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil riwayat penukaran."
        );
      }

      setRiwayat(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH RIWAYAT ERROR:",
        err
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil riwayat penukaran."
      );
    } finally {
      setLoadingRiwayat(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchHadiah();
    fetchSummary();
    fetchRiwayat();
  }, []);

  /* =========================================================
     FILTER HADIAH
  ========================================================= */

  const filteredHadiah = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) {
      return hadiah;
    }

    return hadiah.filter((item) =>
      item.namaHadiah
        .toLowerCase()
        .includes(keyword)
    );
  }, [hadiah, search]);

  /* =========================================================
     SALDO
  ========================================================= */

  const saldoPoin = Number(
    summary?.saldoPoin ?? 0
  );

  /* =========================================================
     SELECT HADIAH
  ========================================================= */

  function handleSelectHadiah(
    item: Hadiah
  ) {
    setActionError("");
    setSuccessMessage("");

    setSelectedHadiah(item);
    setShowModal(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setShowModal(false);
    setSelectedHadiah(null);
    setActionError("");
  }

  /* =========================================================
     TUKAR POIN
  ========================================================= */

  async function handleTukar() {
    if (!selectedHadiah) {
      return;
    }

    const hadiahTerpilih =
      selectedHadiah;

    if (hadiahTerpilih.stok <= 0) {
      setActionError(
        "Hadiah ini sedang habis."
      );

      return;
    }

    if (
      saldoPoin <
      hadiahTerpilih.poinDibutuhkan
    ) {
      setActionError(
        `Poin kamu belum cukup. Kamu membutuhkan ${formatNumber(
          hadiahTerpilih.poinDibutuhkan
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
            hadiahId:
              hadiahTerpilih.id,
          }),
        }
      );

      const result =
        await readJson(response);

      console.log(
        "HASIL TUKAR POIN:",
        result
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          result?.message ||
            "Penukaran ditolak. Pastikan token yang digunakan adalah token Nasabah."
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Penukaran poin gagal."
        );
      }

      setSuccessMessage(
        `Penukaran berhasil diajukan. Kode transaksi: ${
          result?.data?.kodePenukaran ||
          "-"
        }`
      );

      setShowModal(false);
      setSelectedHadiah(null);

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

  /* =========================================================
     GET NOTA
  ========================================================= */

  async function fetchNota(
    item: Penukaran
  ) {
    try {
      setLoadingNota(true);
      setNotaError("");
      setNotaData(null);
      setSelectedNota(item);
      setShowNotaModal(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum diatur."
        );
      }

      const response = await fetch(
        `${baseUrl}/api/v1/penukaran-poin/nota/${item.id}`,
        {
          method: "GET",
          headers: getHeaders(),
          cache: "no-store",
        }
      );

      const result =
        await readJson(response);

      console.log(
        "NOTA PENUKARAN:",
        result
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          result?.message ||
            "Akses nota ditolak."
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
            "Gagal mengambil nota."
        );
      }

      if (!result?.data) {
        throw new Error(
          "Data nota tidak ditemukan."
        );
      }

      setNotaData(result.data);
    } catch (err) {
      console.error(
        "FETCH NOTA ERROR:",
        err
      );

      setNotaError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil nota."
      );
    } finally {
      setLoadingNota(false);
    }
  }

  /* =========================================================
     CLOSE NOTA
  ========================================================= */

  function closeNota() {
    if (downloadingPdf) {
      return;
    }

    setShowNotaModal(false);
    setSelectedNota(null);
    setNotaData(null);
    setNotaError("");
  }

  /* =========================================================
     DOWNLOAD PDF
  ========================================================= */

  async function downloadNotaPdf() {
    if (!selectedNota) {
      return;
    }

    try {
      setDownloadingPdf(true);
      setNotaError("");

      /*
       * Kalau notaData sudah berhasil diambil,
       * gunakan data tersebut.
       *
       * Kalau belum ada, ambil ulang dari API.
       */

      let data: NotaData;

      if (notaData) {
        data = notaData;
      } else {
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
          throw new Error(
            "NEXT_PUBLIC_API_URL belum diatur."
          );
        }

        const response = await fetch(
          `${baseUrl}/api/v1/penukaran-poin/nota/${selectedNota.id}`,
          {
            method: "GET",
            headers: getHeaders(),
            cache: "no-store",
          }
        );

        const result =
          await readJson(response);

        if (
          !response.ok ||
          result?.success === false
        ) {
          throw new Error(
            result?.message ||
              "Gagal mengambil data nota."
          );
        }

        if (!result?.data) {
          throw new Error(
            "Data nota tidak ditemukan."
          );
        }

        data = result.data as NotaData;

        setNotaData(data);
      }

      /* =====================================================
         DATA PDF
      ===================================================== */

      const kode =
        data.kodePenukaran ||
        selectedNota.kodePenukaran ||
        "-";

      const tanggal =
        formatDate(data.tanggal);

      const namaNasabah =
        data.nasabah?.namaNasabah ||
        selectedNota.nasabah?.namaNasabah ||
        "-";

      const namaHadiah =
        data.hadiah?.namaHadiah ||
        selectedNota.hadiah?.namaHadiah ||
        "-";

      const poin = Number(
        data.poinTerpakai ??
          selectedNota.poinTerpakai ??
          0
      );

      const status = getStatusLabel(
        String(
          data.status ??
            selectedNota.status ??
            ""
        )
      );

      const alamat =
        data.nasabah?.alamat ||
        selectedNota.nasabah?.alamat ||
        "-";

      const telp =
        data.nasabah?.telp ||
        selectedNota.nasabah?.telp ||
        "-";

      /* =====================================================
         CREATE PDF
      ===================================================== */

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      let y = 18;

      /* Header */

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

      pdf.setFontSize(10);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "Bukti Transaksi Penukaran Poin",
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

      /* Helper row */

      const row = (
        label: string,
        value: string,
        valueBold = false
      ) => {
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

        pdf.setFont(
          "helvetica",
          valueBold
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

      row(
        "Kode Transaksi",
        kode,
        true
      );

      row(
        "Tanggal",
        tanggal
      );

      y += 2;

      pdf.setDrawColor(
        200,
        200,
        200
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

      /* Nasabah */

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

      row(
        "Alamat",
        alamat
      );

      y += 2;

      /* Transaksi */

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

      /* Box poin */

      pdf.setFillColor(
        237,
        244,
        234
      );

      pdf.roundedRect(
        15,
        y,
        pageWidth - 30,
        18,
        3,
        3,
        "F"
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

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(14);

      pdf.text(
        `${formatNumber(poin)} POIN`,
        pageWidth / 2,
        y + 14,
        {
          align: "center",
        }
      );

      y += 28;

      /* Footer */

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

      y += 8;

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

      pdf.setTextColor(
        120,
        120,
        120
      );

      pdf.text(
        "Nota ini dibuat secara digital.",
        pageWidth / 2,
        y,
        {
          align: "center",
        }
      );

      /* =====================================================
         SAVE
      ===================================================== */

      pdf.save(
        `nota-penukaran-${kode}.pdf`
      );
    } catch (err) {
      console.error(
        "DOWNLOAD PDF ERROR:",
        err
      );

      setNotaError(
        err instanceof Error
          ? err.message
          : "Gagal membuat PDF nota."
      );
    } finally {
      setDownloadingPdf(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

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
                Gunakan poin yang kamu kumpulkan
                untuk mendapatkan hadiah atau
                voucher yang tersedia.
              </p>
            </div>

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

              Riwayat Penukaran
            </button>
          </div>
        </div>

        {/* =================================================
            SALDO
        ================================================= */}

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
                Total transaksi penukaran
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[#53674e]">
                {formatNumber(
                  summary?.totalPenukaranHadiah ??
                    0
                )}{" "}
                transaksi
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            SUCCESS
        ================================================= */}

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
              className="text-xs font-medium underline underline-offset-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#e7c9c2] bg-[#fbefec] p-4 text-sm text-[#a15e55]">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Katalog hadiah tidak dapat dimuat
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

        {/* =================================================
            ACTION ERROR
        ================================================= */}

        {actionError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#eadfcb] bg-[#fffaf0] p-4 text-sm text-[#75633d]">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Informasi
              </p>

              <p className="mt-1">
                {actionError}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActionError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            RIWAYAT
        ================================================= */}

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
                    Daftar penukaran poin yang
                    pernah kamu lakukan.
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
                {riwayat.map((item) => {
                  const status =
                    getStatusStyle(
                      item.status
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3efe9] text-[#777067]">
                          <Gift size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#4c4740]">
                            {item.hadiah
                              ?.namaHadiah ||
                              "-"}
                          </p>

                          <p className="mt-1 text-xs text-[#958c82]">
                            {item.kodePenukaran}
                            {" · "}
                            {formatDate(
                              item.tanggal
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                        <p className="text-sm font-semibold text-[#536b4d]">
                          -
                          {formatNumber(
                            item.poinTerpakai
                          )}{" "}
                          poin
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium ${status.className}`}
                        >
                          <StatusIcon size={13} />

                          {getStatusLabel(
                            item.status
                          )}
                        </span>

                        {/* TOMBOL NOTA */}
                        <button
                          type="button"
                          onClick={() =>
                            fetchNota(item)
                          }
                          className="flex h-9 items-center justify-center gap-2 rounded-xl border border-[#dcd6cd] bg-white px-3 text-xs font-medium text-[#5f695c] transition hover:bg-[#f3f0ea]"
                        >
                          <FileText
                            size={14}
                          />

                          Nota
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            SEARCH
        ================================================= */}

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

        {/* =================================================
            TITLE HADIAH
        ================================================= */}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#4a453e]">
              Pilihan Hadiah
            </h2>

            <p className="mt-0.5 text-xs text-[#958c82]">
              Pilih hadiah yang sesuai dengan
              jumlah poinmu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchHadiah();
              fetchSummary();
              fetchRiwayat();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e4ddd3] bg-[#fffdf9] text-[#81796e] transition hover:bg-[#f3f0ea]"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* =================================================
            LOADING HADIAH
        ================================================= */}

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
        ) : filteredHadiah.length === 0 ? (
          <div className="rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eee9e1] text-[#91887d]">
              <Gift size={28} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#504a42]">
              Hadiah tidak ditemukan
            </h3>

            <p className="mt-1 text-xs text-[#958c81]">
              Coba gunakan kata pencarian yang
              lain.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHadiah.map((item) => {
              const cukupPoin =
                saldoPoin >=
                Number(
                  item.poinDibutuhkan
                );

              const tersedia =
                Number(item.stok) > 0;

              const bisaTukar =
                cukupPoin && tersedia;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-[#e7dfd5] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(86,72,52,0.08)]"
                >
                  <div className="relative h-48 overflow-hidden bg-[#eee9e1]">
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={
                          item.namaHadiah
                        }
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#edf2e9] text-[#73856d]">
                        <Gift
                          size={48}
                          strokeWidth={1.4}
                        />
                      </div>
                    )}

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

                  <div className="p-5">
                    <h3 className="text-base font-semibold text-[#4a453e]">
                      {item.namaHadiah}
                    </h3>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-[#edf4ea] p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dbe9d6] text-[#5c7955]">
                          <Coins size={15} />
                        </div>

                        <span className="text-xs text-[#70806b]">
                          Poin dibutuhkan
                        </span>
                      </div>

                      <span className="text-sm font-bold text-[#4f6d48]">
                        {formatNumber(
                          item.poinDibutuhkan
                        )}
                      </span>
                    </div>

                    {!cukupPoin &&
                      tersedia && (
                        <p className="mt-3 text-xs text-[#a15e55]">
                          Poin kamu belum
                          mencukupi untuk hadiah
                          ini.
                        </p>
                      )}

                    {tersedia ? (
                      <button
                        type="button"
                        disabled={!bisaTukar}
                        onClick={() =>
                          handleSelectHadiah(
                            item
                          )
                        }
                        className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
                          bisaTukar
                            ? "bg-[#2e7d32] text-white hover:bg-[#205c29]"
                            : "cursor-not-allowed bg-[#ece8e2] text-[#aaa197]"
                        }`}
                      >
                        {bisaTukar ? (
                          <>
                            Tukar Sekarang
                            <Gift size={16} />
                          </>
                        ) : (
                          "Poin Belum Cukup"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-4 flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#ece8e2] text-sm font-medium text-[#aaa197]"
                      >
                        Stok Habis
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="h-10" />
      </div>

      {/* =====================================================
          MODAL KONFIRMASI TUKAR
      ===================================================== */}

      {showModal &&
        selectedHadiah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263329]/30 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-2xl border border-[#e4ddd3] bg-[#fffdf9] p-6 shadow-[0_20px_60px_rgba(45,55,45,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#403c36]">
                    Konfirmasi Penukaran
                  </h2>

                  <p className="mt-1 text-xs text-[#8c847a]">
                    Pastikan hadiah dan jumlah
                    poin sudah sesuai.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    isSubmitting
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8d857b] hover:bg-[#f2eee8] disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-[#e6e0d7] bg-[#f7f4ee] p-4">
                <p className="text-xs text-[#8b8277]">
                  Hadiah
                </p>

                <p className="mt-1 text-sm font-semibold text-[#403c36]">
                  {
                    selectedHadiah.namaHadiah
                  }
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] text-[#958c82]">
                      Poin digunakan
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#536b4d]">
                      {formatNumber(
                        selectedHadiah.poinDibutuhkan
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] text-[#958c82]">
                      Saldo setelah
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#536b4d]">
                      {formatNumber(
                        saldoPoin -
                          selectedHadiah.poinDibutuhkan
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {actionError && (
                <div className="mt-4 rounded-xl border border-[#e7c9c2] bg-[#fbefec] p-3 text-xs text-[#a15e55]">
                  {actionError}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    isSubmitting
                  }
                  className="flex-1 rounded-xl border border-[#e1dbd2] bg-white px-4 py-3 text-sm font-medium text-[#696157] hover:bg-[#f5f2ec] disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleTukar}
                  disabled={
                    isSubmitting
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2e7d32] px-4 py-3 text-sm font-semibold text-white hover:bg-[#205c29] disabled:opacity-60"
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
                    "Konfirmasi Tukar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          MODAL NOTA
      ===================================================== */}

      {showNotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#263329]/30 px-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e4ddd3] bg-[#fffdf9] shadow-[0_20px_60px_rgba(45,55,45,0.18)]">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#eee8df] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2e6] text-[#55764e]">
                  <FileText
                    size={18}
                  />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#403c36]">
                    Nota Penukaran
                  </h2>

                  <p className="mt-1 text-xs text-[#958c82]">
                    Bukti transaksi penukaran
                    poin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeNota}
                disabled={
                  downloadingPdf
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#81796e] hover:bg-[#f3f0ea] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5">
              {loadingNota ? (
                <div className="py-12 text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-[#5d7a55]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#5c564e]">
                    Mengambil data nota...
                  </p>

                  <p className="mt-1 text-xs text-[#968d82]">
                    Mohon tunggu sebentar.
                  </p>
                </div>
              ) : notaError ? (
                <div className="rounded-xl border border-[#e7c9c2] bg-[#fbefec] p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-[#a15e55]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#8f514a]">
                        Nota tidak dapat
                        dimuat
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#a15e55]">
                        {notaError}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        selectedNota
                      ) {
                        fetchNota(
                          selectedNota
                        );
                      }
                    }}
                    className="mt-4 rounded-xl border border-[#dfc7c2] bg-white px-4 py-2 text-xs font-medium text-[#8f514a] hover:bg-[#f8f2ef]"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : notaData ? (
                <>
                  {/* NOTA PREVIEW */}
                  <div className="rounded-2xl border border-[#e3ddd4] bg-white p-5">
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f2e6] text-[#4f7048]">
                        <Gift size={22} />
                      </div>

                      <h3 className="mt-3 text-base font-bold tracking-wide text-[#354c37]">
                        BANK SAMPAH
                      </h3>

                      <p className="mt-1 text-[11px] text-[#8f887e]">
                        Bukti Transaksi
                        Penukaran Poin
                      </p>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#dcd5cc]" />

                    {/* KODE */}
                    <div className="rounded-xl bg-[#f5f2ec] p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#958c82]">
                        Kode Transaksi
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#4b6247]">
                        {
                          notaData.kodePenukaran
                        }
                      </p>
                    </div>

                    {/* DATA */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-[#8e867c]">
                          Tanggal
                        </span>

                        <span className="text-right text-xs font-medium text-[#504a42]">
                          {formatDate(
                            notaData.tanggal
                          )}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-[#8e867c]">
                          Nasabah
                        </span>

                        <span className="text-right text-xs font-semibold text-[#504a42]">
                          {notaData.nasabah
                            ?.namaNasabah ||
                            "-"}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-[#8e867c]">
                          Hadiah
                        </span>

                        <span className="text-right text-xs font-semibold text-[#504a42]">
                          {notaData.hadiah
                            ?.namaHadiah ||
                            "-"}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-[#8e867c]">
                          Poin Terpakai
                        </span>

                        <span className="text-right text-xs font-bold text-[#52744b]">
                          {formatNumber(
                            notaData.poinTerpakai
                          )}{" "}
                          poin
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-[#8e867c]">
                          Status
                        </span>

                        {(() => {
                          const status =
                            getStatusStyle(
                              notaData.status
                            );

                          const StatusIcon =
                            status.icon;

                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium ${status.className}`}
                            >
                              <StatusIcon
                                size={12}
                              />

                              {getStatusLabel(
                                notaData.status
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#dcd5cc]" />

                    {/* TOTAL */}
                    <div className="rounded-xl bg-[#edf4ea] p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#7f8d79]">
                        Total Poin Digunakan
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#4f6d48]">
                        {formatNumber(
                          notaData.poinTerpakai
                        )}{" "}
                        POIN
                      </p>
                    </div>

                    <p className="mt-5 text-center text-[10px] leading-5 text-[#9a9288]">
                      Terima kasih telah
                      menggunakan layanan
                      Bank Sampah.
                    </p>
                  </div>

                  {/* DOWNLOAD */}
                  <button
                    type="button"
                    onClick={
                      downloadNotaPdf
                    }
                    disabled={
                      downloadingPdf
                    }
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] text-sm font-semibold text-white transition hover:bg-[#205c29] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingPdf ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Membuat PDF...
                      </>
                    ) : (
                      <>
                        <Download
                          size={17}
                        />

                        Download Nota PDF
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <FileText
                    size={30}
                    className="mx-auto text-[#aaa197]"
                  />

                  <p className="mt-3 text-sm font-medium text-[#655f56]">
                    Data nota belum tersedia
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}