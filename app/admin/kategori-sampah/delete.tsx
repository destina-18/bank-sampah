"use client";

import { useState } from "react";
import type { Kategori } from "./page";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

type Props = {
  data: Kategori;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteKategori({
  data,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/v1/kategori-sampah/${data.id}`,
        {
          method: "DELETE",
          headers: {
            "x-app-key": APP_KEY,
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
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
            "Gagal menghapus kategori"
        );
      }

      alert("Kategori sampah berhasil dihapus");

      onSuccess();
    } catch (error) {
      console.error("Delete kategori:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus kategori"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-5 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            🗑️
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Hapus Kategori?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Kamu yakin ingin menghapus kategori{" "}
            <span className="font-semibold text-gray-700">
              {data.namaKategori}
            </span>
            ?
          </p>

        </div>

        <div className="flex gap-3">

          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>

        </div>

      </div>
    </div>
  );
}