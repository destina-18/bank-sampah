"use client";

import { useEffect, useState } from "react";

import TambahHadiah from "./tambah";
import DetailHadiah from "./detail";
import EditHadiah from "./edit";
import DeleteHadiah from "./delete";

/* =========================================================
   TYPE
========================================================= */

export type Hadiah = {
  id: string;
  namaHadiah: string;
  poinDibutuhkan: number;
  stok: number;
  foto?: string;

  appMakerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   VIEW
========================================================= */

type View =
  | {
      type: "list";
    }
  | {
      type: "tambah";
    }
  | {
      type: "detail";
      id: string;
    }
  | {
      type: "edit";
      id: string;
    };

/* =========================================================
   API
========================================================= */

const API_BASE = (
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/+$/, "");

const ENV_APP_KEY =
  process.env.NEXT_PUBLIC_APP_KEY || "";

/* =========================================================
   AUTH
========================================================= */

function getAuth() {
  let token = "";
  let appKey = "";

  /*
   * COOKIE
   */
  if (typeof document !== "undefined") {
    const cookies =
      document.cookie.split(";");

    const getCookie = (
      names: string[]
    ) => {
      for (const name of names) {
        const cookie =
          cookies.find((item) =>
            item
              .trim()
              .startsWith(
                `${name}=`
              )
          );

        if (cookie) {
          return decodeURIComponent(
            cookie
              .split("=")
              .slice(1)
              .join("=") || ""
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

  /*
   * LOCAL STORAGE
   */
  if (
    typeof localStorage !==
    "undefined"
  ) {
    if (!token) {
      token =
        localStorage.getItem(
          "token"
        ) ||
        localStorage.getItem(
          "access_token"
        ) ||
        localStorage.getItem(
          "accessToken"
        ) ||
        "";
    }

    if (!appKey) {
      appKey =
        localStorage.getItem(
          "appKey"
        ) ||
        localStorage.getItem(
          "app_key"
        ) ||
        "";
    }
  }

  /*
   * ENV FALLBACK
   */
  if (!appKey) {
    appKey = ENV_APP_KEY;
  }

  return {
    token,
    appKey,
  };
}

/* =========================================================
   PARSE RESPONSE
========================================================= */

async function parseResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server tidak mengembalikan JSON. Status: ${response.status}`
    );
  }
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
   * Kalau API sudah memberikan URL lengkap
   */
  if (
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }

  /*
   * Contoh:
   *
   * /uploads/hadiah.webp
   *
   * menjadi:
   *
   * https://domain-api.com/uploads/hadiah.webp
   */

  return `${API_BASE}${
    foto.startsWith("/")
      ? foto
      : `/${foto}`
  }`;
}

/* =========================================================
   PAGE
========================================================= */

export default function HadiahPage() {
  const [view, setView] =
    useState<View>({
      type: "list",
    });

  const [hadiah, setHadiah] =
    useState<Hadiah[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  /* =========================================================
     GET DATA
  ========================================================= */

  async function getHadiah() {
    try {
      setLoading(true);
      setError("");

      if (!API_BASE) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum ditemukan."
        );
      }

      const {
        token,
        appKey,
      } = getAuth();

      const headers: HeadersInit = {
        Accept:
          "application/json",
      };

      if (appKey) {
        headers["x-app-key"] =
          appKey;
      }

      if (token) {
        headers["Authorization"] =
          `Bearer ${token}`;
      }

      const url =
        `${API_BASE}/api/v1/hadiah`;

      console.log(
        "GET HADIAH:",
        url
      );

      const response =
        await fetch(url, {
          method: "GET",
          headers,
          cache: "no-store",
        });

      const result =
        await parseResponse(
          response
        );

      console.log(
        "GET HADIAH RESPONSE:",
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

      const list =
        Array.isArray(
          result?.data
        )
          ? result.data
          : [];

      setHadiah(list);

    } catch (error) {
      console.error(
        "GET HADIAH ERROR:",
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

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    getHadiah();
  }, []);

  /* =========================================================
     BACK
  ========================================================= */

  function kembali() {
    setView({
      type: "list",
    });

    /*
     * Ambil ulang data setelah:
     * - tambah
     * - edit
     * - detail
     */
    getHadiah();
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredHadiah =
    hadiah.filter((item) =>
      item.namaHadiah
        ?.toLowerCase()
        .includes(
          search
            .toLowerCase()
            .trim()
        )
    );

  /* =========================================================
     TAMBAH
  ========================================================= */

  if (view.type === "tambah") {
    return (
      <TambahHadiah
        onBack={kembali}
        onSuccess={kembali}
      />
    );
  }

  /* =========================================================
     DETAIL
  ========================================================= */

  if (view.type === "detail") {
    return (
      <DetailHadiah
        id={view.id}
        onBack={kembali}
        onEdit={(id) =>
          setView({
            type: "edit",
            id,
          })
        }
      />
    );
  }

  /* =========================================================
     EDIT
  ========================================================= */

  if (view.type === "edit") {
    return (
      <EditHadiah
        id={view.id}
        onBack={kembali}
        onSuccess={kembali}
      />
    );
  }

  /* =========================================================
     LIST
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F2EDE0] p-6 text-[#2C4A30] md:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#737A70]">
              Admin Panel
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#2C4A30]">
              Katalog Hadiah
            </h1>

            <p className="mt-1 text-sm text-[#737A70]">
              Kelola hadiah dan voucher penukaran poin.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setView({
                type: "tambah",
              })
            }
            className="rounded-xl bg-[#2C4A30] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#486F43] active:scale-[0.98]"
          >
            + Tambah Hadiah
          </button>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="mb-5 rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] p-4 shadow-sm">

          <input
            type="text"
            placeholder="Cari nama hadiah..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-[#D8D0BF] bg-[#F2EDE0] px-4 py-3 text-sm text-[#2C4A30] outline-none transition placeholder:text-[#9A9E96] focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0]"
          />

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            TABLE CARD
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] shadow-sm">

          {loading ? (

            /* LOADING */

            <div className="flex min-h-[350px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D8D0BF] border-t-[#5C8A54]" />

                <p className="text-sm text-[#737A70]">
                  Memuat data hadiah...
                </p>

              </div>

            </div>

          ) : filteredHadiah.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E0D0] text-3xl">
                🎁
              </div>

              <h2 className="font-semibold text-[#2C4A30]">
                Belum ada data hadiah
              </h2>

              <p className="mt-1 text-sm text-[#737A70]">
                {search
                  ? "Hadiah yang kamu cari tidak ditemukan."
                  : "Silakan tambahkan hadiah baru."}
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                {/* TABLE HEADER */}

                <thead>

                  <tr className="border-b border-[#D8D0BF] bg-[#E7E0D0] text-left text-sm text-[#68705F]">

                    <th className="px-6 py-4 font-semibold">
                      No
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Hadiah
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Poin
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Stok
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Foto
                    </th>

                    <th className="px-6 py-4 text-center font-semibold">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* TABLE BODY */}

                <tbody>

                  {filteredHadiah.map(
                    (item, index) => {

                      const fotoUrl =
                        getFotoUrl(
                          item.foto
                        );

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#E7E0D0] last:border-b-0 transition hover:bg-[#F2EDE0]"
                        >

                          {/* NO */}

                          <td className="px-6 py-5 text-sm text-[#737A70]">
                            {index + 1}
                          </td>

                          {/* HADIAH */}

                          <td className="px-6 py-5">

                            <p className="font-semibold text-[#2C4A30]">
                              {
                                item.namaHadiah
                              }
                            </p>

                          </td>

                          {/* POIN */}

                          <td className="px-6 py-5">

                            <span className="inline-flex rounded-full bg-[#F0E6C9] px-3 py-1.5 text-sm font-semibold text-[#A9812F]">
                              {
                                item.poinDibutuhkan
                              }{" "}
                              poin
                            </span>

                          </td>

                          {/* STOK */}

                          <td className="px-6 py-5">

                            <span
                              className={
                                item.stok ===
                                0
                                  ? "rounded-full bg-[#EEEEEE] px-3 py-1.5 text-xs font-semibold text-[#8A7168]"
                                  : "rounded-full bg-[#E0E9DD] px-3 py-1.5 text-xs font-semibold text-[#2C4A30]"
                              }
                            >
                              {item.stok ===
                              0
                                ? "Habis"
                                : item.stok}
                            </span>

                          </td>

                          {/* FOTO */}

                          <td className="px-6 py-5">

                            {fotoUrl ? (

                              <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#D8D0BF] bg-[#F2EDE0]">

                                <img
                                  src={
                                    fotoUrl
                                  }
                                  alt={
                                    item.namaHadiah
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.style.display =
                                      "none";

                                    const parent =
                                      e.currentTarget.parentElement;

                                    if (
                                      parent
                                    ) {
                                      parent.innerHTML =
                                        `
                                        <div class="flex h-full w-full items-center justify-center text-2xl">
                                          🎁
                                        </div>
                                      `;
                                    }
                                  }}
                                />

                              </div>

                            ) : (

                              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#D8D0BF] bg-[#EEEEEE] text-2xl">
                                🎁
                              </div>

                            )}

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-5">

                            <div className="flex justify-center gap-2">

                              {/* DETAIL */}

                              <button
                                type="button"
                                onClick={() =>
                                  setView({
                                    type: "detail",
                                    id: item.id,
                                  })
                                }
                                className="rounded-lg bg-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#68705F] transition hover:bg-[#E7E0D0] hover:text-[#2C4A30]"
                              >
                                Detail
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  setView({
                                    type: "edit",
                                    id: item.id,
                                  })
                                }
                                className="rounded-lg bg-[#E7E0D0] px-3 py-2 text-xs font-semibold text-[#2C4A30] transition hover:bg-[#D8D0BF]"
                              >
                                Edit
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteId(
                                    item.id
                                  )
                                }
                                className="rounded-lg bg-[#EEEEEE] px-3 py-2 text-xs font-semibold text-[#8A7168] transition hover:bg-[#E7E0D0]"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          DELETE
      ===================================================== */}

      {deleteId && (
        <DeleteHadiah
          id={deleteId}
          onClose={() =>
            setDeleteId(null)
          }
          onSuccess={() => {
            setDeleteId(null);
            getHadiah();
          }}
        />
      )}

    </main>
  );
}