"use client";

import { useEffect, useState } from "react";

type Props = {
  id: string;
  onBack: () => void;
  onSuccess: () => void;
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

export default function EditHadiah({
  id,
  onBack,
  onSuccess,
}: Props) {
  const [namaHadiah, setNamaHadiah] = useState("");
  const [poinDibutuhkan, setPoinDibutuhkan] =
    useState("");
  const [stok, setStok] = useState("");

  const [fotoLama, setFotoLama] = useState("");
  const [fotoBaru, setFotoBaru] =
    useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
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
              "Gagal mengambil data hadiah."
          );
        }

        const data = result?.data;

        setNamaHadiah(data?.namaHadiah || "");

        setPoinDibutuhkan(
          String(
            data?.poinDibutuhkan ?? ""
          )
        );

        setStok(
          String(data?.stok ?? "")
        );

        setFotoLama(data?.foto || "");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data hadiah."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

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
      setSaving(true);
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

      if (fotoBaru) {
        formData.append("foto", fotoBaru);
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
        `${API_BASE}/api/v1/hadiah/${id}`,
        {
          method: "PUT",
          headers,
          body: formData,
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
            `Gagal memperbarui hadiah (${response.status})`
        );
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui hadiah."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef]">
        <p className="text-sm text-gray-500">
          Memuat data...
        </p>
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

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-[#25352b]">
            Edit Hadiah
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Perbarui data hadiah.
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62]"
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62]"
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#557a62]"
                />
              </div>
            </div>

            {fotoLama && (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Foto Saat Ini
                </p>

                <img
                  src={fotoLama}
                  alt={namaHadiah}
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ganti Foto
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFotoBaru(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#557a62] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}