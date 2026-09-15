"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Scale,
  Recycle,
  Save,
  Loader2,
  AlertCircle,
  CircleUserRound,
} from "lucide-react";

type DetailSetor = {
  id: string;
  kodeSetor: string;
  tanggal: string;
  status: string;
  nasabah: {
    namaNasabah: string;
    telp: string;
  };
  totalBeratKg: number;
  totalPoin: number;
  detailSetors: {
    kategoriSampahId?: string;
    kategori?: string;
    jenis?: string;
    beratKg: number;
    poinPerKg?: number;
    subtotalPoin?: number;
    kategoriSampah?: {
      namaKategori: string;
      jenis: string;
    };
  }[];
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
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
  ).replace(/\/$/, "");
}

type RealItem = {
  kategoriSampahId: string;
  namaKategori: string;
  beratAwal: number;
  beratKgReal: string;
};

export default function EditSetorSampahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<DetailSetor | null>(null);
  const [items, setItems] = useState<RealItem[]>([]);
  const [status, setStatus] = useState<"diverifikasi" | "selesai">(
    "selesai"
  );
  const [catatanAdmin, setCatatanAdmin] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("ID transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    async function fetchDetail() {
      try {
        const response = await fetch(
          `${getBaseUrl()}/api/v1/setor-sampah/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-app-key": getAppKey(),
              Authorization: `Bearer ${getToken()}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result?.message || "Gagal mengambil detail transaksi."
          );
        }

        const detail: DetailSetor = result.data;

        setData(detail);

        setItems(
          (detail.detailSetors || []).map((item) => ({
            kategoriSampahId:
              item.kategoriSampahId ||
              "",
            namaKategori:
              item.kategori ||
              item.kategoriSampah?.namaKategori ||
              "Kategori Sampah",
            beratAwal: item.beratKg,
            beratKgReal: String(item.beratKg),
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data transaksi."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  function updateWeight(index: number, value: string) {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              beratKgReal: value,
            }
          : item
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!id) return;

    if (items.some((item) => !item.beratKgReal)) {
      setError("Semua berat real harus diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        status,
        catatanAdmin: catatanAdmin.trim(),
        itemsReal: items.map((item) => ({
          kategoriSampahId: item.kategoriSampahId,
          beratKgReal: Number(item.beratKgReal),
        })),
      };

      const response = await fetch(
        `${getBaseUrl()}/api/v1/setor-sampah/admin/verify/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-app-key": getAppKey(),
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Gagal menyimpan verifikasi."
        );
      }

      router.push(`/admin/setor-sampah/detail?id=${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="h-7 w-40 animate-pulse rounded bg-[#e9e2d9]" />
          <div className="mt-7 h-[500px] animate-pulse rounded-2xl bg-[#eee8df]" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/setor-sampah"
            className="inline-flex items-center gap-2 text-sm text-[#746c61]"
          >
            <ArrowLeft size={17} />
            Kembali
          </Link>

          <div className="mt-6 rounded-2xl border border-[#e8d0ca] bg-[#fffaf8] p-6 text-sm text-[#a55e52]">
            {error || "Data tidak ditemukan."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-7 text-[#403c36] md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/admin/setor-sampah/detail?id=${data.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#746c61] hover:text-[#4d4841]"
        >
          <ArrowLeft size={17} />
          Kembali ke Detail
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-[#938a7e]">
            <Recycle size={15} />
            Setor Sampah
            <span>/</span>
            Verifikasi
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-[#39362f]">
            Verifikasi Setoran
          </h1>

          <p className="mt-1 text-sm text-[#938a7e]">
            Masukkan hasil penimbangan real dari petugas.
          </p>
        </div>

        {/* Nasabah */}
        <section className="mb-5 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eee8df] text-[#766e63]">
              <CircleUserRound size={21} />
            </div>

            <div>
              <p className="text-xs text-[#968d82]">Nasabah</p>
              <h2 className="font-semibold text-[#4b4740]">
                {data.nasabah.namaNasabah}
              </h2>
              <p className="text-xs text-[#9a9186]">{data.kodeSetor}</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          {/* Status */}
          <section className="mb-5 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="mb-5">
              <h2 className="font-semibold text-[#48443d]">
                Status Setoran
              </h2>
              <p className="mt-1 text-xs text-[#999086]">
                Tentukan status setelah dilakukan pemeriksaan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  status === "diverifikasi"
                    ? "border-[#9aaa90] bg-[#f1f5ee]"
                    : "border-[#e7dfd5] bg-[#fcfaf6]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="diverifikasi"
                  checked={status === "diverifikasi"}
                  onChange={() => setStatus("diverifikasi")}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5ede1] text-[#63785a]">
                    <Scale size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#514c44]">
                      Diverifikasi
                    </p>
                    <p className="mt-0.5 text-xs text-[#91887d]">
                      Data sudah diperiksa
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  status === "selesai"
                    ? "border-[#9aaa90] bg-[#f1f5ee]"
                    : "border-[#e7dfd5] bg-[#fcfaf6]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="selesai"
                  checked={status === "selesai"}
                  onChange={() => setStatus("selesai")}
                  className="sr-only"
                />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5ede1] text-[#63785a]">
                    <Recycle size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#514c44]">
                      Selesai
                    </p>
                    <p className="mt-0.5 text-xs text-[#91887d]">
                      Transaksi selesai diproses
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Timbangan */}
          <section className="mb-5 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <div className="mb-5">
              <h2 className="font-semibold text-[#48443d]">
                Hasil Penimbangan
              </h2>
              <p className="mt-1 text-xs text-[#999086]">
                Sesuaikan berat dengan hasil timbangan nyata.
              </p>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#e8e0d6] bg-[#faf7f2] p-4"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_150px_180px] md:items-center">
                    <div>
                      <p className="text-sm font-medium text-[#4d4941]">
                        {item.namaKategori}
                      </p>
                      <p className="mt-1 text-xs text-[#978e83]">
                        Berat pengajuan: {item.beratAwal} kg
                      </p>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs text-[#8d857a]">
                        Berat Awal
                      </p>
                      <div className="flex h-10 items-center rounded-lg border border-[#e5ddd3] bg-white px-3 text-sm text-[#777066]">
                        {item.beratAwal} kg
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-xs font-medium text-[#756d63]">
                        Berat Real
                      </p>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.beratKgReal}
                          onChange={(e) =>
                            updateWeight(index, e.target.value)
                          }
                          className="h-10 w-full rounded-lg border border-[#dcd4ca] bg-white px-3 pr-10 text-sm text-[#4d4941] outline-none focus:border-[#92a285]"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#948b80]">
                          kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Catatan */}
          <section className="mb-5 rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_5px_22px_rgba(86,72,52,0.04)]">
            <label className="text-sm font-semibold text-[#4b4740]">
              Catatan Admin
            </label>

            <textarea
              value={catatanAdmin}
              onChange={(e) => setCatatanAdmin(e.target.value)}
              rows={4}
              placeholder="Contoh: Berat sampah sesuai hasil timbangan real petugas."
              className="mt-3 w-full resize-none rounded-xl border border-[#e2dad0] bg-[#faf7f2] p-3.5 text-sm text-[#4d4941] outline-none transition placeholder:text-[#aaa196] focus:border-[#9baa91] focus:bg-white"
            />
          </section>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#e7cbc5] bg-[#fbefec] p-4 text-sm text-[#a55e52]">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/admin/setor-sampah/detail?id=${data.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[#ded6cc] bg-[#fffdf9] px-5 text-sm font-medium text-[#756d63] transition hover:bg-[#f4efe8]"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#718467] px-6 text-sm font-medium text-white transition hover:bg-[#607456] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Simpan Verifikasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}