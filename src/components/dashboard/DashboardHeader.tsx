"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings, PlusCircle, ExternalLink } from "lucide-react";

export const DashboardHeader: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Minhas Galerias", href: "/dashboard", icon: LayoutGrid },
    { label: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-4 z-50 max-w-[1600px] w-full mx-auto px-4 sm:px-8 my-2 transition-all duration-300">
      <div className="bg-zinc-900/75 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Logo Willyam Cortez */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img
              src="/img/logo.png"
              alt="Logo Willyam Cortez"
              className="h-7 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Navegação Principal */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-3">
          <Link
            href="/gallery/mariana-e-rodrigo"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <span>Galeria Demo</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>

          <Link
            href="/galleries/new"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Galeria</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

