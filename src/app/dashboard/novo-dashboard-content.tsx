"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";
import type { Colaborador, DataProjeto, Inscricao, RankingSetor, Setor } from "@/lib/types";
import { DashboardPeriodControls } from "@/app/dashboard/components/dashboard-period-controls";
import { DashboardKpiGrid } from "@/app/dashboard/components/dashboard-kpi-grid";
import { DashboardRankingList } from "@/app/dashboard/components/dashboard-ranking-list";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

function EngagementHorizontalBar({ percent }: { percent: number }) {
    const p = Math.max(0, Math.min(100, percent));
    const markerLeft = `${p}%`;

    const label =
        p >= 100
            ? "Meta atingida"
            : p >= 75
                ? "Muito bom"
                : p >= 50
                    ? "Em evolução"
                    : "Atenção";

    return (
        <div className="w-full">
            <div className="relative">
                <div className="flex justify-between text-[10px] text-white/40 mb-2 px-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>

                <div className="h-4 rounded-full bg-white/10 overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: `${p}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: markerLeft }}>
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]" />
                    </div>
                </div>

                <div
                    className="absolute -top-2.5 -translate-x-1/2 pointer-events-none text-[10px] font-semibold text-white px-2 py-1 rounded-full"
                    style={{ left: markerLeft, background: "rgba(17, 24, 39, 0.85)" }}
                >
                    {p}%
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <p className="text-white font-semibold">{label}</p>
                <p className="text-white/60 text-xs">{p}% do objetivo</p>
            </div>
        </div>
    );
}

