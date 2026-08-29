import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { BrandFooter } from "@/components/shared/BrandFooter";
import { AIAssistant } from "@/components/shared/AIAssistant";
import { SchoolProvider } from "@/lib/context/SchoolContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SchoolProvider>
      <div className="min-h-screen bg-zinc-50/30 flex flex-col relative pb-16 md:pb-0">
        <Navbar />
        <div className="flex flex-1 mx-auto w-full max-w-7xl">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <MobileNav />
        <BrandFooter />
        <AIAssistant />
      </div>
    </SchoolProvider>
  );
}
