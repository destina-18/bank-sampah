"use client";

import { useEffect, useState } from "react";

type Hadiah = {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string;
};

type Props = {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/+$/, "");

function getAuth() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    "";

  const appKey =
    localStorage.getItem("appKey") ||
    localStorage.getItem("app_key") ||
    "";

  return {
    token,
    appKey,
  };
}

export default function DetailHadiah({
  id,
  onBack,
  onEdit,
}: Props) {
  const [data, setData] =
    useState<Hadiah | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);

        const { token, appKey } = getAuth();

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (appKey) {
          headers["x-app-key"] = appKey;
        }

        if (token) {
          headers["Authorization"] =
            `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_BASE}/api/v1/hadiah/${id}`,
          {
            headers,
            cache: "no-store",
          }
        );

        const text = await response.text();

        let result;

        try {
          result = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            `Server tidak mengembalikan JSON. Status: ${response.status}`
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Gagal mengambil detail hadiah."
          );
        }

        setData(result?.data || null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil detail hadiah."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <p className="text-sm text-gray-500">
          Memuat detail hadiah...
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f7f4ef] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center">
          <p className="text-red-500">
            {error || "Data tidak ditemukan."}
          </p>

          <button
            onClick={onBack}
            className="mt-5 rounded-xl bg-[#557a62] px-5 py-3 text-sm font-semibold text-white"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] p-6 md:p-8">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={onBack}
          className="mb-5 text-sm font-medium text-[#557a62] hover:underline"
        >
          ← Kembali
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {data.foto ? (
            <img
              src={data.foto}
              alt={data.namaHadiah}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-gray-100 text-7xl">
              🎁
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-[#25352b]">
              {data.namaHadiah}
            </h1>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-[#f5faf5] p-5">
                <p className="text-xs text-gray-400">
                  Poin Dibutuhkan
                </p>

                <p className="mt-2 text-2xl font-bold text-[#557a62]">
                  {data.poinDibutuhkan} poin
                </p>
              </div>

              <div className="rounded-xl bg-[#faf7f1] p-5">
                <p className="text-xs text-gray-400">
                  Stok
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-700">
                  {data.stok}
                </p>
              </div>
            </div>

            <button
              onClick={() => onEdit(data.id)}
              className="mt-7 w-full rounded-xl bg-[#557a62] px-5 py-3 text-sm font-semibold text-white hover:bg-[#456851]"
            >
              Edit Hadiah
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}