"use client";

import { useState } from "react";

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/+$/, "");

function getAuth() {
  let token = "";
  let appKey = "";

  if (typeof document !== "undefined") {
    const cookies = document.cookie.split(";");

    const getCookie = (names: string[]) => {
      for (const name of names) {
        const cookie = cookies.find((item) =>
          item.trim().startsWith(`${name}=`)
        );

        if (cookie) {
          return decodeURIComponent(
            cookie.split("=")[1] || ""
          );
        }
      }

      return "";
    };

    token = getCookie([
      "token",
      "access_token",
      "accessToken",
      "jwt",
    ]);

    appKey = getCookie([
      "appKey",
      "app_key",
      "x-app-key",
    ]);
  }

  if (!token) {
    token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      "";
  }

  if (!appKey) {
    appKey =
      localStorage.getItem("appKey") ||
      localStorage.getItem("app_key") ||
      "";
  }

  return {
    token,
    appKey,
  };
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server tidak mengembalikan JSON. Status: ${response.status}`
    );
  }
}

export default function TambahHadiah({
  onBack,
  onSuccess,
}: Props) {
  const [namaHadiah, setNamaHadiah] = useState("");
  const [poinDibutuhkan, setPoinDibutuhkan] = useState("");
  const [stok, setStok] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!namaHadiah.trim()) {
      setError("Nama hadiah wajib diisi.");
      return;
    }

    if (!poinDibutuhkan) {
      setError("Poin dibutuhkan wajib diisi.");
      return;
    }

    if (!stok) {
      setError("Stok wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { token, appKey } = getAuth();

      const formData = new FormData();

      formData.append(
        "namaHadiah",
        namaHadiah.trim()
      );

      formData.append(
        "poinDibutuhkan",
        String(Number(poinDibutuhkan))
      );

      formData.append(
        "stok",
        String(Number(stok))
      );

      if (foto) {
        formData.append("foto", foto);
      }

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
        `${API_BASE}/api/v1/hadiah`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Gagal menambahkan hadiah (${response.status})`
        );
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan hadiah."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] p-6 md:p-8">
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-medium text-[#557a62] hover:underline"
        >
          ← Kembali
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-[#25352b]">
            Tambah Hadiah
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Tambahkan barang atau voucher baru.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Hadiah
              </label>

              <input
                type="text"
                value={namaHadiah}
                onChange={(e) =>
                  setNamaHadiah(e.target.value)
                }
                placeholder="Contoh: Gula Pasir 1 Kg"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62] focus:ring-2 focus:ring-[#557a62]/10"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Poin Dibutuhkan
                </label>

                <input
                  type="number"
                  min="0"
                  value={poinDibutuhkan}
                  onChange={(e) =>
                    setPoinDibutuhkan(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: 100"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62] focus:ring-2 focus:ring-[#557a62]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Stok
                </label>

                <input
                  type="number"
                  min="0"
                  value={stok}
                  onChange={(e) =>
                    setStok(e.target.value)
                  }
                  placeholder="Contoh: 50"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62] focus:ring-2 focus:ring-[#557a62]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Foto Hadiah
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFoto(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-gray-400">
                Foto bersifat opsional.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#557a62] px-6 py-3 text-sm font-semibold text-white hover:bg-[#456851] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Menyimpan..."
                  : "Simpan Hadiah"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}