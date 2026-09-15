"use client";

import type { Kategori } from "./page";

type Props = {
  data: Kategori;
  onClose: () => void;
};

export default function DetailKategori({
  data,
  onClose,
}: Props) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Detail Kategori
            </h2>

            <p className="text-sm text-gray-500">
              Informasi kategori sampah
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {data.foto ? (
          <img
            src={data.foto}
            alt={data.namaKategori}
            className="mb-5 h-48 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="mb-5 flex h-48 items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
            Tidak ada foto
          </div>
        )}

        <div className="space-y-3">

          <div className="rounded-xl bg-[#faf8f4] p-4">
            <p className="text-xs text-gray-400">
              Nama Kategori
            </p>

            <p className="mt-1 font-semibold text-gray-800">
              {data.namaKategori}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-[#faf8f4] p-4">
              <p className="text-xs text-gray-400">
                Harga / Kg
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatRupiah(data.hargaPerKg)}
              </p>
            </div>

            <div className="rounded-xl bg-[#faf8f4] p-4">
              <p className="text-xs text-gray-400">
                Poin / Kg
              </p>

              <p className="mt-1 font-semibold text-[#52796f]">
                {data.poinPerKg} poin
              </p>
            </div>

          </div>

          <div className="rounded-xl bg-[#faf8f4] p-4">
            <p className="text-xs text-gray-400">
              Jenis
            </p>

            <p className="mt-1 font-semibold capitalize text-gray-800">
              {data.jenis}
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#52796f] py-3 text-sm font-semibold text-white hover:bg-[#3f6259]"
        >
          Tutup
        </button>

      </div>
    </div>
  );
}