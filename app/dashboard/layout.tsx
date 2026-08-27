import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
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
      <div className="min-h-screen bg-zinc-50/30 flex flex-col relative">
        <Navbar />
        <div className="flex flex-1 mx-auto w-full max-w-7xl">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <BrandFooter />
        <AIAssistant />
      </div>
    </SchoolProvider>
  );
}
