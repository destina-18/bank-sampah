"use client";

import { useEffect, useState } from "react";
import TambahKategori from "./tambah";
import EditKategori from "./edit";
import DetailKategori from "./detail";
import DeleteKategori from "./delete";

export type Kategori = {
  id: string;
  namaKategori: string;
  hargaPerKg: number;
  poinPerKg: number;
  jenis: string;
  foto?: string;
  appMakerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/$/, "");

const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY || "";

export default function KategoriSampahPage() {
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showTambah, setShowTambah] =
    useState(false);

  const [editData, setEditData] =
    useState<Kategori | null>(null);

  const [detailData, setDetailData] =
    useState<Kategori | null>(null);

  const [deleteData, setDeleteData] =
    useState<Kategori | null>(null);

  const [page, setPage] = useState(1);

  const perPage = 5;

  /* =========================================================
     TOKEN
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

  /* =========================================================
     GET DATA
  ========================================================= */

  const getData = async () => {
    try {
      setLoading(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum ditemukan di .env.local"
        );
      }

      const token = getToken();

      const url =
        `${API_URL}/api/v1/kategori-sampah`;

      console.log(
        "GET Kategori Sampah:",
        url
      );

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",
          "x-app-key": APP_KEY,

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },

        cache: "no-store",
      });

      const text = await response.text();

      console.log(
        "GET Status:",
        response.status
      );

      console.log(
        "GET Response:",
        text
      );

      let result: any;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `API mengembalikan response bukan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        const message =
          Array.isArray(result?.message)
            ? result.message.join(", ")
            : result?.message;

        throw new Error(
          message ||
            `Gagal mengambil data. Status: ${response.status}`
        );
      }

      const list =
        Array.isArray(result?.data)
          ? result.data
          : [];

      setData(list);

    } catch (error) {
      console.error(
        "GET kategori sampah:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data kategori sampah"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    getData();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredData = data.filter(
    (item) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return true;
      }

      return (
        item.namaKategori
          ?.toLowerCase()
          .includes(keyword) ||
        item.jenis
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPage = Math.ceil(
    filteredData.length / perPage
  );

  const start =
    (page - 1) * perPage;

  const currentData =
    filteredData.slice(
      start,
      start + perPage
    );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (
      totalPage > 0 &&
      page > totalPage
    ) {
      setPage(totalPage);
    }

    if (
      totalPage === 0 &&
      page !== 1
    ) {
      setPage(1);
    }
  }, [page, totalPage]);

  /* =========================================================
     FORMAT RUPIAH
  ========================================================= */

  const formatRupiah = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  /* =========================================================
     JENIS STYLE
  ========================================================= */

  const jenisStyle = (
    jenis: string
  ) => {
    switch (
      jenis?.toLowerCase()
    ) {
      case "plastik":
        return "bg-[#E7E0D0] text-[#2C4A30]";

      case "kertas":
        return "bg-[#F0E6C9] text-[#A9812F]";

      case "logam":
        return "bg-[#EEEEEE] text-[#68705F]";

      case "kaca":
        return "bg-[#E0E9DD] text-[#5C8A54]";

      default:
        return "bg-[#EEEEEE] text-[#68705F]";
    }
  };

  /* =========================================================
     FOTO URL
  ========================================================= */

  const getFotoUrl = (
    foto?: string
  ) => {
    if (!foto) {
      return null;
    }

    if (
      foto.startsWith("http://") ||
      foto.startsWith("https://")
    ) {
      return foto;
    }

    return `${API_URL}${
      foto.startsWith("/")
        ? foto
        : `/${foto}`
    }`;
  };

  /* =========================================================
     UPDATE DATA SETELAH EDIT
  ========================================================= */

  const handleEditSuccess = (
    updatedData: Kategori
  ) => {
    console.log(
      "UPDATE DATA DARI API:",
      updatedData
    );

    setData((prev) =>
      prev.map((item) =>
        item.id === updatedData.id
          ? updatedData
          : item
      )
    );

    setEditData(null);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F2EDE0] p-6 text-[#2C4A30]">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">

          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[#737A70]">
            Admin Panel
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#2C4A30]">
            Kategori Sampah
          </h1>

          <p className="mt-1 text-sm text-[#737A70]">
            Kelola kategori sampah daur ulang
          </p>

        </div>

        {/* =================================================
            SEARCH & TAMBAH
        ================================================= */}

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="w-full sm:w-80">

            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-[#D8D0BF] bg-[#F2EDE0] px-4 py-2.5 text-sm text-[#2C4A30] outline-none transition placeholder:text-[#9A9E96] focus:border-[#5C8A54] focus:ring-2 focus:ring-[#E7E0D0]"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              setShowTambah(true)
            }
            className="rounded-xl bg-[#2C4A30] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#486F43] active:scale-[0.98]"
          >
            + Tambah Kategori
          </button>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-[#D8D0BF] bg-[#FBF8F0] shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              {/* HEADER */}

              <thead>

                <tr className="border-b border-[#D8D0BF] bg-[#E7E0D0] text-left text-sm text-[#68705F]">

                  <th className="px-5 py-4 font-semibold">
                    No
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Foto
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Nama Kategori
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Harga / Kg
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Poin / Kg
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Jenis
                  </th>

                  <th className="px-5 py-4 text-center font-semibold">
                    Aksi
                  </th>

                </tr>

              </thead>

              {/* BODY */}

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-[#737A70]"
                    >

                      <div className="flex flex-col items-center gap-3">

                        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D8D0BF] border-t-[#5C8A54]" />

                        <span>
                          Memuat data...
                        </span>

                      </div>

                    </td>

                  </tr>

                ) : currentData.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7E0D0] text-[#5C8A54]">
                        ♻
                      </div>

                      <p className="mt-4 text-sm font-medium text-[#2C4A30]">
                        Data kategori sampah tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-[#737A70]">
                        Coba gunakan kata kunci pencarian yang berbeda.
                      </p>

                    </td>

                  </tr>

                ) : (

                  currentData.map(
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

                          <td className="px-5 py-4 text-sm text-[#737A70]">
                            {start + index + 1}
                          </td>

                          {/* FOTO */}

                          <td className="px-5 py-4">

                            {fotoUrl ? (

                              <img
                                src={fotoUrl}
                                alt={
                                  item.namaKategori
                                }
                                className="h-14 w-14 rounded-xl border border-[#D8D0BF] object-cover"
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />

                            ) : (

                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEEEEE] text-[10px] font-medium text-[#8A8F87]">
                                No Foto
                              </div>

                            )}

                          </td>

                          {/* NAMA */}

                          <td className="px-5 py-4">

                            <p className="font-medium text-[#2C4A30]">
                              {
                                item.namaKategori
                              }
                            </p>

                          </td>

                          {/* HARGA */}

                          <td className="px-5 py-4 text-sm text-[#68705F]">
                            {formatRupiah(
                              item.hargaPerKg
                            )}
                          </td>

                          {/* POIN */}

                          <td className="px-5 py-4">

                            <span className="inline-flex rounded-lg bg-[#F0E6C9] px-2.5 py-1.5 text-xs font-semibold text-[#A9812F]">
                              {
                                item.poinPerKg
                              }{" "}
                              poin
                            </span>

                          </td>

                          {/* JENIS */}

                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${jenisStyle(
                                item.jenis
                              )}`}
                            >
                              {
                                item.jenis
                              }
                            </span>

                          </td>

                          {/* AKSI */}

                          <td className="px-5 py-4">

                            <div className="flex justify-center gap-2">

                              {/* DETAIL */}

                              <button
                                type="button"
                                onClick={() =>
                                  setDetailData(
                                    item
                                  )
                                }
                                className="rounded-lg bg-[#EEEEEE] px-3 py-2 text-xs font-medium text-[#68705F] transition hover:bg-[#E7E0D0] hover:text-[#2C4A30]"
                              >
                                Detail
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  setEditData(
                                    item
                                  )
                                }
                                className="rounded-lg bg-[#E7E0D0] px-3 py-2 text-xs font-medium text-[#2C4A30] transition hover:bg-[#D8D0BF]"
                              >
                                Edit
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteData(
                                    item
                                  )
                                }
                                className="rounded-lg bg-[#EEEEEE] px-3 py-2 text-xs font-medium text-[#8A7168] transition hover:bg-[#E7E0D0]"
                              >
                                Hapus
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            filteredData.length > 0 && (

              <div className="flex flex-col gap-3 border-t border-[#D8D0BF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-[#737A70]">

                  Menampilkan{" "}

                  <span className="font-medium text-[#2C4A30]">
                    {start + 1}
                  </span>

                  {" - "}

                  <span className="font-medium text-[#2C4A30]">
                    {Math.min(
                      start + perPage,
                      filteredData.length
                    )}
                  </span>

                  {" dari "}

                  <span className="font-medium text-[#2C4A30]">
                    {filteredData.length}
                  </span>

                  {" data"}

                </p>

                {totalPage > 1 && (

                  <div className="flex items-center gap-2">

                    {/* PREVIOUS */}

                    <button
                      type="button"
                      disabled={
                        page === 1
                      }
                      onClick={() =>
                        setPage(
                          (p) =>
                            p - 1
                        )
                      }
                      className="rounded-lg border border-[#D8D0BF] bg-[#FBF8F0] px-3 py-2 text-sm text-[#68705F] transition hover:bg-[#E7E0D0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ←
                    </button>

                    {/* NUMBER */}

                    {Array.from(
                      {
                        length:
                          totalPage,
                      },
                      (_, i) =>
                        i + 1
                    ).map(
                      (number) => (

                        <button
                          type="button"
                          key={number}
                          onClick={() =>
                            setPage(
                              number
                            )
                          }
                          className={`h-9 w-9 rounded-lg text-sm transition ${
                            page ===
                            number
                              ? "bg-[#2C4A30] text-white"
                              : "border border-[#D8D0BF] bg-[#FBF8F0] text-[#68705F] hover:bg-[#E7E0D0]"
                          }`}
                        >
                          {number}
                        </button>

                      )
                    )}

                    {/* NEXT */}

                    <button
                      type="button"
                      disabled={
                        page ===
                        totalPage
                      }
                      onClick={() =>
                        setPage(
                          (p) =>
                            p + 1
                        )
                      }
                      className="rounded-lg border border-[#D8D0BF] bg-[#FBF8F0] px-3 py-2 text-sm text-[#68705F] transition hover:bg-[#E7E0D0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      →
                    </button>

                  </div>

                )}

              </div>

            )}

        </div>

      </div>

      {/* =====================================================
          TAMBAH
      ===================================================== */}

      {showTambah && (

        <TambahKategori
          onClose={() =>
            setShowTambah(false)
          }
          onSuccess={() => {
            setShowTambah(false);
            getData();
          }}
        />

      )}

      {/* =====================================================
          EDIT
      ===================================================== */}

      {editData && (

        <EditKategori
          data={editData}

          onClose={() =>
            setEditData(null)
          }

          onSuccess={
            handleEditSuccess
          }
        />

      )}

      {/* =====================================================
          DETAIL
      ===================================================== */}

      {detailData && (

        <DetailKategori
          data={detailData}

          onClose={() =>
            setDetailData(null)
          }
        />

      )}

      {/* =====================================================
          DELETE
      ===================================================== */}

      {deleteData && (

        <DeleteKategori
          data={deleteData}

          onClose={() =>
            setDeleteData(null)
          }

          onSuccess={() => {
            setDeleteData(null);
            getData();
          }}
        />

      )}

    </div>
  );
}