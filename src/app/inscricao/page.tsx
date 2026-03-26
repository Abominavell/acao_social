import { Suspense } from "react";
import type { Metadata } from "next";
import NovoInscricaoContent from "./novo-inscricao-content";

export const metadata: Metadata = {
    title: "Inscrição | IADVh Voluntariado",
    description: "Escolha projeto e data para participar das ações sociais.",
};

export default function InscricaoPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-slate-600">Carregando inscrição...</div>}>
            <NovoInscricaoContent />
        </Suspense>
    );
}
