"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import type { AcaoSocial, Colaborador, Inscricao, Setor } from "@/lib/types";

function distribuirVagasProporcional(
    vagasLimite: number,
    setorMemberCount: Record<string, number>,
): Record<string, number> {
    const entries = Object.entries(setorMemberCount).filter(([, count]) => count > 0);
    const totalInternos = entries.reduce((acc, [, count]) => acc + count, 0);
    if (vagasLimite <= 0 || totalInternos <= 0 || entries.length === 0) return {};

    const base: Record<string, number> = {};
    const restos: { setorId: string; resto: number }[] = [];
    let somaBase = 0;

    entries.forEach(([setorId, count]) => {
        const quota = (vagasLimite * count) / totalInternos;
        const floorVal = Math.floor(quota);
        base[setorId] = floorVal;
        somaBase += floorVal;
        restos.push({ setorId, resto: quota - floorVal });
    });

    let sobrando = vagasLimite - somaBase;
    restos.sort((a, b) => b.resto - a.resto);
    for (let i = 0; i < restos.length && sobrando > 0; i += 1) {
        base[restos[i].setorId] += 1;
        sobrando -= 1;
    }

    return base;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

type InscricoesPorAcaoSetor = Record<string, Record<string, number>>;

export default function MetasPorSetorPage() {
    const router = useRouter();
    const [acoes, setAcoes] = useState<AcaoSocial[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [setorInternalCounts, setSetorInternalCounts] = useState<Record<string, number>>({});
    const [inscricoesPorAcaoSetor, setInscricoesPorAcaoSetor] = useState<InscricoesPorAcaoSetor>({});
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
                const [acoesData, setoresData, colaboradoresData, inscricoesData] = await Promise.all([
                    apiJson<AcaoSocial[]>("acoes_sociais/?ordering=-data_evento", { auth: true }),
                    apiJson<Setor[]>("setores/?ordering=nome", { auth: true }),
                    apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: true }),
                    apiJson<Inscricao[]>("inscricoes/?ordering=-created_at", { auth: true }),
                ]);

                const counts: Record<string, number> = {};
                colaboradoresData.forEach((c) => {
                    if (!c.is_externo && c.setor_id) {
                        counts[c.setor_id] = (counts[c.setor_id] || 0) + 1;
                    }
                });

                const byAcaoSetor: InscricoesPorAcaoSetor = {};
                inscricoesData.forEach((insc) => {
                    const colab = insc.colaboradores as Colaborador | undefined;
                    if (!colab || colab.is_externo || !colab.setor_id) return;
                    if (!byAcaoSetor[insc.acao_id]) byAcaoSetor[insc.acao_id] = {};
                    byAcaoSetor[insc.acao_id][colab.setor_id] = (byAcaoSetor[insc.acao_id][colab.setor_id] || 0) + 1;
                });

                setAcoes(acoesData);
                setSetores(setoresData);
                setSetorInternalCounts(counts);
                setInscricoesPorAcaoSetor(byAcaoSetor);
            } catch (e) {
                setError(formatApiError(e));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [router]);

    const setorNome = useMemo(() => {
        const map: Record<string, string> = {};
        setores.forEach((s) => {
            map[s.id] = s.nome;
        });
        return map;
    }, [setores]);

    if (loading) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-8">
                <p className="text-text-secondary">Carregando metas por setor...</p>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Ações e Metas por Setor</h1>
                    <p className="text-sm text-text-secondary">
                        Metas proporcionais por quantidade de colaboradores internos em cada setor.
                    </p>
                </div>
                <Link href="/admin" className="btn btn-outline">Voltar ao Admin</Link>
            </div>

            {error && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {acoes.map((acao) => {
                    const metas = (acao.vagas_por_setor && Object.keys(acao.vagas_por_setor).length > 0)
                        ? (acao.vagas_por_setor as Record<string, number>)
                        : distribuirVagasProporcional(acao.vagas_limite, setorInternalCounts);
                    const metasEntries = Object.entries(metas).filter(([, m]) => m > 0);
                    const inscricoesSetor = inscricoesPorAcaoSetor[acao.id] || {};
                    const totalMeta = metasEntries.reduce((acc, [, v]) => acc + v, 0);
                    const totalInternosInscritos = metasEntries.reduce(
                        (acc, [setorId]) => acc + (inscricoesSetor[setorId] || 0),
                        0,
                    );

                    return (
                        <section key={acao.id} className="card">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary">{acao.titulo}</h2>
                                    <p className="text-xs text-text-secondary">{formatDate(acao.data_evento)}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${acao.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                    {acao.ativo ? "Ativa" : "Inativa"}
                                </span>
                            </div>

                            <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div className="rounded bg-gray-50 px-3 py-2">
                                    <span className="text-text-secondary">Vagas globais</span>
                                    <p className="text-text-primary font-bold">{acao.vagas_limite}</p>
                                </div>
                                <div className="rounded bg-gray-50 px-3 py-2">
                                    <span className="text-text-secondary">Meta total setores</span>
                                    <p className="text-text-primary font-bold">{totalMeta}</p>
                                </div>
                                <div className="rounded bg-gray-50 px-3 py-2">
                                    <span className="text-text-secondary">Inscritos internos</span>
                                    <p className="text-text-primary font-bold">{totalInternosInscritos}</p>
                                </div>
                                <div className="rounded bg-gray-50 px-3 py-2">
                                    <span className="text-text-secondary">Atingimento geral</span>
                                    <p className="text-text-primary font-bold">
                                        {totalMeta > 0 ? `${Math.min(100, Math.round((totalInternosInscritos / totalMeta) * 100))}%` : "0%"}
                                    </p>
                                </div>
                            </div>

                            {metasEntries.length === 0 ? (
                                <p className="text-sm text-text-secondary">Sem meta por setor para esta ação.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-text-secondary">
                                                <th className="py-2 pr-3">Setor</th>
                                                <th className="py-2 pr-3">Internos no setor</th>
                                                <th className="py-2 pr-3">Meta</th>
                                                <th className="py-2 pr-3">Inscritos</th>
                                                <th className="py-2">Atingimento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {metasEntries
                                                .sort((a, b) => (setorNome[a[0]] || "").localeCompare(setorNome[b[0]] || ""))
                                                .map(([setorId, meta]) => {
                                                    const inscritos = inscricoesSetor[setorId] || 0;
                                                    const pct = meta > 0 ? Math.min(100, Math.round((inscritos / meta) * 100)) : 0;
                                                    return (
                                                        <tr key={setorId} className="border-b border-gray-50">
                                                            <td className="py-2 pr-3 font-medium text-text-primary">{setorNome[setorId] || "Setor removido"}</td>
                                                            <td className="py-2 pr-3">{setorInternalCounts[setorId] || 0}</td>
                                                            <td className="py-2 pr-3 font-semibold">{meta}</td>
                                                            <td className="py-2 pr-3">{inscritos}</td>
                                                            <td className="py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-28 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${pct >= 100 ? "bg-green-500" : "bg-primary"}`}
                                                                            style={{ width: `${pct}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs font-semibold">{pct}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    );
                })}

                {acoes.length === 0 && (
                    <div className="card text-sm text-text-secondary">
                        Nenhuma ação cadastrada.
                    </div>
                )}
            </div>
        </main>
    );
}
