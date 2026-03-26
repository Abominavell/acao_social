"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/85 dark:text-white">
      <div className="mx-auto flex w-[95vw] max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 md:flex" aria-label="Atalhos">
            <Link
              href="/inscricao"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Inscrição
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/login"
              className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Acesso restrito
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
