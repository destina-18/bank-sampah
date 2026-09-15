"use client";

import { useState } from "react";

type Props = {
  id: string;
  onClose: () => void;
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

export default function DeleteHadiah({
  id,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    try {
      setLoading(true);
      setError("");

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
          method: "DELETE",
          headers,
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
            `Gagal menghapus hadiah (${response.status})`
        );
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus hadiah."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
          🗑️
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          Hapus Hadiah?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Apakah kamu yakin ingin menghapus hadiah ini?
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
          >
            Batal
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading
              ? "Menghapus..."
              : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}