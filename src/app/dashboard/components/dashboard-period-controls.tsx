type Periodo = "mes" | "ano" | "custom";

type Props = {
  periodo: Periodo;
  selectedMonth: number;
  selectedYear: number;
  onPeriodoChange: (value: Periodo) => void;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
};

export function DashboardPeriodControls({
  periodo,
  selectedMonth,
  selectedYear,
  onPeriodoChange,
  onMonthChange,
  onYearChange,
}: Props) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      <div className="flex rounded bg-emerald-100 p-1 dark:bg-primary-dark/40">
        <button
          className={`rounded-l px-6 py-2 text-sm font-semibold transition-all ${periodo === "mes" ? "bg-white text-primary shadow-lg" : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}
          onClick={() => onPeriodoChange("mes")}
        >
          Mês Atual
        </button>
        <button
          className={`px-6 py-2 text-sm font-semibold transition-all ${periodo === "ano" ? "bg-white text-primary shadow-lg" : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}
          onClick={() => onPeriodoChange("ano")}
        >
          Ano Atual
        </button>
        <button
          className={`rounded-r px-6 py-2 text-sm font-semibold transition-all ${periodo === "custom" ? "bg-white text-primary shadow-lg" : "text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"}`}
          onClick={() => onPeriodoChange("custom")}
        >
          Específico
        </button>
      </div>

      {periodo === "custom" ? (
        <div className="flex items-center gap-2 animate-fade-in-up">
          <select
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:focus:border-white/40 [&>option]:text-primary"
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const date = new Date(2000, i, 1);
              return (
                <option key={i} value={i}>
                  {date.toLocaleDateString("pt-BR", { month: "long" }).charAt(0).toUpperCase() + date.toLocaleDateString("pt-BR", { month: "long" }).slice(1)}
                </option>
              );
            })}
          </select>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 dark:border-white/20 dark:bg-white/10 dark:text-white dark:focus:border-white/40 [&>option]:text-primary"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={i} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}
    </div>
  );
}
