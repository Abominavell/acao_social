import { ReactNode } from "react";

type Props = {
  error: string;
  selectedProjetoTitulo: string;
  selectedDataEventoLabel: string;
  loading: boolean;
  selectedIsAlreadyInscrito: boolean;
  onConfirm: () => void;
  icon: ReactNode;
};

export function InscricaoStickyConfirmBar({
  error,
  selectedProjetoTitulo,
  selectedDataEventoLabel,
  loading,
  selectedIsAlreadyInscrito,
  onConfirm,
  icon,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 shadow-elevated backdrop-blur animate-fade-in-up">
      <div className="w-[92vw] max-w-[1400px] mx-auto px-4 py-3">
        {error ? <div className="mb-2 rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div> : null}

        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">Resumo da inscrição:</p>
            <p className="text-sm font-bold text-white truncate">
              {selectedProjetoTitulo} - {selectedDataEventoLabel}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Confira os dados antes de confirmar sua vaga.</p>
          </div>
          <button
            className="btn btn-primary flex items-center gap-2 flex-shrink-0 shadow-lg"
            onClick={onConfirm}
            disabled={loading || selectedIsAlreadyInscrito}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Inscrevendo...
              </span>
            ) : selectedIsAlreadyInscrito ? (
              <span className="inline-flex items-center gap-2">
                {icon} Já inscrito
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {icon} Confirmar
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
