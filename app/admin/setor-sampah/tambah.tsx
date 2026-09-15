"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Recycle,
  Scale,
  AlertCircle,
} from "lucide-react";

export default function TambahSetorSampahPage() {
  const router = useRouter();

  const [id, setId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = id.trim();

    if (!value) {
      setError("Masukkan ID transaksi setor sampah.");
      return;
    }

    setError("");

    router.push(`/admin/setor-sampah/edit?id=${value}`);
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-5 py-8 text-[#403c36] md:px-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/admin/setor-sampah"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#746c61] hover:text-[#4d4841]"
        >
          <ArrowLeft size={17} />
          Kembali ke Setor Sampah
        </Link>

        <div className="rounded-2xl border border-[#e8e0d6] bg-[#fffdf9] p-6 shadow-[0_6px_25px_rgba(86,72,52,0.05)] md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#657b59]">
            <Scale size={23} />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-[#3f3b35]">
            Verifikasi Setoran
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#938a7e]">
            Masukkan ID transaksi untuk membuka halaman penimbangan dan
            verifikasi setoran sampah.
          </p>

          <div className="mt-6 rounded-xl border border-[#e1ddd5] bg-[#faf7f2] p-4">
            <div className="flex items-start gap-3">
              <Recycle
                size={18}
                className="mt-0.5 shrink-0 text-[#738468]"
              />

              <p className="text-xs leading-5 text-[#81786e]">
                Admin melakukan verifikasi terhadap pengajuan yang sudah
                dibuat oleh nasabah. Data pengajuan tidak dibuat ulang dari
                halaman Admin.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="text-sm font-medium text-[#554f47]">
              ID Transaksi
            </label>

            <div className="relative mt-2">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0988d]"
              />

              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Contoh: 9498c6d6-c2de-450d-a391-e80fbff5386c"
                className="h-12 w-full rounded-xl border border-[#e1d9cf] bg-[#faf7f2] pl-10 pr-4 text-sm text-[#4e4941] outline-none placeholder:text-[#aaa196] focus:border-[#99a88f] focus:bg-white"
              />
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e7cbc5] bg-[#fbefec] p-3 text-xs text-[#a55e52]">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#718467] text-sm font-medium text-white transition hover:bg-[#607456]"
            >
              <Scale size={17} />
              Buka Verifikasi
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}