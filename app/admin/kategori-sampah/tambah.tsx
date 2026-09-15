"use client";

import { useState } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function TambahKategori({
  onClose,
  onSuccess,
}: Props) {
  const [namaKategori, setNamaKategori] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [poinPerKg, setPoinPerKg] = useState("");
  const [jenis, setJenis] = useState("plastik");
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !namaKategori ||
      !hargaPerKg ||
      !poinPerKg ||
      !jenis
    ) {
      alert("Lengkapi semua data terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum ditemukan"
        );
      }

      const formData = new FormData();

      formData.append("namaKategori", namaKategori);
      formData.append("hargaPerKg", hargaPerKg);
      formData.append("poinPerKg", poinPerKg);
      formData.append("jenis", jenis);

      if (foto) {
        formData.append("foto", foto);
      }

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/v1/kategori-sampah`,
        {
          method: "POST",
          headers: {
            "x-app-key": APP_KEY,
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: formData,
        }
      );

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `API mengembalikan response bukan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal menambahkan kategori"
        );
      }

      alert("Kategori sampah berhasil ditambahkan");

      onSuccess();
    } catch (error) {
      console.error("Tambah kategori:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan kategori sampah"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Tambah Kategori
            </h2>

            <p className="text-sm text-gray-500">
              Tambahkan kategori sampah baru
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Nama Kategori
            </label>

            <input
              type="text"
              value={namaKategori}
              onChange={(e) =>
                setNamaKategori(e.target.value)
              }
              placeholder="Contoh: Botol Plastik PET"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#52796f] focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Harga / Kg
              </label>

              <input
                type="number"
                min="0"
                value={hargaPerKg}
                onChange={(e) =>
                  setHargaPerKg(e.target.value)
                }
                placeholder="3500"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#52796f] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Poin / Kg
              </label>

              <input
                type="number"
                min="0"
                value={poinPerKg}
                onChange={(e) =>
                  setPoinPerKg(e.target.value)
                }
                placeholder="10"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#52796f] focus:ring-2 focus:ring-green-100"
              />
            </div>

          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Jenis Sampah
            </label>

            <select
              value={jenis}
              onChange={(e) =>
                setJenis(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#52796f]"
            >
              <option value="plastik">
                Plastik
              </option>
              <option value="kertas">
                Kertas
              </option>
              <option value="logam">
                Logam
              </option>
              <option value="kaca">
                Kaca
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Foto
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFoto(
                  e.target.files?.[0] || null
                )
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />

            <p className="mt-1 text-xs text-gray-400">
              Foto bersifat opsional
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#52796f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3f6259] disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : "Simpan"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}