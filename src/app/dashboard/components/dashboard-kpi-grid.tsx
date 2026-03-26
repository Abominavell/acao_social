type Props = {
  statsValues: number[];
};

export function DashboardKpiGrid({ statsValues }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="border border-slate-200 bg-white p-4 text-center dark:border-white/20 dark:bg-white/10">
        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{statsValues[0]}</p>
        <p className="text-xs font-medium text-emerald-700 dark:text-accent">Participações</p>
      </div>
      <div className="border border-slate-200 bg-white p-4 text-center dark:border-white/20 dark:bg-white/10">
        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{statsValues[1]}</p>
        <p className="text-xs font-medium text-emerald-700 dark:text-accent">Setores ativos</p>
      </div>
      <div className="border border-slate-200 bg-white p-4 text-center dark:border-white/20 dark:bg-white/10">
        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{statsValues[2]}</p>
        <p className="text-xs font-medium text-emerald-700 dark:text-accent">Datas no período</p>
      </div>
      <div className="border border-slate-200 bg-white p-4 text-center dark:border-white/20 dark:bg-white/10">
        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{statsValues[3]}</p>
        <p className="text-xs font-medium text-emerald-700 dark:text-accent">Externos confirmados</p>
      </div>
    </div>
  );
}
