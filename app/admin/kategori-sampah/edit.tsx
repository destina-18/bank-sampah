"use client";

import { useState } from "react";
import type { Kategori } from "./page";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

type Props = {
  data: Kategori;
  onClose: () => void;
  onSuccess: (updatedData: Kategori) => void;
};

export default function EditKategori({
  data,
  onClose,
  onSuccess,
}: Props) {
  const [namaKategori, setNamaKategori] = useState(
    data.namaKategori || ""
  );

  const [hargaPerKg, setHargaPerKg] = useState(
    String(data.hargaPerKg ?? "")
  );

  const [poinPerKg, setPoinPerKg] = useState(
    String(data.poinPerKg ?? "")
  );

  const [jenis, setJenis] = useState(
    data.jenis || ""
  );

  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     AUTH
  ========================================================= */

  const getToken = () => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  const getAppKey = () => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage.getItem("appKey") ||
      process.env.NEXT_PUBLIC_APP_KEY ||
      ""
    );
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    const nama = namaKategori.trim();
    const harga = hargaPerKg.trim();
    const poin = poinPerKg.trim();
    const tipe = jenis.trim();

    if (!nama || !harga || !poin || !tipe) {
      alert("Lengkapi semua data kategori.");
      return;
    }

    const hargaNumber = Number(harga);
    const poinNumber = Number(poin);

    if (
      Number.isNaN(hargaNumber) ||
      Number.isNaN(poinNumber)
    ) {
      alert("Harga dan poin harus berupa angka.");
      return;
    }

    if (hargaNumber < 0 || poinNumber < 0) {
      alert("Harga dan poin tidak boleh kurang dari 0.");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();
      const appKey = getAppKey();

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum ditemukan."
        );
      }

      if (!appKey) {
        throw new Error(
          "App Key tidak ditemukan. Silakan login kembali."
        );
      }

      /*
       * Swagger:
       * PUT /api/v1/kategori-sampah/{id}
       * Content-Type: multipart/form-data
       */

      const formData = new FormData();

      formData.append(
        "namaKategori",
        nama
      );

      formData.append(
        "hargaPerKg",
        String(hargaNumber)
      );

      formData.append(
        "poinPerKg",
        String(poinNumber)
      );

      formData.append(
        "jenis",
        tipe
      );

      /*
       * Foto hanya dikirim kalau user memilih
       * foto baru.
       */
      if (foto instanceof File) {
        formData.append(
          "foto",
          foto
        );
      }

      console.log("========== EDIT KATEGORI ==========");
      console.log(
        "URL:",
        `${API_URL}/api/v1/kategori-sampah/${data.id}`
      );
      console.log("ID:", data.id);
      console.log("namaKategori:", nama);
      console.log("hargaPerKg:", hargaNumber);
      console.log("poinPerKg:", poinNumber);
      console.log("jenis:", tipe);
      console.log("foto:", foto);
      console.log("====================================");

      const response = await fetch(
        `${API_URL}/api/v1/kategori-sampah/${data.id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "x-app-key": appKey,

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          /*
           * JANGAN tambahkan Content-Type di sini.
           * Browser otomatis membuat:
           *
           * multipart/form-data; boundary=...
           */
          body: formData,
        }
      );

      const text = await response.text();

      console.log(
        "Status PUT:",
        response.status
      );

      console.log(
        "Response PUT:",
        text
      );

      let result: any;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Response API bukan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok || !result?.success) {
        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(
          message ||
            `Gagal memperbarui kategori. Status: ${response.status}`
        );
      }

      /*
       * API mengembalikan data kategori terbaru.
       */
      const updatedKategori: Kategori =
        result.data;

      console.log(
        "DATA TERBARU:",
        updatedKategori
      );

      alert(
        result.message ||
          "Kategori berhasil diperbarui."
      );

      /*
       * Kirim data hasil PUT ke parent.
       */
      onSuccess(updatedKategori);

    } catch (error) {
      console.error(
        "EDIT KATEGORI ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui kategori."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2C4A30]">
              Edit Kategori
            </h2>

            <p className="text-sm text-[#737A70]">
              Ubah data kategori sampah
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-2xl text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAMA */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#2C4A30]">
              Nama Kategori
            </label>

            <input
              type="text"
              value={namaKategori}
              onChange={(e) =>
                setNamaKategori(
                  e.target.value
                )
              }
              disabled={loading}
              placeholder="Contoh: Botol Plastik PET Bersih"
              className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none transition placeholder:text-[#9A9E96] focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
            />
          </div>

          {/* HARGA + POIN */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#2C4A30]">
                Harga / Kg
              </label>

              <input
                type="number"
                min="0"
                value={hargaPerKg}
                onChange={(e) =>
                  setHargaPerKg(
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#2C4A30]">
                Poin / Kg
              </label>

              <input
                type="number"
                min="0"
                value={poinPerKg}
                onChange={(e) =>
                  setPoinPerKg(
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
              />
            </div>

          </div>

          {/* JENIS */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#2C4A30]">
              Jenis Sampah
            </label>

            <select
              value={jenis}
              onChange={(e) =>
                setJenis(e.target.value)
              }
              disabled={loading}
              className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
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

          {/* FOTO */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#2C4A30]">
              Foto Baru
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={loading}
              onChange={(e) => {
                const file =
                  e.target.files?.[0] || null;

                setFoto(file);
              }}
              className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#68705F] disabled:bg-gray-50"
            />

            {foto && (
              <p className="mt-2 text-xs text-[#737A70]">
                File dipilih:{" "}
                <span className="font-medium">
                  {foto.name}
                </span>
              </p>
            )}
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3 pt-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[#D8D0BF] bg-white px-5 py-2.5 text-sm font-medium text-[#68705F] transition hover:bg-[#F2EDE0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#2C4A30] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#486F43] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}