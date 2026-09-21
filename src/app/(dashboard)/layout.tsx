import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans selection:bg-accent-gold/30">
      <DashboardHeader />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
