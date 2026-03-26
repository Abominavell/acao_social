import type { DataProjeto } from "@/lib/types";

type GroupedMonth = {
  label: string;
  items: DataProjeto[];
};

type Props = {
  projectNames: string[];
  filterProjectTitle: string;
  onFilterProjectTitle: (value: string) => void;
  datasProjetos: DataProjeto[];
  loading: boolean;
  filteredDatas: DataProjeto[];
  groupedByMonth: GroupedMonth[];
  existingDataByProjetoId: Record<string, string>;
  selectedSetor: string;
  statsByDataTotal: Record<string, number>;
  statsByDataSetor: Record<string, Record<string, number>>;
  selectedDataProjetoId: string;
  onSelectDataProjetoId: (value: string) => void;
  formatDateShort: (dateStr: string) => string;
};

export function ProjectDateSelector({
  projectNames,
  filterProjectTitle,
  onFilterProjectTitle,
  datasProjetos,
  loading,
  filteredDatas,
  groupedByMonth,
  existingDataByProjetoId,
  selectedSetor,
  statsByDataTotal,
  statsByDataSetor,
  selectedDataProjetoId,
  onSelectDataProjetoId,
  formatDateShort,
}: Props) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-white/10 bg-slate-900/80 p-4 md:p-5">
      <h3 className="mb-1 text-base font-bold text-white">3. Escolha projeto e data</h3>
      <p className="mb-4 text-xs text-slate-300">Selecione a melhor opção para confirmar sua participação.</p>

      {projectNames.length > 1 ? (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-medium">Filtrar por projeto:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onFilterProjectTitle("all")} className={`filter-tab ${filterProjectTitle === "all" ? "filter-tab-active" : ""}`}>
              Todos ({datasProjetos.length})
            </button>
            {projectNames.map((name) => {
              const count = datasProjetos.filter((d) => d.projetos?.titulo === name).length;
              return (
                <button key={name} onClick={() => onFilterProjectTitle(name)} className={`filter-tab ${filterProjectTitle === name ? "filter-tab-active" : ""}`}>
                  {name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {loading && datasProjetos.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-800/60 py-8 text-center">
          <p className="text-slate-300">Carregando datas...</p>
        </div>
      ) : filteredDatas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-slate-800/60 py-8 text-center">
          <p className="text-slate-300">Nenhuma data disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMonth.map((group) => (
            <div key={group.label}>
              <h4 className="sticky top-16 z-10 mb-2 bg-slate-950/95 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.items.map((data) => {
                  const projectId = data.projetos?.id || "";
                  const existingDataId = existingDataByProjetoId[projectId];
                  const isSelectedExisting = existingDataId && existingDataId === data.id;

                  let limit = data.vagas_limite;
                  let inscritos = statsByDataTotal[data.id] || 0;

                  if (selectedSetor && data.vagas_por_setor && typeof data.vagas_por_setor[selectedSetor] === "number") {
                    limit = data.vagas_por_setor[selectedSetor];
                    inscritos = statsByDataSetor[data.id]?.[selectedSetor] || 0;
                  }

                  const vagasRestantes = limit - inscritos;
                  const esgotado = vagasRestantes <= 0;
                  const disabledByDuplicate = !!existingDataId && existingDataId !== data.id;
                  const disabled = disabledByDuplicate || (esgotado && !isSelectedExisting);

                  const badgeText = disabledByDuplicate
                    ? "Já inscrito neste projeto"
                    : isSelectedExisting
                      ? "Sua inscrição"
                      : esgotado
                        ? "Esgotado"
                        : `${vagasRestantes} vaga${vagasRestantes !== 1 ? "s" : ""} restante`;

                  return (
                    <button
                      key={data.id}
                      disabled={disabled}
                      onClick={() => !disabled && onSelectDataProjetoId(data.id)}
                      className={`w-full text-left flex items-start gap-3 rounded-xl p-3 transition-all border ${
                        selectedDataProjetoId === data.id
                          ? "bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-300 cursor-pointer"
                          : disabled
                            ? "bg-slate-800/60 border-transparent opacity-60 cursor-not-allowed"
                            : "bg-slate-800/70 border-transparent hover:bg-slate-800 cursor-pointer"
                      }`}
                    >
                      <div className={`flex flex-col flex-shrink-0 w-16 text-center rounded-lg overflow-hidden shadow-sm ${selectedDataProjetoId === data.id ? "bg-emerald-700 text-white" : "bg-slate-700 text-slate-200"}`}>
                        <div className="py-1.5 text-xs font-bold border-b border-black/15">
                          {formatDateShort(data.data_evento)}
                        </div>
                        <div className={`py-1 text-[10px] font-medium ${selectedDataProjetoId === data.id ? "bg-emerald-900" : "bg-slate-600"}`}>
                          {new Date(data.data_evento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className="mb-1 block text-sm font-semibold leading-tight text-white">
                          {data.projetos?.titulo || "Projeto"}
                        </span>

                        <div className={`text-[11px] inline-flex items-center px-1.5 py-0.5 rounded ${
                          disabledByDuplicate || isSelectedExisting
                            ? "bg-amber-50 text-amber-700 font-semibold"
                            : esgotado
                              ? "bg-red-50 text-error font-semibold"
                              : "bg-emerald-500/20 text-emerald-200 font-medium"
                        }`}
                        >
                          {badgeText}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
