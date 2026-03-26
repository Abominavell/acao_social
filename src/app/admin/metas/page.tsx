/* eslint-disable react-hooks/exhaustive-deps */
"use client";
// @ts-nocheck

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import type { AcaoSocial, Colaborador, Inscricao, Setor } from "@/lib/types";
import ProjetosMetasAdminContent from "./novo-projetos-metas-admin-content";

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
    return <ProjetosMetasAdminContent />;
    const router = useRouter();
    const [acoes, setAcoes] = useState<AcaoSocial[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [setorInternalCounts, setSetorInternalCounts] = useState<Record<string, number>>({});
    const [inscricoesPorAcaoSetor, setInscricoesPorAcaoSetor] = useState<InscricoesPorAcaoSetor>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"todas" | "ativas" | "inativas">("todas");
    const [periodFilter, setPeriodFilter] = useState<"todas" | "futuras" | "realizadas">("todas");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

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
                    if (!insc.confirmado_presenca) return;
                    const acaoId = insc.acao_id;
                    if (!acaoId) return;
                    if (!byAcaoSetor[acaoId]) byAcaoSetor[acaoId] = {};
                    byAcaoSetor[acaoId][colab.setor_id] = (byAcaoSetor[acaoId][colab.setor_id] || 0) + 1;
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

    const filteredAcoes = useMemo(() => {
        const now = new Date();
        const q = query.trim().toLowerCase();
        return acoes.filter((acao) => {
            if (statusFilter === "ativas" && !acao.ativo) return false;
            if (statusFilter === "inativas" && acao.ativo) return false;

            const dataEvento = new Date(acao.data_evento);
            if (periodFilter === "futuras" && dataEvento < now) return false;
            if (periodFilter === "realizadas" && dataEvento >= now) return false;

            if (q) {
                const haystack = `${acao.titulo} ${acao.descricao || ""}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }, [acoes, query, statusFilter, periodFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredAcoes.length / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedAcoes = filteredAcoes.slice(start, end);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, statusFilter, periodFilter, itemsPerPage]);

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

            <section className="card mb-4">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                            Buscar ação
                        </label>
                        <input
                            className="input-field"
                            placeholder="Ex.: mutirão, campanha..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                            Status
                        </label>
                        <select
                            className="input-field"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        >
                            <option value="todas">Todas</option>
                            <option value="ativas">Ativas</option>
                            <option value="inativas">Inativas</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                            Período
                        </label>
                        <select
                            className="input-field"
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value as typeof periodFilter)}
                        >
                            <option value="todas">Todas</option>
                            <option value="futuras">Futuras</option>
                            <option value="realizadas">Realizadas</option>
                        </select>
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="text-text-secondary">
                        Exibindo <strong>{pagedAcoes.length}</strong> de <strong>{filteredAcoes.length}</strong> ações filtradas
                    </p>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-text-secondary">Itens por página</label>
                        <select
                            className="rounded border border-gray-200 bg-white px-2 py-1 text-sm"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>
            </section>

            <div className="space-y-4">
                {pagedAcoes.map((acao) => {
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
                    const totalFuncionariosEmpresa = Object.values(setorInternalCounts).reduce(
                        (acc, count) => acc + count,
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
                                    <span className="text-text-secondary">Presenças confirmadas</span>
                                    <p className="text-text-primary font-bold">{totalInternosInscritos}</p>
                                </div>
                                <div className="rounded bg-gray-50 px-3 py-2">
                                    <span className="text-text-secondary">Engajamento geral</span>
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
                                                <th className="py-2 pr-3">% da empresa</th>
                                                <th className="py-2 pr-3">Meta</th>
                                                <th className="py-2 pr-3">Confirmados</th>
                                                <th className="py-2">Engajamento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {metasEntries
                                                .sort((a, b) => (setorNome[a[0]] || "").localeCompare(setorNome[b[0]] || ""))
                                                .map(([setorId, meta]) => {
                                                    const inscritos = inscricoesSetor[setorId] || 0;
                                                    const pct = meta > 0 ? Math.min(100, Math.round((inscritos / meta) * 100)) : 0;
                                                    const internosSetor = setorInternalCounts[setorId] || 0;
                                                    const percentualEmpresa = totalFuncionariosEmpresa > 0
                                                        ? (internosSetor / totalFuncionariosEmpresa) * 100
                                                        : 0;
                                                    return (
                                                        <tr key={setorId} className="border-b border-gray-50">
                                                            <td className="py-2 pr-3 font-medium text-text-primary">{setorNome[setorId] || "Setor removido"}</td>
                                                            <td className="py-2 pr-3">{internosSetor}</td>
                                                            <td className="py-2 pr-3">{percentualEmpresa.toFixed(1)}%</td>
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

                {filteredAcoes.length === 0 && (
                    <div className="card text-sm text-text-secondary">
                        Nenhuma ação encontrada com os filtros aplicados.
                    </div>
                )}
            </div>

            {filteredAcoes.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded border border-gray-200 bg-white px-4 py-2 text-sm">
                    <span className="text-text-secondary">
                        Página {safePage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            className="btn btn-outline text-xs"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                        >
                            Anterior
                        </button>
                        <button
                            className="btn btn-outline text-xs"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
