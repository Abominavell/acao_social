"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import type { Colaborador, DataProjeto, Inscricao, Setor } from "@/lib/types";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default function ProjetosMetasAdminContent() {
    const router = useRouter();

    const [datasProjetos, setDatasProjetos] = useState<DataProjeto[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [setorInternalCounts, setSetorInternalCounts] = useState<Record<string, number>>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!getStoredAccessToken()) {
            router.push("/admin/login");
            return;
        }

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [datasData, colaboradoresData, inscricoesData] = await Promise.all([
                    apiJson<DataProjeto[]>("datas_projeto/?ordering=data_evento", { auth: true }),
                    apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: true }),
                    apiJson<Inscricao[]>("inscricoes/?ordering=-created_at", { auth: true }),
                ]);

                const counts: Record<string, number> = {};
                colaboradoresData.forEach((c) => {
                    if (!c.is_externo && c.setor_id) {
                        counts[c.setor_id] = (counts[c.setor_id] || 0) + 1;
                    }
                });

                setDatasProjetos(datasData);
                setSetores(await apiJson<Setor[]>("setores/?ordering=nome", { auth: true }).catch(() => []));
                setSetorInternalCounts(counts);
                setInscricoes(inscricoesData);
            } catch (e) {
                setError(formatApiError(e));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [router]);

    const annualCoverageBySetor = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear + 1, 0, 1);
        const dataToEvento: Record<string, Date> = {};
        datasProjetos.forEach((d) => {
            dataToEvento[d.id] = new Date(d.data_evento);
        });

        const uniqueConfirmedBySetor: Record<string, Set<string>> = {};
        inscricoes.forEach((insc) => {
            if (!insc.confirmado_presenca || !insc.colaborador_id) return;
            const colab = insc.colaboradores as Colaborador | undefined;
            if (!colab || colab.is_externo || !colab.setor_id) return;

            const evento = insc.data_projeto_id ? dataToEvento[insc.data_projeto_id] : null;
            if (!evento || evento < yearStart || evento >= yearEnd) return;

            if (!uniqueConfirmedBySetor[colab.setor_id]) uniqueConfirmedBySetor[colab.setor_id] = new Set<string>();
            uniqueConfirmedBySetor[colab.setor_id].add(insc.colaborador_id);
        });

        return setores
            .map((s) => {
                const metaAnualSetor = setorInternalCounts[s.id] || 0;
                const confirmadosUnicos = uniqueConfirmedBySetor[s.id]?.size || 0;
                const coberturaPct = metaAnualSetor > 0 ? Math.min(100, Math.round((confirmadosUnicos / metaAnualSetor) * 100)) : 0;
                return {
                    setorId: s.id,
                    setorNome: s.nome,
                    metaAnualSetor,
                    confirmadosUnicos,
                    coberturaPct,
                };
            })
            .filter((row) => row.metaAnualSetor > 0)
            .sort((a, b) => a.setorNome.localeCompare(b.setorNome));
    }, [inscricoes, datasProjetos, setores, setorInternalCounts]);

    if (loading) {
        return (
            <WorkspaceShell
                title="Cobertura Anual por Setor"
                subtitle="Meta anual de participação por setor."
                navItems={[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/admin", label: "Admin" },
                    { href: "/admin/colaboradores", label: "Colaboradores" },
                ]}
            >
                <p className="text-slate-300">Carregando metas por projeto...</p>
            </WorkspaceShell>
        );
    }

    return (
        <WorkspaceShell
            title="Cobertura Anual por Setor"
            subtitle="Meta anual: garantir participação de todos os colaboradores ao longo do ano."
            navItems={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/admin", label: "Admin" },
                { href: "/admin/setores", label: "Setores" },
            ]}
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Cobertura Anual por Setor</h1>
                    <p className="text-sm text-slate-300">
                        Meta anual: garantir participação de todos os colaboradores ao longo do ano.
                    </p>
                </div>
                <Link href="/admin" className="btn btn-outline">Voltar ao Admin</Link>
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="card mb-4">
                <div className="mb-3">
                    <h2 className="text-lg font-bold text-text-primary">Cobertura anual por setor (meta = 100% do setor)</h2>
                    <p className="text-sm text-text-secondary">
                        Aqui entram todos os setores. Cada colaborador confirmado conta 1x no ano para o seu setor.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left text-text-secondary">
                                <th className="py-2 pr-3">Setor</th>
                                <th className="py-2 pr-3">Meta anual (internos)</th>
                                <th className="py-2 pr-3">Confirmados únicos (ano)</th>
                                <th className="py-2">Cobertura anual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {annualCoverageBySetor.map((row) => (
                                <tr key={row.setorId} className="border-b border-gray-50">
                                    <td className="py-2 pr-3 font-medium text-text-primary">{row.setorNome}</td>
                                    <td className="py-2 pr-3">{row.metaAnualSetor}</td>
                                    <td className="py-2 pr-3">{row.confirmadosUnicos}</td>
                                    <td className="py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-28 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${row.coberturaPct >= 100 ? "bg-green-500" : "bg-primary"}`} style={{ width: `${row.coberturaPct}%` }} />
                                            </div>
                                            <span className="text-xs font-semibold">{row.coberturaPct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </WorkspaceShell>
    );
}

