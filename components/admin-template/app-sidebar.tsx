"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Recycle,
  Gift,
  Box,
  BarChart3,
  LogOut,
  UserCircle,
  ArrowLeftRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Nasabah",
    path: "/admin/nasabah",
    icon: Users,
  },
  {
    label: "Kategori Sampah",
    path: "/admin/kategori-sampah",
    icon: Recycle,
  },
  {
    label: "Hadiah",
    path: "/admin/hadiah",
    icon: Gift,
  },
  {
    label: "Setor Sampah",
    path: "/admin/setor-sampah",
    icon: Box,
  },
  {
    label: "Penukaran",
    path: "/admin/penukaran",
    icon: ArrowLeftRight,
  },
  {
    label: "Laporan",
    path: "/admin/laporan",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    // Hapus data autentikasi dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("appKey");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Hapus cookie autentikasi utama
    document.cookie =
      "bank_sampah_token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;";

    document.cookie =
      "bank_sampah_role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;";

    // Hapus cookie lama jika masih tersimpan
    document.cookie =
      "token=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accessToken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "accesstoken=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    document.cookie =
      "role=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    // Kembali ke halaman utama
    window.location.replace("/");
  };

  const profile = {
    name: "Admin",
    email: "admin@banksampah.com",
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-[#e5e0d5] bg-[#fbfaf7]"
    >
      <SidebarHeader className="border-b border-[#e8e4da] bg-[#fbfaf7] px-5 py-7">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#2f8135]">
            <Recycle
              className="h-6 w-6 text-white"
              strokeWidth={1.8}
            />
          </div>

          {/* Brand */}
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-[#173c2b]">
              Bank Sampah
            </h1>

            <p className="text-[11px] text-[#829087]">
              Panel Admin
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#fbfaf7] px-3 py-5">
        <SidebarGroup>
          {/* Label Menu */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a3aaa3]">
            Menu
          </p>

          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.path ||
                pathname.startsWith(`${item.path}/`);

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    onClick={() => router.push(item.path)}
                    className={`mb-1 h-11 w-full cursor-pointer rounded-xl px-3.5 text-[13px] font-medium transition-all ${
                      active
                        ? "bg-[#e5f0e2] text-[#2f8135] hover:bg-[#e5f0e2] hover:text-[#2f8135]"
                        : "text-[#66716a] hover:bg-[#f1f3ed] hover:text-[#2f8135]"
                    }`}
                  >
                    <Icon
                      className={`h-[19px] w-[19px] ${
                        active
                          ? "text-[#2f8135]"
                          : "text-[#66716a]"
                      }`}
                      strokeWidth={1.8}
                    />

                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#e8e4da] bg-[#fbfaf7] px-3 py-4">
        <SidebarMenu>
          {/* PROFILE */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Profile"
              onClick={() =>
                router.push("/admin/profile")
              }
              className={`mb-2 h-auto w-full cursor-pointer rounded-xl px-3 py-3 transition-all ${
                pathname === "/admin/profile"
                  ? "bg-[#e5f0e2]"
                  : "hover:bg-[#f1f3ed]"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  pathname === "/admin/profile"
                    ? "bg-[#2f8135]"
                    : "bg-[#e5f0e2]"
                }`}
              >
                <UserCircle
                  className={`h-6 w-6 ${
                    pathname === "/admin/profile"
                      ? "text-white"
                      : "text-[#2f8135]"
                  }`}
                  strokeWidth={1.8}
                />
              </div>

              {/* Profile Info */}
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span
                  className={`w-full truncate text-[13px] font-semibold ${
                    pathname === "/admin/profile"
                      ? "text-[#2f8135]"
                      : "text-[#31443a]"
                  }`}
                >
                  {profile.name}
                </span>

                <span className="w-full truncate text-[10px] text-[#8a958e]">
                  {profile.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* LOGOUT */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Keluar"
              onClick={logout}
              className="h-11 w-full cursor-pointer rounded-xl px-3.5 text-[13px] font-medium text-[#a45b5b] transition-all hover:bg-[#f9eeee] hover:text-[#a45b5b]"
            >
              <LogOut
                className="h-[19px] w-[19px]"
                strokeWidth={1.8}
              />

              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}