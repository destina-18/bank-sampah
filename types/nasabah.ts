export interface NasabahUser {
  username: string;
  role: string;
}

export interface Nasabah {
  id: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  saldoPoin: number;
  foto?: string | null;
  user?: NasabahUser;
  createdAt?: string;
}

export interface NasabahFormData {
  username: string;
  password: string;
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto: File | null;
}

export interface UpdateNasabahFormData {
  namaNasabah: string;
  alamat: string;
  telp: string;
  foto: File | null;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  timestamp?: string;
}