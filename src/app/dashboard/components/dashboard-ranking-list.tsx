import type { RankingSetor } from "@/lib/types";

export function DashboardRankingList({ ranking }: { ranking: RankingSetor[] }) {
  return (
    <div className="mt-8 overflow-hidden border border-slate-200 bg-white dark:border-white/20 dark:bg-white/10">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-white/10">
        <h2 className="font-bold text-slate-900 dark:text-white">Engajamento por Setor</h2>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {ranking.map((item, i) => (
          <div key={item.setor_id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-8 text-center">
              <span className="text-sm font-bold text-slate-500 dark:text-white/50">{i + 1}º</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{item.setor_nome}</p>
              <p className="text-xs text-emerald-700 dark:text-accent">
                {item.participantes_unicos} confirmadas / meta {item.meta_setor || 0}
              </p>
            </div>
            <div className="hidden md:block flex-1 max-w-xs">
              <div className="h-3 w-full overflow-hidden bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary-light transition-all duration-700"
                  style={{ width: `${item.taxa_engajamento}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{item.taxa_engajamento}%</p>
              <p className="text-[10px] font-medium text-emerald-700 dark:text-accent">meta atingida</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
