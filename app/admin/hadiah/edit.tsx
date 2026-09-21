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

/* =========================================================
   AUTH
========================================================= */

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

  if (typeof localStorage !== "undefined") {
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
  }

  return {
    token,
    appKey,
  };
}

/* =========================================================
   FOTO URL
========================================================= */

function getFotoUrl(
  foto?: string | null
) {
  if (!foto) {
    return "";
  }

  /*
   * Kalau API sudah memberikan URL lengkap,
   * langsung gunakan.
   */
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }

  /*
   * Kalau API memberikan:
   * /uploads/nama.webp
   *
   * maka menjadi:
   * https://domain-api.com/uploads/nama.webp
   */
  return `${API_BASE}${
    foto.startsWith("/")
      ? foto
      : `/${foto}`
  }`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EditHadiah({
  id,
  onBack,
  onSuccess,
}: Props) {
  const [namaHadiah, setNamaHadiah] =
    useState("");

  const [poinDibutuhkan, setPoinDibutuhkan] =
    useState("");

  const [stok, setStok] =
    useState("");

  /* FOTO LAMA */
  const [fotoLama, setFotoLama] =
    useState("");

  /* FOTO BARU */
  const [fotoBaru, setFotoBaru] =
    useState<File | null>(null);

  /* PREVIEW FOTO BARU */
  const [previewFoto, setPreviewFoto] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================================
     GET DETAIL HADIAH
  ========================================================= */

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        const {
          token,
          appKey,
        } = getAuth();

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (appKey) {
          headers["x-app-key"] =
            appKey;
        }

        if (token) {
          headers["Authorization"] =
            `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_BASE}/api/v1/hadiah/${id}`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        const text =
          await response.text();

        let result: any;

        try {
          result = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            `Server tidak mengembalikan JSON. Status: ${response.status}`
          );
        }

        console.log(
          "DETAIL HADIAH:",
          result
        );

        if (!response.ok) {
          const message =
            Array.isArray(
              result?.message
            )
              ? result.message.join(
                  ", "
                )
              : result?.message;

          throw new Error(
            message ||
              `Gagal mengambil data hadiah (${response.status})`
          );
        }

        const data =
          result?.data;

        setNamaHadiah(
          data?.namaHadiah || ""
        );

        setPoinDibutuhkan(
          String(
            data?.poinDibutuhkan ??
              ""
          )
        );

        setStok(
          String(
            data?.stok ?? ""
          )
        );

        /*
         * Simpan path foto dari API.
         *
         * Contoh:
         * /uploads/hadiah.webp
         */
        setFotoLama(
          data?.foto || ""
        );

      } catch (error) {
        console.error(
          "GET DETAIL HADIAH:",
          error
        );

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

  /* =========================================================
     PREVIEW FOTO BARU
  ========================================================= */

  useEffect(() => {
    if (!fotoBaru) {
      setPreviewFoto("");
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        fotoBaru
      );

    setPreviewFoto(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [fotoBaru]);

  /* =========================================================
     SUBMIT EDIT
  ========================================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (saving) {
      return;
    }

    /* VALIDASI */

    if (!namaHadiah.trim()) {
      setError(
        "Nama hadiah wajib diisi."
      );
      return;
    }

    if (
      poinDibutuhkan === ""
    ) {
      setError(
        "Poin dibutuhkan wajib diisi."
      );
      return;
    }

    if (stok === "") {
      setError(
        "Stok wajib diisi."
      );
      return;
    }

    const poinNumber =
      Number(poinDibutuhkan);

    const stokNumber =
      Number(stok);

    if (
      Number.isNaN(
        poinNumber
      )
    ) {
      setError(
        "Poin dibutuhkan harus berupa angka."
      );
      return;
    }

    if (
      Number.isNaN(
        stokNumber
      )
    ) {
      setError(
        "Stok harus berupa angka."
      );
      return;
    }

    if (
      poinNumber < 0 ||
      stokNumber < 0
    ) {
      setError(
        "Poin dan stok tidak boleh kurang dari 0."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const {
        token,
        appKey,
      } = getAuth();

      if (!API_BASE) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum ditemukan."
        );
      }

      if (!appKey) {
        throw new Error(
          "App Key tidak ditemukan. Silakan login kembali."
        );
      }

      /* =====================================================
         FORMDATA
      ===================================================== */

      const formData =
        new FormData();

      formData.append(
        "namaHadiah",
        namaHadiah.trim()
      );

      formData.append(
        "poinDibutuhkan",
        String(poinNumber)
      );

      formData.append(
        "stok",
        String(stokNumber)
      );

      /*
       * Foto hanya dikirim kalau user
       * memilih foto baru.
       */
      if (
        fotoBaru instanceof File
      ) {
        formData.append(
          "foto",
          fotoBaru
        );
      }

      /* DEBUG */

      console.log(
        "========== EDIT HADIAH =========="
      );

      console.log(
        "URL:",
        `${API_BASE}/api/v1/hadiah/${id}`
      );

      console.log(
        "namaHadiah:",
        namaHadiah.trim()
      );

      console.log(
        "poinDibutuhkan:",
        poinNumber
      );

      console.log(
        "stok:",
        stokNumber
      );

      console.log(
        "fotoBaru:",
        fotoBaru
      );

      console.log(
        "================================="
      );

      /* =====================================================
         REQUEST PUT
      ===================================================== */

      const headers: HeadersInit = {
        Accept:
          "application/json",
        "x-app-key":
          appKey,
      };

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      const response =
        await fetch(
          `${API_BASE}/api/v1/hadiah/${id}`,
          {
            method: "PUT",
            headers,

            /*
             * Jangan tambahkan
             * Content-Type secara manual.
             *
             * Browser akan membuat boundary
             * multipart/form-data otomatis.
             */
            body: formData,
          }
        );

      const text =
        await response.text();

      console.log(
        "PUT STATUS:",
        response.status
      );

      console.log(
        "PUT RESPONSE:",
        text
      );

      let result: any;

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          `Server tidak mengembalikan JSON. Status: ${response.status}`
        );
      }

      if (
        !response.ok ||
        result?.success === false
      ) {
        const message =
          Array.isArray(
            result?.message
          )
            ? result.message.join(
                ", "
              )
            : result?.message;

        throw new Error(
          message ||
            `Gagal memperbarui hadiah (${response.status})`
        );
      }

      console.log(
        "DATA HADIAH TERBARU:",
        result?.data
      );

      /*
       * Berhasil.
       * Parent akan kembali ke list
       * dan menjalankan GET ulang.
       */
      onSuccess();

    } catch (error) {
      console.error(
        "EDIT HADIAH ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui hadiah."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F2EDE0]">
        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D8D0BF] border-t-[#5C8A54]" />

          <p className="text-sm text-[#737A70]">
            Memuat data hadiah...
          </p>

        </div>
      </main>
    );
  }

  /* =========================================================
     FOTO LAMA URL
  ========================================================= */

  const fotoLamaUrl =
    getFotoUrl(fotoLama);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F2EDE0] p-6 md:p-8">

      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="mb-5 text-sm font-medium text-[#557A62] transition hover:underline disabled:opacity-50"
        >
          ← Kembali
        </button>

        {/* CARD */}

        <div className="rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] p-6 shadow-sm md:p-8">

          {/* HEADER */}

          <div className="mb-7">

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#737A70]">
              Admin Panel
            </p>

            <h1 className="text-2xl font-semibold text-[#2C4A30]">
              Edit Hadiah
            </h1>

            <p className="mt-1 text-sm text-[#737A70]">
              Perbarui data hadiah dan foto.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAMA */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#2C4A30]">
                Nama Hadiah
              </label>

              <input
                type="text"
                value={namaHadiah}
                onChange={(e) =>
                  setNamaHadiah(
                    e.target.value
                  )
                }
                disabled={saving}
                className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none transition focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
              />

            </div>

            {/* POIN + STOK */}

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#2C4A30]">
                  Poin Dibutuhkan
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    poinDibutuhkan
                  }
                  onChange={(e) =>
                    setPoinDibutuhkan(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none transition focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#2C4A30]">
                  Stok
                </label>

                <input
                  type="number"
                  min="0"
                  value={stok}
                  onChange={(e) =>
                    setStok(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#2C4A30] outline-none transition focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0] disabled:bg-gray-50"
                />

              </div>

            </div>

            {/* =================================================
                FOTO LAMA
            ================================================= */}

            <div>

              <p className="mb-2 text-sm font-semibold text-[#2C4A30]">
                Foto Saat Ini
              </p>

              {fotoLamaUrl ? (

                <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#F2EDE0]">

                  <img
                    src={fotoLamaUrl}
                    alt={
                      namaHadiah ||
                      "Foto hadiah"
                    }
                    className="h-64 w-full object-contain"
                    onError={(e) => {
                      console.error(
                        "Foto hadiah gagal dimuat:",
                        fotoLamaUrl
                      );

                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>

              ) : (

                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-[#D8D0BF] bg-[#F2EDE0]">

                  <div className="text-center">

                    <div className="mb-2 text-3xl">
                      🎁
                    </div>

                    <p className="text-sm text-[#737A70]">
                      Belum ada foto
                    </p>

                  </div>

                </div>

              )}

              {/* DEBUG URL */}

              {fotoLamaUrl && (
                <p className="mt-2 break-all text-[11px] text-[#9A9E96]">
                  {fotoLamaUrl}
                </p>
              )}

            </div>

            {/* =================================================
                FOTO BARU
            ================================================= */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-[#2C4A30]">
                Ganti Foto
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                onChange={(e) => {
                  const file =
                    e.target.files?.[0] ||
                    null;

                  setFotoBaru(
                    file
                  );
                }}
                className="w-full rounded-xl border border-[#D8D0BF] bg-white px-4 py-3 text-sm text-[#68705F] disabled:bg-gray-50"
              />

              {fotoBaru && (
                <p className="mt-2 text-xs text-[#737A70]">
                  File dipilih:{" "}
                  <span className="font-medium text-[#2C4A30]">
                    {fotoBaru.name}
                  </span>
                </p>
              )}

            </div>

            {/* =================================================
                PREVIEW FOTO BARU
            ================================================= */}

            {previewFoto && (

              <div>

                <p className="mb-2 text-sm font-semibold text-[#2C4A30]">
                  Preview Foto Baru
                </p>

                <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#F2EDE0]">

                  <img
                    src={previewFoto}
                    alt="Preview foto baru"
                    className="h-64 w-full object-contain"
                  />

                </div>

              </div>

            )}

            {/* BUTTON */}

            <div className="flex justify-end gap-3 pt-4">

              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="rounded-xl border border-[#D8D0BF] bg-white px-5 py-3 text-sm font-semibold text-[#68705F] transition hover:bg-[#F2EDE0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#2C4A30] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#486F43] disabled:cursor-not-allowed disabled:opacity-60"
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