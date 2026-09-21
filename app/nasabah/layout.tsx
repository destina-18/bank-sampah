import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nasabah-template/app-sidebar";
import AuthGuard from "@/components/auth/auth-guard";

export default function NasabahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard role="NASABAH">
      <SidebarProvider>
        <AppSidebar />

        <div className="flex min-h-screen w-full flex-col bg-[#f5f1e9]">

          {/* MOBILE / SIDEBAR TRIGGER */}
          <div className="flex h-14 items-center border-b border-[#e5e0d5] bg-[#fbfaf7] px-4 lg:hidden">
            <SidebarTrigger className="text-[#2f8135]" />

            <div className="ml-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f8135]">
                <RecycleIcon />
              </div>

              <span className="text-sm font-bold text-[#173c2b]">
                Bank Sampah
              </span>
            </div>
          </div>

          {/* PAGE */}
          <main className="min-h-screen w-full">
            {children}
          </main>

        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}

// Icon kecil untuk mobile header
function RecycleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 19-2-3.5 2.5-1.5" />
      <path d="M5 15.5h6" />
      <path d="m17 5 2 3.5-2.5 1.5" />
      <path d="M19 8.5h-6" />
      <path d="m8 5 4-2 1 3" />
      <path d="M12 3 8.5 9" />
      <path d="m16 19-4 2-1-3" />
      <path d="m12 21 3.5-6" />
    </svg>
  );
}