"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiJson, formatApiError } from "@/lib/api";

const SEDE_AUTH_STORAGE_KEY = "monitoramento_sede_auth";

type SedeLoginResponse = {
    ok: boolean;
    colaborador_id: string;
    nome: string;
    setor_id: string;
};

export default function InscricaoSedeLoginPage() {
    const router = useRouter();
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!cpf.trim() || !senha.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await apiJson<SedeLoginResponse>("auth/colaborador-login/", {
                method: "POST",
                auth: false,
                body: JSON.stringify({
                    cpf: cpf.trim(),
                    senha: senha.trim(),
                }),
            });

            window.sessionStorage.setItem(
                SEDE_AUTH_STORAGE_KEY,
                JSON.stringify({
                    colaborador_id: data.colaborador_id,
                    nome: data.nome,
                    setor_id: data.setor_id,
                }),
            );
            router.push("/inscricao");
        } catch (e) {
            setError(formatApiError(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <header className="header-institutional">
                <div className="w-[92vw] max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Voltar para início">
                        <div className="bg-white/90 px-3 py-1.5 rounded-sm">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-8 w-auto" priority />
                        </div>
                    </Link>
                </div>
            </header>

            <section className="w-[92vw] max-w-[560px] mx-auto px-4 py-10">
                <div className="card">
                    <h1 className="text-xl font-bold text-text-primary mb-1">Login - Colaborador da Sede</h1>
                    <p className="text-sm text-text-secondary mb-6">Use seu CPF como usuário e sua data de nascimento (DDMMAAAA) como senha.</p>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            className="input-field"
                            placeholder="CPF"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            autoComplete="username"
                            required
                        />
                        <input
                            className="input-field"
                            placeholder="Senha (DDMMAAAA)"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar e continuar inscrição"}
                        </button>
                    </form>

                    <Link href="/inscricao" className="btn btn-outline w-full mt-3">
                        Voltar para inscrição
                    </Link>
                </div>
            </section>
        </main>
    );
}
