import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import NovoProjetoAdminContent from "./novo-projeto-admin-content";

export const metadata: Metadata = {
    title: "Admin | IADVh Voluntariado",
    description: "Gerencie projetos, datas, inscrições e presença dos voluntários.",
};

export default function AdminPageWithAuth() {
    return (
        <AuthProvider>
            <Suspense fallback={<div className="p-8 text-sm text-slate-600">Carregando administração...</div>}>
                <NovoProjetoAdminContent />
            </Suspense>
        </AuthProvider>
    );
}
