import {
  ApiResponse,
  Nasabah,
  NasabahFormData,
  UpdateNasabahFormData,
} from "@/types/nasabah";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "NEXT_PUBLIC_API_URL belum diset di file .env.local"
  );
}

/* =========================================================
   AUTH HEADERS
========================================================= */

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("accesstoken");

  const appKey = localStorage.getItem("appKey");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (appKey) {
    headers["x-app-key"] = appKey;
  }

  return headers;
}

/* =========================================================
   HANDLE UNAUTHORIZED
========================================================= */

function handleUnauthorized(status: number) {
  if (
    (status === 401 || status === 403) &&
    typeof window !== "undefined"
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("appKey");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    document.cookie =
      "token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accessToken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accesstoken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    window.location.replace("/admin/sign-in");
  }
}

/* =========================================================
   PARSE RESPONSE
========================================================= */

async function parseResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Response dari server bukan JSON yang valid."
    );
  }

  if (!response.ok || !result.success) {
    handleUnauthorized(response.status);

    throw new Error(
      result.message ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return result;
}

/* =========================================================
   GET SEMUA NASABAH
   GET /api/v1/admin/nasabah
========================================================= */

export async function getNasabah(): Promise<Nasabah[]> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/nasabah`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<Nasabah[]>(response);

  return result.data || [];
}

/* =========================================================
   GET DETAIL NASABAH
   GET /api/v1/admin/nasabah/{id}
========================================================= */

export async function getNasabahById(
  id: string
): Promise<Nasabah> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/nasabah/${id}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<Nasabah>(response);

  return result.data;
}

/* =========================================================
   TAMBAH NASABAH
   POST /api/v1/admin/nasabah
========================================================= */

export async function createNasabah(
  data: NasabahFormData
): Promise<Nasabah> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  const formData = new FormData();

  formData.append(
    "username",
    data.username.trim()
  );

  formData.append(
    "password",
    data.password
  );

  formData.append(
    "namaNasabah",
    data.namaNasabah.trim()
  );

  formData.append(
    "alamat",
    data.alamat.trim()
  );

  formData.append(
    "telp",
    data.telp.trim()
  );

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/nasabah`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),

        // JANGAN tambahkan Content-Type.
        // Browser otomatis membuat multipart/form-data
        // beserta boundary-nya.
      },
      body: formData,
    }
  );

  const result =
    await parseResponse<Nasabah>(response);

  return result.data;
}

/* =========================================================
   UPDATE NASABAH
   PUT /api/v1/admin/nasabah/{id}
========================================================= */

export async function updateNasabah(
  id: string,
  data: UpdateNasabahFormData
): Promise<Nasabah> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  const formData = new FormData();

  formData.append(
    "namaNasabah",
    data.namaNasabah.trim()
  );

  formData.append(
    "alamat",
    data.alamat.trim()
  );

  formData.append(
    "telp",
    data.telp.trim()
  );

  if (data.foto) {
    formData.append("foto", data.foto);
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/nasabah/${id}`,
    {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),

        // Jangan tambahkan Content-Type di sini.
      },
      body: formData,
    }
  );

  const result =
    await parseResponse<Nasabah>(response);

  return result.data;
}

/* =========================================================
   DELETE NASABAH
   DELETE /api/v1/admin/nasabah/{id}
========================================================= */

export async function deleteNasabah(
  id: string
): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  const response = await fetch(
    `${API_URL}/api/v1/admin/nasabah/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await parseResponse<{ id: string }>(
    response
  );
}