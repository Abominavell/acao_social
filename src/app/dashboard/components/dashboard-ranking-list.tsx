import type { RankingSetor } from "@/lib/types";

export function DashboardRankingList({ ranking }: { ranking: RankingSetor[] }) {
  return (
    <div className="mt-8 bg-white/10 border border-white/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-white font-bold">Engajamento por Setor</h2>
      </div>
      <div className="divide-y divide-white/10">
        {ranking.map((item, i) => (
          <div key={item.setor_id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-8 text-center">
              <span className="text-white/50 font-bold text-sm">{i + 1}º</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{item.setor_nome}</p>
              <p className="text-accent text-xs">
                {item.participantes_unicos} confirmadas / meta {item.meta_setor || 0}
              </p>
            </div>
            <div className="hidden md:block flex-1 max-w-xs">
              <div className="w-full bg-white/10 h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary-light transition-all duration-700"
                  style={{ width: `${item.taxa_engajamento}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">{item.taxa_engajamento}%</p>
              <p className="text-accent text-[10px] font-medium">meta atingida</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
