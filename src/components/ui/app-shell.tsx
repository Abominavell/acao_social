import Link from "next/link";
import { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";

type NavItem = { href: string; label: string };

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  nav?: NavItem[];
  accent?: "light" | "dark";
};

export function AppShell({
  children,
  title,
  subtitle,
  nav = [],
  accent = "light",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur ${
          accent === "dark"
            ? "border-white/10 bg-slate-950/85 text-white"
            : "border-slate-200 bg-white/90 text-slate-900"
        }`}
      >
        <div className="mx-auto flex w-[95vw] max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <BrandLogo compact />
          {nav.length > 0 ? (
            <nav className="flex items-center gap-2" aria-label="Navegação principal">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    accent === "dark"
                      ? "text-slate-200 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-[95vw] max-w-[1600px] px-4 py-8">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
        </section>
        {children}
      </main>
    </div>
  );
}
