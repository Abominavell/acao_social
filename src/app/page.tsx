import Link from "next/link";
import { MarketingHeader } from "@/components/layout/marketing-header";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MarketingHeader />

      <main className="mx-auto w-[95vw] max-w-[1600px] px-4 py-12">
        <section className="grid gap-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 px-6 py-10 text-slate-900 shadow-2xl dark:border-white/10 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 dark:text-white md:grid-cols-2 md:px-10">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-300/50 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100">
              Plataforma SaaS de voluntariado
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              Menos esforço para participar, mais impacto para transformar
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-600 dark:text-slate-200 md:text-base">
              Centralize inscrições, confirme presença com previsibilidade e acompanhe resultados em uma experiência moderna e
              profissional.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/inscricao"
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-500 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
              >
                Começar inscrição
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 hover:bg-white/80 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
              >
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
              <article
                key={label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur dark:border-white/15 dark:bg-white/5"
              >
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-200">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Fluxo guiado", "Inscrição em etapas, com menos erro e abandono."],
            ["Gestão operacional", "Confirmação de presença e administração por projeto."],
            ["Métricas acionáveis", "Engajamento por setor com visão consolidada."],
          ].map(([t, desc]) => (
            <article
              key={t}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Acessos rápidos</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Link
              href="/inscricao"
              className="rounded-xl border border-slate-200 p-4 hover:border-emerald-400 hover:bg-emerald-50 dark:border-white/10 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/10"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Nova inscrição</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Escolha projeto e data em poucos cliques.</p>
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-200 p-4 hover:border-emerald-400 hover:bg-emerald-50 dark:border-white/10 dark:hover:border-emerald-300 dark:hover:bg-emerald-500/10"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Painel executivo</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Acompanhe engajamento e cobertura anual.</p>
            </Link>
            <article className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Acompanhamento público</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Visualize indicadores e acompanhe os resultados das ações.
              </p>
            </article>
          </div>
          <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-500">
            Equipe autorizada: acesso administrativo em{" "}
            <Link href="/admin/login" className="underline hover:text-slate-800 dark:hover:text-slate-300">
              /admin/login
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
