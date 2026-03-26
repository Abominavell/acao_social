import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  onNewInscricao: () => void;
  dashboardIcon: ReactNode;
  successIcon: ReactNode;
};

export function InscricaoSuccessCard({ onNewInscricao, dashboardIcon, successIcon }: Props) {
  return (
    <div className="animate-scale-in rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-emerald-500/15 via-slate-900/90 to-slate-900 p-8 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
        {successIcon}
      </div>
      <h3 className="mb-2 text-2xl font-bold text-emerald-300">Inscrição Realizada!</h3>
      <p className="mb-6 text-slate-300">Sua inscrição foi registrada. Aguarde a confirmação de presença pelo administrador.</p>
      <div className="flex flex-col gap-3">
        <button className="btn btn-primary w-full btn-lg" onClick={onNewInscricao}>Nova Inscrição</button>
        <Link href="/dashboard" className="btn btn-outline w-full btn-lg flex items-center justify-center gap-2 border-slate-500 text-slate-200 hover:bg-slate-800">
          {dashboardIcon} Ver Dashboard
        </Link>
      </div>
    </div>
  );
}
