"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiJson, formatApiError } from "@/lib/api";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const SEDE_AUTH_STORAGE_KEY = "monitoramento_sede_auth";

type SedeLoginResponse = {
    ok: boolean;
    colaborador_id: string;
    nome: string;
    setor_id: string;
};

function formatCpfDigits(cpfDigits: string) {
    const d = cpfDigits.replace(/\D/g, "").slice(0, 11);
    if (d.length !== 11) return d;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

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
            const cpfDigits = cpf.replace(/\D/g, "");
            let data: SedeLoginResponse;
            try {
                data = await apiJson<SedeLoginResponse>("auth/colaborador-login/", {
                    method: "POST",
                    auth: false,
                    body: JSON.stringify({
                        cpf: cpfDigits,
                        senha: senha.trim(),
                    }),
                });
            } catch {
                data = await apiJson<SedeLoginResponse>("auth/colaborador-login/", {
                    method: "POST",
                    auth: false,
                    body: JSON.stringify({
                        cpf: formatCpfDigits(cpfDigits),
                        senha: senha.trim(),
                    }),
                });
            }

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
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
                <div className="mx-auto flex w-[92vw] max-w-[1400px] items-center justify-between gap-3 px-4 py-4">
                    <Link href="/" className="flex items-center gap-2" aria-label="Voltar para início">
                        <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-sm ring-1 ring-black/5">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-8 w-auto" priority />
                        </div>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <section className="w-[92vw] max-w-[560px] mx-auto px-4 py-10">
                <div className="card">
                    <h1 className="text-xl font-bold text-text-primary mb-1">Login - Colaborador da Sede</h1>
                    <p className="text-sm text-text-secondary mb-6">
                        Use seu CPF como usuário e sua data de nascimento (DDMMAAAA) como senha.
                        <br />
                        Ex.: se nasceu em <span className="font-semibold">05/07/1981</span> use <span className="font-semibold">05071981</span>.
                    </p>

                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            className="input-field"
                            placeholder="CPF (somente números)"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                            autoComplete="username"
                            inputMode="numeric"
                            maxLength={11}
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
