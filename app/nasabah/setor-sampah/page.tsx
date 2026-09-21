"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Recycle,
  Trash2,
  X,
} from "lucide-react";

import DetailSetorSampah from "./detail";

type KategoriSampah = {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
};

type ItemSampah = {
  kategoriSampahId: string;
  namaKategori: string;
  jenis: string;
  beratKg: string;
  hargaPerKg: number;
  poinPerKg: number;
};

type SetorDetail = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: string;
  totalBeratKg: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;
  catatan?: string;
  catatanAdmin?: string;
  detailSetors?: {
    kategoriSampahId: string;
    beratKg: number;
    subtotalPoin: number;
    kategoriSampah?: {
      namaKategori?: string;
      jenis?: string;
    };
  }[];
};

export default function SetorSampahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==========================================
  // CEK MODE DETAIL
  // ==========================================

  const detailId = searchParams.get("detail");

  // ==========================================
  // FORM STATE
  // ==========================================

  const [kategori, setKategori] = useState<KategoriSampah[]>([]);

  const [items, setItems] = useState<ItemSampah[]>([]);

  const [tanggal, setTanggal] = useState("");

  const [catatan, setCatatan] = useState("");

  const [selectedKategori, setSelectedKategori] = useState("");

  const [berat, setBerat] = useState("");

  const [showPicker, setShowPicker] = useState(false);

  // ==========================================
  // DETAIL STATE
  // ==========================================

  const [detailData, setDetailData] =
    useState<SetorDetail | null>(null);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  // ==========================================
  // GENERAL STATE
  // ==========================================

  const [loadingKategori, setLoadingKategori] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================
  // TODAY
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // API CONFIG
  // ==========================================

  const getAuth = () => {
    const token =
      localStorage.getItem("token");

    const appKey =
      localStorage.getItem("appKey");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL;

    return {
      token,
      appKey,
      apiUrl,
    };
  };

  // ==========================================
  // GET KATEGORI SAMPAH
  // ==========================================

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        setLoadingKategori(true);
        setError("");

        const {
          token,
          appKey,
          apiUrl,
        } = getAuth();

        if (!token || !appKey) {
          router.replace(
            "/nasabah-login"
          );
          return;
        }

        if (!apiUrl) {
          throw new Error(
            "NEXT_PUBLIC_API_URL belum tersedia."
          );
        }

        const response =
          await fetch(
            `${apiUrl}/api/v1/kategori-sampah`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
                "x-app-key": appKey,
                Authorization:
                  `Bearer ${token}`,
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
            "Response kategori bukan JSON:",
            text
          );

          throw new Error(
            `Response API tidak valid (${response.status}).`
          );
        }

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result?.message ||
              "Gagal mengambil kategori sampah."
          );
        }

        /*
         * Beberapa API mengembalikan:
         * data: [...]
         *
         * Ada juga yang:
         * data: { items: [...] }
         *
         * Kita dukung keduanya.
         */

        const rawData =
          result.data;

        if (
          Array.isArray(rawData)
        ) {
          setKategori(
            rawData
          );
        } else if (
          Array.isArray(
            rawData?.items
          )
        ) {
          setKategori(
            rawData.items
          );
        } else {
          setKategori([]);
        }
      } catch (err) {
        console.error(
          "GET KATEGORI ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil kategori sampah."
        );
      } finally {
        setLoadingKategori(
          false
        );
      }
    };

    fetchKategori();
  }, [router]);

  // ==========================================
  // GET DETAIL
  // ==========================================

  useEffect(() => {
    const fetchDetail =
      async () => {
        if (!detailId) {
          setDetailData(null);
          return;
        }

        try {
          setLoadingDetail(true);
          setError("");

          const {
            token,
            appKey,
            apiUrl,
          } = getAuth();

          if (!token || !appKey) {
            router.replace(
              "/nasabah-login"
            );
            return;
          }

          if (!apiUrl) {
            throw new Error(
              "NEXT_PUBLIC_API_URL belum tersedia."
            );
          }

          const response =
            await fetch(
              `${apiUrl}/api/v1/setor-sampah/${detailId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type":
                    "application/json",
                  "x-app-key":
                    appKey,
                  Authorization:
                    `Bearer ${token}`,
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
              "Response detail bukan JSON:",
              text
            );

            throw new Error(
              `Response API tidak valid (${response.status}).`
            );
          }

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result?.message ||
                "Gagal mengambil detail penyetoran."
            );
          }

          setDetailData(
            result.data
          );
        } catch (err) {
          console.error(
            "GET DETAIL SETOR ERROR:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Gagal mengambil detail penyetoran."
          );
        } finally {
          setLoadingDetail(
            false
          );
        }
      };

    fetchDetail();
  }, [detailId, router]);

  // ==========================================
  // TAMBAH ITEM SAMPAH
  // ==========================================

  const handleAddItem = () => {
    setError("");

    if (!selectedKategori) {
      setError(
        "Silakan pilih jenis sampah terlebih dahulu."
      );
      return;
    }

    if (!berat) {
      setError(
        "Silakan masukkan estimasi berat sampah."
      );
      return;
    }

    const beratNumber =
      Number(berat);

    if (
      !Number.isFinite(
        beratNumber
      ) ||
      beratNumber <= 0
    ) {
      setError(
        "Berat sampah harus lebih dari 0 kg."
      );
      return;
    }

    const selected =
      kategori.find(
        (item) =>
          item.id ===
          selectedKategori
      );

    if (!selected) {
      setError(
        "Kategori sampah tidak ditemukan."
      );
      return;
    }

    const alreadyExists =
      items.some(
        (item) =>
          item.kategoriSampahId ===
          selected.id
      );

    if (alreadyExists) {
      setError(
        "Jenis sampah tersebut sudah ditambahkan."
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        kategoriSampahId:
          selected.id,
        namaKategori:
          selected.namaKategori,
        jenis:
          selected.jenis,
        beratKg:
          berat,
        hargaPerKg:
          selected.hargaPerKg,
        poinPerKg:
          selected.poinPerKg,
      },
    ]);

    setSelectedKategori("");
    setBerat("");
    setShowPicker(false);
  };

  // ==========================================
  // HAPUS ITEM
  // ==========================================

  const handleRemoveItem = (
    index: number
  ) => {
    setItems((prev) =>
      prev.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  // ==========================================
  // TOTAL BERAT
  // ==========================================

  const totalBerat =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          Number(
            item.beratKg || 0
          ),
        0
      );
    }, [items]);

  // ==========================================
  // TOTAL POIN
  // ==========================================

  const totalPoin =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          Number(
            item.beratKg || 0
          ) *
            item.poinPerKg,
        0
      );
    }, [items]);

  // ==========================================
  // FORMAT POIN
  // ==========================================

  const formatPoin = (
    value: number
  ) => {
    return value.toLocaleString(
      "id-ID",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // TANGGAL WAJIB
    // ========================================

    if (!tanggal) {
      setError(
        "Silakan pilih tanggal penyetoran."
      );
      return;
    }

    // ========================================
    // ITEM WAJIB
    // ========================================

    if (items.length === 0) {
      setError(
        "Tambahkan minimal satu jenis sampah."
      );
      return;
    }

    try {
      setSubmitting(true);

      const {
        token,
        appKey,
        apiUrl,
      } = getAuth();

      if (!token || !appKey) {
        router.replace(
          "/nasabah-login"
        );
        return;
      }

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum tersedia."
        );
      }

      // ======================================
      // BODY API
      // ======================================

      const body = {
        tanggal:
          new Date(
            `${tanggal}T10:00:00`
          ).toISOString(),

        catatan:
          catatan.trim(),

        items: items.map(
          (item) => ({
            kategoriSampahId:
              item.kategoriSampahId,

            beratKg:
              Number(
                item.beratKg
              ),
          })
        ),
      };

      console.log(
        "POST PENGAJUAN:",
        body
      );

      // ======================================
      // POST API
      // ======================================

      const response =
        await fetch(
          `${apiUrl}/api/v1/setor-sampah/pengajuan`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              "x-app-key":
                appKey,
              Authorization:
                `Bearer ${token}`,
            },
            body:
              JSON.stringify(body),
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
          "Response POST bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid (${response.status}).`
        );
      }

      const result =
        await response.json();

      console.log(
        "POST PENGAJUAN RESULT:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        let message =
          result?.message ||
          "Gagal mengajukan penyetoran.";

        if (
          Array.isArray(
            message
          )
        ) {
          message =
            message.join(
              ", "
            );
        }

        throw new Error(
          message
        );
      }

      // ======================================
      // BERHASIL
      // ======================================

      const newId =
        result?.data?.id;

      if (!newId) {
        throw new Error(
          "Pengajuan berhasil dibuat, tetapi ID transaksi tidak dikembalikan oleh API."
        );
      }

      setSuccess(
        result.message ||
          "Pengajuan penyetoran sampah berhasil dibuat."
      );

      // ======================================
      // BERSIHKAN FORM
      // ======================================

      setItems([]);
      setTanggal("");
      setCatatan("");
      setSelectedKategori("");
      setBerat("");
      setShowPicker(false);

      /*
       * Setelah pengajuan berhasil:
       *
       * - Data sudah tersimpan di API
       * - User tetap berada di halaman Setor Sampah
       * - Pesan berhasil ditampilkan
       * - Form dikosongkan
       * - Detail transaksi dapat dibuka
       *   dari halaman Riwayat
       */
    } catch (err) {
      console.error(
        "POST PENGAJUAN ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengajukan penyetoran."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // KEMBALI KE FORM
  // ==========================================

  const handleBackToForm =
    () => {
      setDetailData(null);
      setError("");

      router.push(
        "/nasabah/setor-sampah"
      );
    };

  // ==========================================
  // MODE DETAIL
  // ==========================================

  if (detailId) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {loadingDetail ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-[#2f8135]" />

                <p className="text-[11px] text-[#829087]">
                  Memuat detail
                  penyetoran...
                </p>
              </div>
            </div>
          ) : error &&
            !detailData ? (
            <div>
              <button
                type="button"
                onClick={
                  handleBackToForm
                }
                className="mb-5 flex items-center gap-2 text-[12px] font-medium text-[#66716a] transition hover:text-[#2f8135]"
              >
                <ArrowLeft className="h-4 w-4" />

                Kembali
              </button>

              <div className="rounded-[20px] border border-[#e9caca] bg-[#fff7f7] p-5">
                <div className="flex gap-3">
                  <X className="h-4 w-4 shrink-0 text-[#b76565]" />

                  <p className="text-[11px] leading-relaxed text-[#b76565]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : detailData ? (
            <DetailSetorSampah
              data={detailData}
              onBack={
                handleBackToForm
              }
            />
          ) : null}
        </div>
      </main>
    );
  }

  // ==========================================
  // FORM UTAMA
  // ==========================================

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/nasabah/dashboard"
              )
            }
            className="mb-4 flex items-center gap-2 text-[12px] font-medium text-[#66716a] transition hover:text-[#2f8135]"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#e5f0e2]">
              <Recycle
                className="h-5 w-5 text-[#2f8135]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1 className="text-[23px] font-bold tracking-tight text-[#173c2b]">
                Ajukan Penyetoran
              </h1>

              <p className="mt-0.5 text-[11px] text-[#829087]">
                Masukkan jenis sampah,
                tanggal, dan estimasi
                beratnya.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            SUCCESS
        ====================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#d5e5d1] bg-[#f4f9f2] px-4 py-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2f8135]" />

            <p className="text-[11px] leading-relaxed text-[#2f8135]">
              {success}
            </p>
          </div>
        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#e9caca] bg-[#fff7f7] px-4 py-3">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-[#b76565]" />

            <p className="text-[11px] leading-relaxed text-[#b76565]">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ======================================
              TANGGAL PENYETORAN - WAJIB
          ====================================== */}

          <section className="rounded-[20px] border border-[#e5e0d5] bg-white p-5">
            <label
              htmlFor="tanggal"
              className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#31443a]"
            >
              <CalendarDays className="h-4 w-4 text-[#2f8135]" />

              Tanggal Penyetoran

              <span className="text-[#b76565]">
                *
              </span>
            </label>

            <input
              id="tanggal"
              name="tanggal"
              type="date"
              value={tanggal}
              min={today}
              required
              disabled={submitting}
              onChange={(e) => {
                setTanggal(
                  e.target.value
                );

                setError("");
              }}
              className={`h-11 w-full rounded-xl border bg-white px-3 text-[12px] text-[#31443a] outline-none transition focus:border-[#b9cdb4] focus:ring-2 focus:ring-[#e5f0e2] ${
                !tanggal
                  ? "border-[#ded9d0]"
                  : "border-[#b9cdb4]"
              }`}
            />

            {!tanggal && (
              <p className="mt-2 text-[10px] text-[#b76565]">
                Tanggal penyetoran
                wajib diisi.
              </p>
            )}
          </section>

          {/* ======================================
              PILIH SAMPAH
          ====================================== */}

          <section className="rounded-[20px] border border-[#e5e0d5] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-semibold text-[#31443a]">
                  Pilih Sampah
                </h2>

                <p className="mt-0.5 text-[10px] text-[#929b95]">
                  Tambahkan jenis sampah
                  yang ingin disetor.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPicker(
                    !showPicker
                  )
                }
                disabled={
                  loadingKategori
                }
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#e5f0e2] px-3 py-2 text-[10px] font-semibold text-[#2f8135] transition hover:bg-[#dcebd8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />

                Tambah Sampah
              </button>
            </div>

            {/* PICKER */}

            {showPicker && (
              <div className="mb-5 rounded-[16px] border border-[#e5e0d5] bg-[#faf9f6] p-4">
                {loadingKategori ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-[#2f8135]" />

                    <span className="text-[11px] text-[#829087]">
                      Memuat jenis
                      sampah...
                    </span>
                  </div>
                ) : kategori.length ===
                  0 ? (
                  <div className="py-5 text-center">
                    <p className="text-[11px] text-[#829087]">
                      Belum ada
                      kategori sampah.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">

                    {/* JENIS */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium text-[#66716a]">
                        Jenis Sampah
                      </label>

                      <div className="relative">
                        <select
                          value={
                            selectedKategori
                          }
                          onChange={(e) =>
                            setSelectedKategori(
                              e.target.value
                            )
                          }
                          className="h-11 w-full appearance-none rounded-xl border border-[#ded9d0] bg-white px-3 pr-9 text-[11px] text-[#31443a] outline-none focus:border-[#b9cdb4] focus:ring-2 focus:ring-[#e5f0e2]"
                        >
                          <option value="">
                            Pilih jenis
                            sampah
                          </option>

                          {kategori.map(
                            (item) => (
                              <option
                                key={
                                  item.id
                                }
                                value={
                                  item.id
                                }
                              >
                                {
                                  item.namaKategori
                                }{" "}
                                —{" "}
                                {
                                  item.poinPerKg
                                }{" "}
                                poin/kg
                              </option>
                            )
                          )}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829087]" />
                      </div>
                    </div>

                    {/* BERAT */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium text-[#66716a]">
                        Estimasi Berat
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={berat}
                          onChange={(e) =>
                            setBerat(
                              e.target.value
                            )
                          }
                          placeholder="Masukkan berat"
                          className="h-11 w-full rounded-xl border border-[#ded9d0] bg-white px-3 pr-12 text-[11px] text-[#31443a] outline-none placeholder:text-[#aaa49c] focus:border-[#b9cdb4] focus:ring-2 focus:ring-[#e5f0e2]"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#829087]">
                          kg
                        </span>
                      </div>
                    </div>

                    {/* TAMBAHKAN */}
                    <button
                      type="button"
                      onClick={
                        handleAddItem
                      }
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2f8135] text-[11px] font-semibold text-white transition hover:bg-[#276d2c]"
                    >
                      <Plus className="h-4 w-4" />

                      Tambahkan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ITEM LIST */}

            {items.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#dcd8cf] bg-[#fcfbf8] px-5 py-8 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e5f0e2]">
                  <Recycle
                    className="h-5 w-5 text-[#2f8135]"
                    strokeWidth={1.7}
                  />
                </div>

                <p className="text-[12px] font-medium text-[#66716a]">
                  Belum ada sampah
                  dipilih
                </p>

                <p className="mt-1 text-[10px] text-[#a3aaa3]">
                  Klik "Tambah
                  Sampah" untuk
                  menambahkan.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.kategoriSampahId}-${index}`}
                      className="flex items-center gap-3 rounded-[15px] border border-[#e8e4da] bg-[#fcfbf8] p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f0e2]">
                        <Recycle
                          className="h-[18px] w-[18px] text-[#2f8135]"
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-[#31443a]">
                          {
                            item.namaKategori
                          }
                        </p>

                        <p className="mt-0.5 text-[9px] capitalize text-[#929b95]">
                          {item.jenis} •
                          Rp{" "}
                          {item.hargaPerKg.toLocaleString(
                            "id-ID"
                          )}
                          /kg
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-[#31443a]">
                          {
                            item.beratKg
                          }{" "}
                          kg
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#2f8135]">
                          +
                          {formatPoin(
                            Number(
                              item.beratKg
                            ) *
                              item.poinPerKg
                          )}{" "}
                          poin
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveItem(
                            index
                          )
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#a45b5b] transition hover:bg-[#f9eeee]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* ======================================
              ESTIMASI TOTAL
          ====================================== */}

          {items.length > 0 && (
            <section className="rounded-[20px] border border-[#dce8d9] bg-[#e5f0e2] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-[#66805e]">
                    Total Estimasi
                    Berat
                  </p>

                  <p className="mt-1 text-[15px] font-semibold text-[#173c2b]">
                    {formatPoin(
                      totalBerat
                    )}{" "}
                    kg
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-[#66805e]">
                    Estimasi Total
                    Poin
                  </p>

                  <p className="mt-1 text-[20px] font-bold text-[#2f8135]">
                    {formatPoin(
                      totalPoin
                    )}{" "}
                    Poin
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ======================================
              CATATAN
          ====================================== */}

          <section className="rounded-[20px] border border-[#e5e0d5] bg-white p-5">
            <label className="mb-2 block text-[11px] font-semibold text-[#31443a]">
              Catatan{" "}
              <span className="font-normal text-[#a3aaa3]">
                (opsional)
              </span>
            </label>

            <textarea
              value={catatan}
              onChange={(e) =>
                setCatatan(
                  e.target.value
                )
              }
              rows={4}
              placeholder="Contoh: Sampah sudah dipilah rapi dalam karung."
              className="w-full resize-none rounded-xl border border-[#ded9d0] bg-white px-3 py-3 text-[11px] leading-relaxed text-[#31443a] outline-none placeholder:text-[#aaa49c] focus:border-[#b9cdb4] focus:ring-2 focus:ring-[#e5f0e2]"
            />
          </section>

          {/* ======================================
              SUBMIT
          ====================================== */}

          <button
            type="submit"
            disabled={
              submitting ||
              items.length === 0 ||
              !tanggal
            }
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2f8135] text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#276d2c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Mengajukan...
              </>
            ) : (
              <>
                Ajukan Penyetoran

                <Check className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}