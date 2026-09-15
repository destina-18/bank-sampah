"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  XCircle,
  Recycle,
} from "lucide-react";

type DetailSetor = {
  id: string;
  kodeSetor: string;
  nasabah: {
    namaNasabah: string;
  };
  totalBeratKg: number;
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

export default function DeleteSetorSampahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<DetailSetor | null>(null);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
            result?.message || "Gagal mengambil data transaksi."
          );
        }

        setData(result.data);
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

  async function handleReject() {
    if (!id) return;

    if (!catatan.trim()) {
      setError("Berikan alasan penolakan terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${getBaseUrl()}/api/v1/setor-sampah/admin/verify/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-app-key": getAppKey(),
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            status: "ditolak",
            catatanAdmin: catatan.trim(),
            itemsReal: [],
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Gagal menolak pengajuan."
        );
      }

      router.push(`/admin/setor-sampah/detail?id=${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menolak pengajuan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 md:px-10">
        <div className="mx-auto max-w-xl">
          <div className="h-7 w-40 animate-pulse rounded bg-[#e9e2d9]" />
          <div className="mt-7 h-96 animate-pulse rounded-2xl bg-[#eee8df]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 text-[#403c36] md:px-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/admin/setor-sampah"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#746c61] hover:text-[#4d4841]"
        >
          <ArrowLeft size={17} />
          Kembali
        </Link>

        <div className="rounded-2xl border border-[#ead5cf] bg-[#fffdfb] p-6 shadow-[0_6px_25px_rgba(86,72,52,0.05)] md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8e9e5] text-[#a55e52]">
            <AlertTriangle size={26} />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-xl font-semibold text-[#49443d]">
              Tolak Pengajuan Setoran?
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#90877c]">
              Pengajuan akan berubah menjadi status{" "}
              <span className="font-medium text-[#a55e52]">Ditolak</span>.
              Tindakan ini digunakan untuk menolak pengajuan, bukan menghapus
              data transaksi.
            </p>
          </div>

          {data && (
            <div className="mt-6 rounded-xl border border-[#e8e0d6] bg-[#faf7f2] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eee8df] text-[#777065]">
                  <Recycle size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#4e4941]">
                    {data.kodeSetor}
                  </p>
                  <p className="mt-0.5 text-xs text-[#968d82]">
                    {data.nasabah.namaNasabah} • {data.totalBeratKg} kg
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="text-sm font-medium text-[#554f47]">
              Alasan Penolakan
            </label>

            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              placeholder="Tuliskan alasan mengapa pengajuan ditolak..."
              className="mt-2 w-full resize-none rounded-xl border border-[#e1d8ce] bg-[#faf7f2] p-3.5 text-sm outline-none placeholder:text-[#aaa196] focus:border-[#c78e83] focus:bg-white"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-[#e7cbc5] bg-[#fbefec] p-3.5 text-sm text-[#a55e52]">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/setor-sampah"
              className="flex h-11 items-center justify-center rounded-xl border border-[#ded6cc] bg-white text-sm font-medium text-[#756d63] transition hover:bg-[#f5f0e9]"
            >
              Batal
            </Link>

            <button
              onClick={handleReject}
              disabled={submitting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#a55e52] text-sm font-medium text-white transition hover:bg-[#934f45] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Menolak...
                </>
              ) : (
                <>
                  <XCircle size={17} />
                  Tolak Pengajuan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}