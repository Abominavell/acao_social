type Props = {
  statsValues: number[];
};

export function DashboardKpiGrid({ statsValues }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div className="bg-white/10 border border-white/20 p-4 text-center">
        <p className="text-2xl md:text-3xl font-black text-white">{statsValues[0]}</p>
        <p className="text-xs text-accent font-medium">Participações</p>
      </div>
      <div className="bg-white/10 border border-white/20 p-4 text-center">
        <p className="text-2xl md:text-3xl font-black text-white">{statsValues[1]}</p>
        <p className="text-xs text-accent font-medium">Setores ativos</p>
      </div>
      <div className="bg-white/10 border border-white/20 p-4 text-center">
        <p className="text-2xl md:text-3xl font-black text-white">{statsValues[2]}</p>
        <p className="text-xs text-accent font-medium">Datas no período</p>
      </div>
      <div className="bg-white/10 border border-white/20 p-4 text-center">
        <p className="text-2xl md:text-3xl font-black text-white">{statsValues[3]}</p>
        <p className="text-xs text-accent font-medium">Externos confirmados</p>
      </div>
    </div>
  );
}
