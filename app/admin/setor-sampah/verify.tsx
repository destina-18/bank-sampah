"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Loader2,
  Package,
  Scale,
  UserRound,
  AlertCircle,
  XCircle,
} from "lucide-react";

type DetailSetor = {
  id?: string;
  kategoriSampahId?: string;

  kategori?: string;
  jenis?: string;

  kategoriSampah?: {
    id?: string;
    namaKategori?: string;
    jenis?: string;
  };

  beratKg?: number;
  poinPerKg?: number;
  subtotalPoin?: number;
};

type SetorDetail = {
  id: string;
  kodeSetor?: string;
  tanggal?: string;
  status?: string;

  nasabah?: {
    namaNasabah?: string;
    telp?: string;
    alamat?: string;
  };

  totalBeratKg?: number;
  totalPoin?: number;
  estimasiTotalPoin?: number;

  catatan?: string;
  catatanAdmin?: string;

  detailSetors?: DetailSetor[];
};

type RealItem = {
  kategoriSampahId: string;
  beratKgReal: string;
};

type VerifyProps = {
  id: string;
  onBack: () => void;
};

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

function formatTanggal(tanggal?: string) {
  if (!tanggal) {
    return "-";
  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatNumber(value?: number) {
  return new Intl.NumberFormat(
    "id-ID"
  ).format(Number(value || 0));
}

function getKategoriId(
  item: DetailSetor
) {
  return (
    item.kategoriSampahId ||
    item.kategoriSampah?.id ||
    ""
  );
}

function getNamaKategori(
  item: DetailSetor
) {
  return (
    item.kategori ||
    item.kategoriSampah
      ?.namaKategori ||
    "Kategori Sampah"
  );
}

function getJenis(item: DetailSetor) {
  return (
    item.jenis ||
    item.kategoriSampah?.jenis ||
    "-"
  );
}

function getStatusLabel(
  status?: string
) {
  switch (status) {
    case "menunggu_konfirmasi":
      return "Menunggu Konfirmasi";

    case "diverifikasi":
      return "Diverifikasi";

    case "selesai":
      return "Selesai";

    case "ditolak":
      return "Ditolak";

    default:
      return status || "-";
  }
}

export default function VerifySetorSampah({
  id,
  onBack,
}: VerifyProps) {
  const [data, setData] =
    useState<SetorDetail | null>(
      null
    );

  const [realItems, setRealItems] =
    useState<RealItem[]>([]);

  const [status, setStatus] =
    useState("selesai");

  const [catatanAdmin, setCatatanAdmin] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ============================
     GET DETAIL
  ============================ */
  const fetchDetail =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const baseUrl = getBaseUrl();

        if (!baseUrl) {
          throw new Error(
            "NEXT_PUBLIC_BASE_API_URL belum diatur di file .env.local"
          );
        }

        const response =
          await fetch(
            `${baseUrl}/api/v1/setor-sampah/${encodeURIComponent(
              id
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
                "x-app-key":
                  getAppKey(),
                Authorization:
                  `Bearer ${getToken()}`,
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
            `Server mengembalikan response tidak valid (${response.status}).`
          );
        }

        const result =
          await response.json();

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.message ||
              "Gagal mengambil detail setor sampah."
          );
        }

        const detail =
          result.data || result;

        setData(detail);

        /*
         * Default status ketika
         * pengajuan masih menunggu
         */
        if (
          detail.status ===
          "menunggu_konfirmasi"
        ) {
          setStatus("selesai");
        } else {
          setStatus(
            detail.status ||
              "selesai"
          );
        }

        /*
         * Isi berat real awal
         * menggunakan berat estimasi.
         *
         * Admin tetap bisa mengubahnya.
         */
        const details =
          detail.detailSetors ||
          [];

        setRealItems(
          details.map(
            (
              item: DetailSetor
            ) => ({
              kategoriSampahId:
                getKategoriId(
                  item
                ),

              beratKgReal:
                item.beratKg !==
                  undefined &&
                item.beratKg !==
                  null
                  ? String(
                      item.beratKg
                    )
                  : "",
            })
          )
        );

        setCatatanAdmin(
          detail.catatanAdmin ||
            ""
        );
      } catch (err) {
        console.error(
          "FETCH DETAIL ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail transaksi."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /* ============================
     UPDATE BERAT REAL
  ============================ */
  function handleWeightChange(
    index: number,
    value: string
  ) {
    setRealItems(
      (current) =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  beratKgReal:
                    value,
                }
              : item
        )
    );
  }

  /* ============================
     SUBMIT VERIFY
  ============================ */
  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!data) {
      setError(
        "Data transaksi belum tersedia."
      );
      return;
    }

    /*
     * Kalau status bukan ditolak,
     * semua berat real wajib diisi.
     */
    if (status !== "ditolak") {
      const invalid =
        realItems.some(
          (item) =>
            !item.kategoriSampahId ||
            item.beratKgReal === "" ||
            Number.isNaN(
              Number(
                item.beratKgReal
              )
            ) ||
            Number(
              item.beratKgReal
            ) < 0
        );

      if (invalid) {
        setError(
          "Pastikan semua berat real sudah diisi dengan benar."
        );

        return;
      }
    }

    try {
      setSubmitting(true);

      const baseUrl = getBaseUrl();

      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_BASE_API_URL belum diatur di file .env.local"
        );
      }

      /*
       * BODY SESUAI API
       */
      const body = {
        status,

        catatanAdmin:
          catatanAdmin.trim(),

        itemsReal:
          status === "ditolak"
            ? []
            : realItems.map(
                (item) => ({
                  kategoriSampahId:
                    item.kategoriSampahId,

                  beratKgReal:
                    Number(
                      item.beratKgReal
                    ),
                })
              ),
      };

      console.log(
        "BODY VERIFIKASI:",
        body
      );

      const response =
        await fetch(
          `${baseUrl}/api/v1/setor-sampah/admin/verify/${encodeURIComponent(
            id
          )}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",

              "x-app-key":
                getAppKey(),

              Authorization:
                `Bearer ${getToken()}`,
            },

            body: JSON.stringify(
              body
            ),
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
          "Response verify bukan JSON:",
          text
        );

        throw new Error(
          `Server mengembalikan response tidak valid (${response.status}).`
        );
      }

      const result =
        await response.json();

      console.log(
        "HASIL VERIFIKASI:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        let message =
          result?.message ||
          "Gagal melakukan verifikasi.";

        if (
          Array.isArray(message)
        ) {
          message =
            message.join(", ");
        }

        throw new Error(message);
      }

      setSuccess(
        result?.message ||
          "Setor sampah berhasil diverifikasi."
      );

      /*
       * Kembali ke list
       * setelah berhasil
       */
      setTimeout(() => {
        onBack();
      }, 1200);
    } catch (err) {
      console.error(
        "VERIFY ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Gagal melakukan verifikasi."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================
     LOADING
  ============================ */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-8 lg:px-10">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={32}
              className="animate-spin text-[#718467]"
            />

            <p className="text-sm text-[#8c847a]">
              Memuat detail setor sampah...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ============================
     ERROR
  ============================ */
  if (!data) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#718467] transition hover:text-[#607456]"
          >
            <ArrowLeft size={17} />
            Kembali ke Setor Sampah
          </button>

          <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-10 text-center shadow-sm">
            <XCircle
              size={42}
              className="mx-auto mb-3 text-[#a55e52]"
            />

            <h2 className="text-lg font-semibold text-[#403c36]">
              Detail tidak dapat dimuat
            </h2>

            <p className="mt-2 text-sm text-[#8c847a]">
              {error ||
                "Data transaksi tidak ditemukan."}
            </p>

            <button
              type="button"
              onClick={fetchDetail}
              className="mt-5 rounded-xl bg-[#718467] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#607456]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  const details =
    data.detailSetors || [];

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-7 text-[#403c36] md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#718467] transition hover:text-[#607456]"
          >
            <ArrowLeft size={17} />
            Kembali ke Setor Sampah
          </button>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8b8277]">
              <ClipboardCheck
                size={16}
              />

              <span>Admin</span>

              <span>/</span>

              <span>
                Setor Sampah
              </span>

              <span>/</span>

              <span>
                Verifikasi
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#38352f] md:text-3xl">
              Verifikasi Setor Sampah
            </h1>

            <p className="mt-1 text-sm text-[#8c847a]">
              Periksa pengajuan dan
              masukkan hasil penimbangan
              real.
            </p>
          </div>
        </div>

        {/* ================= ALERT ERROR ================= */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#e9c9c2] bg-[#fbefec] px-4 py-3 text-sm text-[#a55e52]">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Verifikasi gagal
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================= ALERT SUCCESS ================= */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#cbdcc5] bg-[#edf5ea] px-4 py-3 text-sm text-[#4f7045]">
            <CheckCircle2
              size={18}
            />

            <div>
              <p className="font-semibold">
                Berhasil
              </p>

              <p className="mt-0.5">
                {success}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* ==================================================
              BAGIAN KIRI
          ================================================== */}
          <div className="space-y-6">
            {/* INFORMASI NASABAH */}
            <section className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
              <div className="border-b border-[#eee7de] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f1e6] text-[#5d7652]">
                    <UserRound
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#403c36]">
                      Informasi Nasabah
                    </h2>

                    <p className="mt-0.5 text-xs text-[#948b80]">
                      Data pemilik
                      pengajuan
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#948b80]">
                    Nama Nasabah
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#403c36]">
                    {data.nasabah
                      ?.namaNasabah ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#948b80]">
                    Nomor Telepon
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#403c36]">
                    {data.nasabah
                      ?.telp || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#948b80]">
                    Kode Setor
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#403c36]">
                    {data.kodeSetor ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#948b80]">
                    Tanggal Pengajuan
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#403c36]">
                    <CalendarDays
                      size={15}
                      className="text-[#718467]"
                    />

                    {formatTanggal(
                      data.tanggal
                    )}
                  </div>
                </div>

                {data.nasabah
                  ?.alamat && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-[#948b80]">
                      Alamat
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#5d574f]">
                      {
                        data
                          .nasabah
                          .alamat
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* DETAIL SAMPAH */}
            <section className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
              <div className="border-b border-[#eee7de] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1eadf] text-[#8d704e]">
                      <Scale
                        size={19}
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-[#403c36]">
                        Penimbangan
                        Sampah
                      </h2>

                      <p className="mt-0.5 text-xs text-[#948b80]">
                        Masukkan berat
                        real hasil
                        timbangan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {details.length ===
                0 ? (
                  <div className="rounded-xl border border-dashed border-[#ddd5ca] bg-[#faf7f2] p-8 text-center">
                    <Package
                      size={30}
                      className="mx-auto mb-2 text-[#aaa197]"
                    />

                    <p className="text-sm text-[#8c847a]">
                      Tidak ada
                      detail sampah.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {details.map(
                      (
                        item,
                        index
                      ) => {
                        const realItem =
                          realItems[
                            index
                          ];

                        return (
                          <div
                            key={
                              item.id ||
                              `${getKategoriId(
                                item
                              )}-${index}`
                            }
                            className="rounded-2xl border border-[#e8e0d6] bg-[#faf7f2] p-4"
                          >
                            {/* NAMA */}
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-[#403c36]">
                                  {getNamaKategori(
                                    item
                                  )}
                                </p>

                                <p className="mt-1 text-xs capitalize text-[#948b80]">
                                  Jenis:{" "}
                                  {getJenis(
                                    item
                                  )}
                                </p>
                              </div>

                              <span className="rounded-lg bg-white px-2.5 py-1 text-xs text-[#827a70]">
                                Item{" "}
                                {index +
                                  1}
                              </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              {/* ESTIMASI */}
                              <div className="rounded-xl border border-[#e5ddd3] bg-white p-4">
                                <p className="text-xs text-[#948b80]">
                                  Berat
                                  Estimasi
                                </p>

                                <p className="mt-1 text-lg font-semibold text-[#403c36]">
                                  {formatNumber(
                                    item.beratKg
                                  )}{" "}
                                  kg
                                </p>
                              </div>

                              {/* REAL */}
                              <div className="rounded-xl border border-[#d5e1d0] bg-[#f1f5ef] p-4">
                                <label className="text-xs font-medium text-[#64755e]">
                                  Berat
                                  Real
                                </label>

                                <div className="mt-1 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      realItem
                                        ?.beratKgReal ||
                                      ""
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      handleWeightChange(
                                        index,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    placeholder="0"
                                    disabled={
                                      status ===
                                      "ditolak"
                                    }
                                    className="h-10 w-full rounded-lg border border-[#d7e0d3] bg-white px-3 text-sm font-semibold text-[#403c36] outline-none transition focus:border-[#718467] focus:ring-2 focus:ring-[#718467]/10 disabled:cursor-not-allowed disabled:bg-[#eeeae4]"
                                  />

                                  <span className="text-sm text-[#7d8679]">
                                    kg
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* POIN */}
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                              <span className="text-xs text-[#948b80]">
                                Poin estimasi
                              </span>

                              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#98752d]">
                                <Coins
                                  size={15}
                                />

                                {formatNumber(
                                  item.subtotalPoin
                                )}{" "}
                                poin
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* TOTAL */}
              <div className="border-t border-[#eee7de] bg-[#faf7f2] px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#948b80]">
                      Total Berat
                      Estimasi
                    </p>

                    <p className="mt-1 text-xl font-semibold text-[#403c36]">
                      {formatNumber(
                        data.totalBeratKg
                      )}{" "}
                      kg
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#948b80]">
                      Total Poin
                    </p>

                    <p className="mt-1 text-xl font-semibold text-[#98752d]">
                      {formatNumber(
                        data.totalPoin ??
                          data.estimasiTotalPoin
                      )}{" "}
                      poin
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CATATAN NASABAH */}
            {data.catatan && (
              <section className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
                <h2 className="mb-3 font-semibold text-[#403c36]">
                  Catatan Nasabah
                </h2>

                <div className="rounded-xl bg-[#f4efe8] p-4 text-sm leading-6 text-[#6f675f]">
                  {data.catatan}
                </div>
              </section>
            )}
          </div>

          {/* ==================================================
              BAGIAN KANAN
          ================================================== */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="sticky top-6 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] shadow-[0_6px_25px_rgba(86,72,52,0.05)]"
            >
              <div className="border-b border-[#eee7de] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f1e6] text-[#5d7652]">
                    <ClipboardCheck
                      size={19}
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#403c36]">
                      Verifikasi
                    </h2>

                    <p className="mt-0.5 text-xs text-[#948b80]">
                      Konfirmasi
                      pengajuan
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                {/* STATUS */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#504a42]">
                    Status Setoran
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#e0d8ce] bg-white px-3 text-sm text-[#403c36] outline-none transition focus:border-[#718467] focus:ring-2 focus:ring-[#718467]/10"
                  >
                    <option value="selesai">
                      Selesai
                    </option>

                    <option value="diverifikasi">
                      Diverifikasi
                    </option>
                    
                    <option value="ditolak">
                      Ditolak
                    </option>
                  </select>
                </div>

                {/* CATATAN ADMIN */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#504a42]">
                    Catatan Admin
                  </label>

                  <textarea
                    value={
                      catatanAdmin
                    }
                    onChange={(e) =>
                      setCatatanAdmin(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Contoh: Berat sampah sesuai hasil timbangan real petugas."
                    className="w-full resize-none rounded-xl border border-[#e0d8ce] bg-white px-3 py-3 text-sm leading-6 text-[#403c36] outline-none transition placeholder:text-[#aaa196] focus:border-[#718467] focus:ring-2 focus:ring-[#718467]/10"
                  />
                </div>

                {/* SUMMARY */}
                <div className="rounded-xl bg-[#f4efe8] p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#948b80]">
                    Ringkasan
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#817971]">
                        Kode Setor
                      </span>

                      <span className="text-sm font-semibold text-[#403c36]">
                        {data.kodeSetor ||
                          "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#817971]">
                        Berat
                        Estimasi
                      </span>

                      <span className="text-sm font-semibold text-[#403c36]">
                        {formatNumber(
                          data.totalBeratKg
                        )}{" "}
                        kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#817971]">
                        Jumlah Item
                      </span>

                      <span className="text-sm font-semibold text-[#403c36]">
                        {
                          details.length
                        }{" "}
                        item
                      </span>
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="rounded-xl border border-[#e4ddd3] bg-[#faf7f2] p-3.5">
                  <div className="flex gap-2.5">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[#8d8275]"
                    />

                    <p className="text-xs leading-5 text-[#817971]">
                      Periksa berat real
                      dengan teliti sebelum
                      menyimpan verifikasi.
                    </p>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#718467] px-5 text-sm font-medium text-white transition hover:bg-[#607456] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />

                      Simpan Verifikasi
                    </>
                  )}
                </button>

                {/* BATAL */}
                <button
                  type="button"
                  onClick={onBack}
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border border-[#e0d8ce] bg-white px-5 text-sm font-medium text-[#6f675f] transition hover:bg-[#f7f3ed] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}