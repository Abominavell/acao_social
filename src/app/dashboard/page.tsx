import { Suspense } from "react";
import type { Metadata } from "next";
import NovoDashboardContent from "./novo-dashboard-content";

export const metadata: Metadata = {
    title: "Dashboard | IADVh Voluntariado",
    description: "Acompanhe engajamento por setor, metas e cobertura anual em tempo real.",
};

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-slate-600">Carregando dashboard...</div>}>
            <NovoDashboardContent />
        </Suspense>
    );
}
