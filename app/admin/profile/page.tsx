"use client";

import { useState } from "react";
import {
  UserCircle,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@banksampah.com");

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-[#f8f6f1] px-6 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-[#7f8d83]">
            Pengaturan
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#173c2b]">
            Profile
          </h1>

          <p className="mt-1 text-sm text-[#89948d]">
            Kelola informasi akun admin Bank Sampah.
          </p>
        </div>

        {/* =====================================
            PROFILE CARD
        ====================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#e6e1d7] bg-[#fffefa] shadow-sm">

          {/* Top Profile */}
          <div className="border-b border-[#ebe7df] bg-[#fbfaf7] px-6 py-7 md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* User */}
              <div className="flex items-center gap-4">

                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e5f0e2]">
                  <UserCircle
                    className="h-12 w-12 text-[#2f8135]"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Name */}
                <div>
                  <h2 className="text-xl font-bold text-[#173c2b]">
                    {name}
                  </h2>

                  <p className="mt-1 text-sm text-[#7f8b84]">
                    Administrator
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e5f0e2] px-3 py-1 text-[11px] font-medium text-[#2f8135]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-4 text-sm font-medium text-white transition hover:bg-[#276d2d]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              )}

            </div>
          </div>

          {/* =====================================
              INFORMATION
          ====================================== */}

          <div className="px-6 py-7 md:px-8">

            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#173c2b]">
                Informasi Akun
              </h3>

              <p className="mt-1 text-xs text-[#8b958e]">
                Informasi yang digunakan untuk akun administrator.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Nama */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#526158]">
                  Nama Admin
                </label>

                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a39c]" />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition ${
                      isEditing
                        ? "border-[#cfdcca] bg-white text-[#31443a] focus:border-[#2f8135] focus:ring-2 focus:ring-[#2f8135]/10"
                        : "border-[#e7e2d9] bg-[#f8f6f1] text-[#66716a]"
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#526158]">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a39c]" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className={`h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition ${
                      isEditing
                        ? "border-[#cfdcca] bg-white text-[#31443a] focus:border-[#2f8135] focus:ring-2 focus:ring-[#2f8135]/10"
                        : "border-[#e7e2d9] bg-[#f8f6f1] text-[#66716a]"
                    }`}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#526158]">
                  Role
                </label>

                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a39c]" />

                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="h-11 w-full rounded-xl border border-[#e7e2d9] bg-[#f8f6f1] pl-10 pr-4 text-sm text-[#66716a] outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#526158]">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a39c]" />

                  <input
                    type="password"
                    value="••••••••"
                    disabled
                    className="h-11 w-full rounded-xl border border-[#e7e2d9] bg-[#f8f6f1] pl-10 pr-4 text-sm text-[#66716a] outline-none"
                  />
                </div>
              </div>

            </div>

            {/* =====================================
                EDIT ACTION
            ====================================== */}

            {isEditing && (
              <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#ebe7df] pt-6">

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#ded9cf] bg-white px-4 text-sm font-medium text-[#69736d] transition hover:bg-[#f5f3ee]"
                >
                  <X className="h-4 w-4" />
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2f8135] px-5 text-sm font-medium text-white transition hover:bg-[#276d2d]"
                >
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </button>

              </div>
            )}

          </div>
        </div>

        {/* =====================================
            ACCOUNT STATUS
        ====================================== */}

        <div className="mt-5 rounded-2xl border border-[#dce8d9] bg-[#f0f6ee] px-5 py-4">
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcebd8]">
              <ShieldCheck
                className="h-5 w-5 text-[#2f8135]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#315b37]">
                Akun Aktif
              </p>

              <p className="text-xs text-[#718273]">
                Akun administrator dapat mengakses seluruh fitur panel admin.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
