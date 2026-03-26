"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

type WorkspaceShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  navItems?: NavItem[];
};

export function WorkspaceShell({
  title,
  subtitle,
  children,
  rightSlot,
  navItems = [],
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur supports-[backdrop-filter]:bg-opacity-85 dark:border-white/10 dark:bg-slate-950/85 dark:text-white">
        <div className="mx-auto grid min-h-[84px] w-[95vw] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4">
          <BrandLogo compact />
          {navItems.length > 0 ? (
            <nav className="hidden items-center justify-center gap-3 md:flex" aria-label="Navegação">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-5 py-2.5 text-base font-bold tracking-tight transition",
                    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    "dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
            {rightSlot}
          </div>
        </div>
      </header>

      <main
        className="mx-auto w-[95vw] max-w-[1600px] px-4 py-8"
      >
        <section className="mb-6">
          <h1
            className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl"
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          ) : null}
        </section>
        {children}
      </main>
    </div>
  );
}
