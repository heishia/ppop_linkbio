"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        // 모바일 레이아웃
        <div className="flex min-h-screen flex-col bg-gray-50">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto pb-20">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      ) : (
        // 데스크톱 레이아웃
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}
