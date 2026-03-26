import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

type Setor = { id: string };

async function getSetoresMonitoradosCount() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiBase}/setores/?ordering=nome`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Setor[];
    return Array.isArray(data) ? data.length : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const setoresMonitorados = await getSetoresMonitoradosCount();
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex w-[95vw] max-w-[1600px] items-center justify-between px-4 py-3 text-white">
          <BrandLogo />
          <nav className="hidden items-center gap-2 md:flex" aria-label="Atalhos">
            <Link href="/inscricao" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
              Inscrição
            </Link>
            <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/login" className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white">
              Acesso restrito
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-[95vw] max-w-[1600px] px-4 py-12">
        <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-10 text-white shadow-2xl md:grid-cols-2 md:px-10">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-200/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
              Plataforma SaaS de voluntariado
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Menos esforço para participar, mais impacto para transformar
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-200 md:text-base">
              Centralize inscrições, confirme presença com previsibilidade e acompanhe
              resultados em uma experiência moderna e profissional.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/inscricao" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow hover:bg-emerald-300">
                Começar inscrição
              </Link>
              <Link href="/dashboard" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Ver dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["120+", "Participações no período"],
              [setoresMonitorados !== null ? String(setoresMonitorados) : "—", "Setores monitorados"],
              ["98%", "Cobertura de meta anual"],
              ["45s", "Atualização média de painel"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black text-emerald-200">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-200">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Fluxo guiado", "Inscrição em etapas, com menos erro e abandono."],
            ["Gestão operacional", "Confirmação de presença e administração por projeto."],
            ["Métricas acionáveis", "Engajamento por setor com visão consolidada."],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-sm">
              <h2 className="text-base font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-300">{desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white">Acessos rápidos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Link href="/inscricao" className="rounded-xl border border-white/10 p-4 hover:border-emerald-300 hover:bg-emerald-500/10">
              <p className="text-sm font-semibold text-white">Nova inscrição</p>
              <p className="mt-1 text-xs text-slate-300">Escolha projeto e data em poucos cliques.</p>
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-white/10 p-4 hover:border-emerald-300 hover:bg-emerald-500/10">
              <p className="text-sm font-semibold text-white">Painel executivo</p>
              <p className="mt-1 text-xs text-slate-300">Acompanhe engajamento e cobertura anual.</p>
            </Link>
            <article className="rounded-xl border border-white/10 p-4">
              <p className="text-sm font-semibold text-white">Acompanhamento público</p>
              <p className="mt-1 text-xs text-slate-300">Visualize indicadores e acompanhe os resultados das ações.</p>
            </article>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500">
            Equipe autorizada: acesso administrativo em <Link href="/admin/login" className="underline hover:text-slate-300">/admin/login</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