function distributeVagasProporcional(
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

interface DashboardData {
    ranking: RankingSetor[];
    institutionMetaTotal: number;
    institutionConfirmedTotal: number;
    institutionEngagementPercent: number;
    totalParticipacoes: number;
    totalExternos: number;
    totalInscricoesExternas: number;
    totalDatas: number;
    acoesDisponiveisSede: number;
    acoesDisponiveisFilial: number;
    mediaEngajamentoSetores: number;
    previousParticipacoes: number;
    previousSetoresAtivos: number;
    annualTargetTotal: number;
    annualUniqueConfirmed: number;
    annualCoveragePercent: number;
    monthlyUniqueConfirmed: number;
    monthlyGoalTarget: number;
    monthlyGoalPercent: number;
    quarterlyUniqueConfirmed: number;
    quarterlyGoalTarget: number;
    quarterlyGoalPercent: number;
}

export default function NovoDashboardContent() {
    const [periodo, setPeriodo] = useState<"mes" | "ano" | "custom">("ano");
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const [data, setData] = useState<DashboardData>({
        ranking: [],
        institutionMetaTotal: 0,
        institutionConfirmedTotal: 0,
        institutionEngagementPercent: 0,
        totalParticipacoes: 0,
        totalExternos: 0,
        totalInscricoesExternas: 0,
        totalDatas: 0,
        acoesDisponiveisSede: 0,
        acoesDisponiveisFilial: 0,
        mediaEngajamentoSetores: 0,
        previousParticipacoes: 0,
        previousSetoresAtivos: 0,
        annualTargetTotal: 0,
        annualUniqueConfirmed: 0,
        annualCoveragePercent: 0,
        monthlyUniqueConfirmed: 0,
        monthlyGoalTarget: 0,
        monthlyGoalPercent: 0,
        quarterlyUniqueConfirmed: 0,
        quarterlyGoalTarget: 0,
        quarterlyGoalPercent: 0,
    });

    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchDashboardData = useCallback(async () => {
        const now = new Date();
        let startDate: string;
        let endDate: string | null = null;

        if (periodo === "mes") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        } else if (periodo === "ano") {
            startDate = new Date(now.getFullYear(), 0, 1).toISOString();
            endDate = new Date(now.getFullYear() + 1, 0, 1).toISOString();
        } else {
            startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
            endDate = new Date(selectedYear, selectedMonth + 1, 1).toISOString();
        }

        // Datas/ocorrências do período
        const qDatas = new URLSearchParams();
        qDatas.set("ordering", "-data_evento");
        qDatas.set("data_evento__gte", startDate);
        if (endDate) qDatas.set("data_evento__lte", endDate);

        // Inscrições (confirmadas e não confirmadas) ligadas às ocorrências do período
        const qInsc = new URLSearchParams();
        qInsc.set("ordering", "-created_at");
        qInsc.set("data_evento__gte", startDate);
        if (endDate) qInsc.set("data_evento__lte", endDate);

        // Busca bases
        let setores: Setor[] = [];
        let colaboradores: Colaborador[] = [];
        let datas: DataProjeto[] = [];
        let inscricoes: Inscricao[] = [];
        let yearConfirmedInscricoes: Inscricao[] = [];
        try {
            const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
            const yearEnd = new Date(now.getFullYear() + 1, 0, 1).toISOString();
            const qYear = new URLSearchParams();
            qYear.set("confirmado_presenca", "true");
            qYear.set("data_evento__gte", yearStart);
            qYear.set("data_evento__lte", yearEnd);

            [setores, colaboradores, datas, inscricoes] = await Promise.all([
                apiJson<Setor[]>("setores/?ordering=nome", { auth: false }),
                apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: false }),
                apiJson<DataProjeto[]>(`datas_projeto/?${qDatas.toString()}`, { auth: false }),
                apiJson<Inscricao[]>(`inscricoes/?${qInsc.toString()}`, { auth: false }),
            ]);
            yearConfirmedInscricoes = await apiJson<Inscricao[]>(`inscricoes/?${qYear.toString()}`, { auth: false });
        } catch {
            setLoading(false);
            return;
        }

        const memberCount = new Map<string, number>();
        colaboradores.forEach((c) => {
            if (!c.is_externo && c.setor_id) memberCount.set(c.setor_id, (memberCount.get(c.setor_id) || 0) + 1);
        });

        // Meta por setor (somando vagas_por_setor de todas as datas no período)
        const metaBySetor = new Map<string, number>();
        datas.forEach((dataEvento: DataProjeto) => {
            const vagasPorSetor = (dataEvento.vagas_por_setor || {}) as Record<string, number>;
            const metas = Object.keys(vagasPorSetor).length > 0 ? vagasPorSetor : distributeVagasProporcional(dataEvento.vagas_limite, Object.fromEntries(memberCount));

            Object.entries(metas).forEach(([setorId, meta]) => {
                const metaValida = Number.isFinite(meta) ? Math.max(0, Math.round(meta)) : 0;
                if (!metaValida) return;
                metaBySetor.set(setorId, (metaBySetor.get(setorId) || 0) + metaValida);
            });
        });

        // Confirmados únicos por setor (cada colaborador conta apenas 1x no período)
        const confirmedBySetor = new Map<string, Set<string>>();
        let externCount = 0;
        const externosConfirmadosUnicos = new Set<string>();

        inscricoes.forEach((insc) => {
            const colab = insc.colaboradores as unknown as { is_externo: boolean; setor_id?: string | null };
            if (!colab) return;
            if (colab.is_externo) {
                externCount += 1;
                if (insc.confirmado_presenca && insc.colaborador_id) {
                    externosConfirmadosUnicos.add(insc.colaborador_id);
                }
                return;
            }
            if (!insc.confirmado_presenca) return;
            if (!colab.setor_id) return;
            if (!insc.colaborador_id) return;
            const current = confirmedBySetor.get(colab.setor_id) || new Set<string>();
            current.add(insc.colaborador_id);
            confirmedBySetor.set(colab.setor_id, current);
        });


        const ranking: RankingSetor[] = setores
            .map((s) => {
                const totalMembers = memberCount.get(s.id) || 1;
                const metaSetor = metaBySetor.get(s.id) || 0;
                const participacoesSetor = (confirmedBySetor.get(s.id) || new Set<string>()).size;
                const taxa = metaSetor > 0 ? Math.min(100, Math.round((participacoesSetor / metaSetor) * 100)) : 0;
                return {
                    setor_id: s.id,
                    setor_nome: s.nome,
                    participantes_unicos: participacoesSetor,
                    total_membros: totalMembers,
                    meta_setor: metaSetor,
                    taxa_engajamento: taxa,
                };
            })
            .sort(
                (a, b) =>
                    b.taxa_engajamento - a.taxa_engajamento ||
                    b.participantes_unicos - a.participantes_unicos ||
                    b.total_membros - a.total_membros,
            );


        // Disponibilidade por ocorrência (data)
        const usageByData = new Map<string, { total: number; internosPorSetor: Record<string, number> }>();
        inscricoes.forEach((insc) => {
            const dataId = insc.data_projeto_id;
            if (!dataId) return;
            const current = usageByData.get(dataId) || { total: 0, internosPorSetor: {} };
            current.total += 1;
            const colab = insc.colaboradores as unknown as { is_externo: boolean; setor_id?: string | null };
            if (!colab?.is_externo && colab?.setor_id) {
                current.internosPorSetor[colab.setor_id] = (current.internosPorSetor[colab.setor_id] || 0) + 1;
            }
            usageByData.set(dataId, current);
        });

        let acoesDisponiveisSede = 0;
        let acoesDisponiveisFilial = 0;
        datas.forEach((d) => {
            const usage = usageByData.get(d.id) || { total: 0, internosPorSetor: {} };

            if (usage.total < d.vagas_limite) acoesDisponiveisFilial += 1;

            const vagasPorSetor = (d.vagas_por_setor || {}) as Record<string, number>;
            const hasSetorLimit = Object.keys(vagasPorSetor).length > 0;
            if (hasSetorLimit) {
                const hasAnySectorSlot = Object.entries(vagasPorSetor).some(([setorId, limite]) => (usage.internosPorSetor[setorId] || 0) < limite);
                if (hasAnySectorSlot) acoesDisponiveisSede += 1;
            } else if (usage.total < d.vagas_limite) {
                acoesDisponiveisSede += 1;
            }
        });

        // Período anterior para comparação
        let prevStartDate: string;
        let prevEndDate: string;
        if (periodo === "mes") {
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else if (periodo === "ano") {
            prevStartDate = new Date(now.getFullYear() - 1, 0, 1).toISOString();
            prevEndDate = new Date(now.getFullYear(), 0, 1).toISOString();
        } else {
            prevStartDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
            prevEndDate = new Date(selectedYear, selectedMonth, 1).toISOString();
        }

        let prevInscricoes: Inscricao[] = [];
        try {
            const qPrev = new URLSearchParams();
            qPrev.set("confirmado_presenca", "true");
            qPrev.set("data_evento__gte", prevStartDate);
            qPrev.set("data_evento__lte", prevEndDate);
            prevInscricoes = await apiJson<Inscricao[]>(`inscricoes/?${qPrev.toString()}`, { auth: false });
        } catch {
            prevInscricoes = [];
        }

        const prevSetores = new Set<string>();
        prevInscricoes.forEach((insc) => {
            const c = insc.colaboradores as unknown as { is_externo: boolean; setor_id?: string | null };
            if (c && !c.is_externo && c.setor_id) prevSetores.add(c.setor_id);
        });

        const annualTargetTotal = colaboradores.filter((c) => !c.is_externo && !!c.setor_id).length;
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 1);

        const annualUniqueInternal = new Set<string>();
        const monthlyUniqueInternal = new Set<string>();
        const quarterlyUniqueInternal = new Set<string>();
        const annualConfirmedBySetor = new Map<string, Set<string>>();

        yearConfirmedInscricoes.forEach((insc) => {
            const colab = insc.colaboradores as Colaborador | undefined;
            if (!insc.confirmado_presenca || !insc.colaborador_id || !colab || colab.is_externo) return;
            annualUniqueInternal.add(insc.colaborador_id);
            if (colab.setor_id) {
                const current = annualConfirmedBySetor.get(colab.setor_id) || new Set<string>();
                current.add(insc.colaborador_id);
                annualConfirmedBySetor.set(colab.setor_id, current);
            }

            const dataEvento = insc.datas_projeto?.data_evento ? new Date(insc.datas_projeto.data_evento) : null;
            if (!dataEvento) return;
            if (dataEvento >= monthStart && dataEvento < monthEnd) {
                monthlyUniqueInternal.add(insc.colaborador_id);
            }
            if (dataEvento >= quarterStart && dataEvento < quarterEnd) {
                quarterlyUniqueInternal.add(insc.colaborador_id);
            }
        });

        const annualUniqueConfirmed = annualUniqueInternal.size;
        const annualCoveragePercent = annualTargetTotal > 0 ? Math.min(100, Math.round((annualUniqueConfirmed / annualTargetTotal) * 100)) : 0;
        const monthlyGoalTarget = Math.max(1, Math.ceil(annualTargetTotal / 12));
        const quarterlyGoalTarget = Math.max(1, Math.ceil(annualTargetTotal / 4));
        const monthlyUniqueConfirmed = monthlyUniqueInternal.size;
        const quarterlyUniqueConfirmed = quarterlyUniqueInternal.size;
        const monthlyGoalPercent = monthlyGoalTarget > 0 ? Math.min(100, Math.round((monthlyUniqueConfirmed / monthlyGoalTarget) * 100)) : 0;
        const quarterlyGoalPercent = quarterlyGoalTarget > 0 ? Math.min(100, Math.round((quarterlyUniqueConfirmed / quarterlyGoalTarget) * 100)) : 0;

        const rankingAnnual: RankingSetor[] = setores
            .map((s) => {
                const totalMembers = memberCount.get(s.id) || 0;
                const participacoesSetor = (annualConfirmedBySetor.get(s.id) || new Set<string>()).size;
                const taxa = totalMembers > 0 ? Math.min(100, Math.round((participacoesSetor / totalMembers) * 100)) : 0;
                return {
                    setor_id: s.id,
                    setor_nome: s.nome,
                    participantes_unicos: participacoesSetor,
                    total_membros: totalMembers,
                    meta_setor: totalMembers,
                    taxa_engajamento: taxa,
                };
            })
            .sort(
                (a, b) =>
                    b.taxa_engajamento - a.taxa_engajamento ||
                    b.participantes_unicos - a.participantes_unicos ||
                    b.total_membros - a.total_membros,
            );
        const mediaEngajamentoSetoresAnnual = rankingAnnual.length > 0 ? Math.round(rankingAnnual.reduce((sum, item) => sum + item.taxa_engajamento, 0) / rankingAnnual.length) : 0;

        setData({
            ranking: rankingAnnual,
            institutionMetaTotal: annualTargetTotal,
            institutionConfirmedTotal: annualUniqueConfirmed,
            institutionEngagementPercent: annualCoveragePercent,
            totalParticipacoes: inscricoes.length,
            totalExternos: externosConfirmadosUnicos.size,
            totalInscricoesExternas: externCount,
            totalDatas: datas.length,
            acoesDisponiveisSede,
            acoesDisponiveisFilial,
            mediaEngajamentoSetores: mediaEngajamentoSetoresAnnual,
            previousParticipacoes: prevInscricoes.length,
            previousSetoresAtivos: prevSetores.size,
            annualTargetTotal,
            annualUniqueConfirmed,
            annualCoveragePercent,
            monthlyUniqueConfirmed,
            monthlyGoalTarget,
            monthlyGoalPercent,
            quarterlyUniqueConfirmed,
            quarterlyGoalTarget,
            quarterlyGoalPercent,
        });
        setLastUpdate(new Date());
        setLoading(false);
    }, [periodo, selectedMonth, selectedYear]);

    useEffect(() => {
        (async () => {
            await fetchDashboardData();
        })();
    }, [fetchDashboardData]);

    useEffect(() => {
        const id = setInterval(() => fetchDashboardData(), 45000);
        return () => clearInterval(id);
    }, [fetchDashboardData]);

    const statsValues = [
        data.totalParticipacoes,
        data.ranking.filter((r) => r.participantes_unicos > 0).length,
        data.totalDatas,
        data.totalExternos,
    ];

    return (
        <WorkspaceShell
            dark
            title="Ranking de Compromisso Social"
            subtitle="Acompanhe o engajamento dos setores em tempo real."
            navItems={[
                { href: "/inscricao", label: "Inscrição" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/admin/login", label: "Acesso restrito" },
            ]}
            rightSlot={
                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-1.5 text-accent text-xs md:flex">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
                    </div>
                    <Link href="/inscricao" className="btn btn-secondary text-xs py-2 px-3">
                        Inscrever-se
                    </Link>
                </div>
            }
        >

                <DashboardPeriodControls
                    periodo={periodo}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onPeriodoChange={setPeriodo}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                />

                {loading ? (
                    <div className="text-center py-16 text-white/70">
                        Carregando dados...
                    </div>
                ) : (
                    <>
                        <DashboardKpiGrid statsValues={statsValues} />

                        <div className="mt-2 mb-8 bg-white/10 border border-white/20 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10">
                                <h2 className="text-white font-bold">Meta Anual de Cobertura</h2>
                                <p className="text-accent text-xs mt-1">Cada colaborador interno conta 1x no ano. Acompanhamento de ritmo mensal e trimestral.</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-accent text-xs uppercase tracking-wide font-semibold">Anual acumulado</p>
                                    <p className="text-white text-2xl font-black mt-1">{data.annualUniqueConfirmed}/{data.annualTargetTotal}</p>
                                    <p className="text-white/70 text-xs mt-2">{data.annualCoveragePercent}% da meta anual</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-accent text-xs uppercase tracking-wide font-semibold">Mês atual</p>
                                    <p className="text-white text-2xl font-black mt-1">{data.monthlyUniqueConfirmed}/{data.monthlyGoalTarget}</p>
                                    <p className="text-white/70 text-xs mt-2">{data.monthlyGoalPercent}% do ritmo mensal</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-accent text-xs uppercase tracking-wide font-semibold">Trimestre atual</p>
                                    <p className="text-white text-2xl font-black mt-1">{data.quarterlyUniqueConfirmed}/{data.quarterlyGoalTarget}</p>
                                    <p className="text-white/70 text-xs mt-2">{data.quarterlyGoalPercent}% do ritmo trimestral</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-accent text-xs uppercase tracking-wide font-semibold">Faltantes no ano</p>
                                    <p className="text-white text-2xl font-black mt-1">{Math.max(0, data.annualTargetTotal - data.annualUniqueConfirmed)}</p>
                                    <p className="text-white/70 text-xs mt-2">colaboradores ainda sem participação</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-white/10 border border-white/20 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                                <h2 className="text-white font-bold text-lg">Engajamento do Instituto</h2>
                                <div className="text-accent text-xs font-semibold">{data.institutionEngagementPercent}%</div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <EngagementHorizontalBar percent={data.institutionEngagementPercent} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <p className="text-accent text-xs uppercase tracking-wide font-semibold">Confirmadas</p>
                                            <p className="text-white text-2xl font-black mt-1">{data.institutionConfirmedTotal}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <p className="text-accent text-xs uppercase tracking-wide font-semibold">Meta anual</p>
                                            <p className="text-white text-2xl font-black mt-1">{data.institutionMetaTotal}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <p className="text-white text-sm">{data.institutionEngagementPercent}% do objetivo</p>
                                            <p className="text-white/60 text-xs mt-2">Cobertura anual: confirmados únicos internos / total de colaboradores internos.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DashboardRankingList ranking={data.ranking} />

                        <div className="bg-white/5 border border-white/10 p-4 mt-8">
                            <p className="text-xs text-accent/70 font-medium uppercase tracking-wider mb-3">
                                Comparativo vs período anterior
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center ${data.totalParticipacoes - data.previousParticipacoes >= 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                        {data.totalParticipacoes - data.previousParticipacoes >= 0 ? "+" : ""}
                                        {data.totalParticipacoes - data.previousParticipacoes}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">participações</p>
                                        <p className="text-xs font-semibold text-white/70">vs anterior</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center ${data.ranking.filter((r) => r.participantes_unicos > 0).length - data.previousSetoresAtivos >= 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                        {data.ranking.filter((r) => r.participantes_unicos > 0).length - data.previousSetoresAtivos >= 0 ? "+" : ""}
                                        {data.ranking.filter((r) => r.participantes_unicos > 0).length - data.previousSetoresAtivos}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">setores ativos</p>
                                        <p className="text-xs font-semibold text-white/70">vs anterior</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
        </WorkspaceShell>
    );
}

