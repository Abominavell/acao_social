type Props = {
  labels: string[];
  currentStep: number;
};

export function StepIndicator({ labels, currentStep }: Props) {
  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/80">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Progresso da inscrição</p>
        <p className="text-xs font-semibold text-emerald-300">Etapa {currentStep} de {labels.length}</p>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-500"
          style={{ width: `${(currentStep / labels.length) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={label} className="flex flex-col items-center flex-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCurrent
                  ? "bg-emerald-400 text-emerald-950 scale-110 shadow-lg"
                  : isActive
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {isActive && stepNum < currentStep ? "✓" : stepNum}
            </div>
            <span className={`mt-1 text-[11px] text-center font-medium ${isCurrent ? "text-emerald-500 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300"}`}>
              {label}
            </span>
          </div>
        );
      })}
      </div>
    </div>
  );
}
