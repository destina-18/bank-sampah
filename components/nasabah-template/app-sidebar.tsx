"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Recycle,
  History,
  UserCircle,
  LogOut,
  Gift,
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
    label: "Beranda",
    path: "/nasabah/dashboard",
    icon: Home,
  },
  {
    label: "Kategori Sampah",
    path: "/nasabah/kategori-sampah",
    icon: Recycle,
  },
  {
    label: "Setor Sampah",
    path: "/nasabah/setor-sampah",
    icon: Recycle,
  },
  {
    label: "Riwayat Setor",
    path: "/nasabah/riwayat",
    icon: History,
  },
  {
    label: "Tukar Poin",
    path: "/nasabah/tukar-poin",
    icon: Gift,
  },
  {
    label: "Akun",
    path: "/nasabah/profile",
    icon: UserCircle,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
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

    window.location.replace("/");
  };

  // ==========================================
  // PROFILE NASABAH
  // ==========================================

  const profile = {
    name: "Nasabah",
    email: "nasabah@banksampah.com",
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-[#e5e0d5] bg-[#fbfaf7]"
    >
      {/* ======================================
          HEADER
      ====================================== */}

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
              Area Nasabah
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* ======================================
          MENU
      ====================================== */}

      <SidebarContent className="bg-[#fbfaf7] px-3 py-5">
        <SidebarGroup>
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

      {/* ======================================
          FOOTER
      ====================================== */}

      <SidebarFooter className="border-t border-[#e8e4da] bg-[#fbfaf7] px-3 py-4">
        <SidebarMenu>
          {/* ==================================
              PROFILE
          ================================== */}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Akun"
              onClick={() => router.push("/nasabah/profile")}
              className={`mb-2 h-auto w-full cursor-pointer rounded-xl px-3 py-3 transition-all ${
                pathname === "/nasabah/profile"
                  ? "bg-[#e5f0e2]"
                  : "hover:bg-[#f1f3ed]"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  pathname === "/nasabah/profile"
                    ? "bg-[#2f8135]"
                    : "bg-[#e5f0e2]"
                }`}
              >
                <UserCircle
                  className={`h-6 w-6 ${
                    pathname === "/nasabah/profile"
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
                    pathname === "/nasabah/profile"
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

          {/* ==================================
              LOGOUT
          ================================== */}

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