"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { RankingSetor } from "@/lib/types";

/* ── SVG Icon Components ── */

function TrophyIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" /><path d="M16 6h.01" />
            <path d="M8 10h.01" /><path d="M16 10h.01" />
            <path d="M8 14h.01" /><path d="M16 14h.01" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2v4" /><path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
        </svg>
    );
}

function MedalIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
            <path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" />
            <path d="M8 7h8" />
            <circle cx="12" cy="17" r="5" />
            <path d="M12 18v-2h-.5" />
        </svg>
    );
}

function HeartHandshakeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            <path d="m18 15-2-2" />
            <path d="m15 18-2-2" />
        </svg>
    );
}

function TrendUpIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    );
}

function TrendDownIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
            <polyline points="16 17 22 17 22 11" />
        </svg>
    );
}

interface DashboardData {
    ranking: RankingSetor[];
    totalParticipacoes: number;
    totalExternos: number;
    totalInscricoesExternas: number;
    totalAcoes: number;
    previousParticipacoes: number;
    previousSetoresAtivos: number;
}

const medalLabels = ["1º", "2º", "3º"];
const medalColors = [
    "from-yellow-400 to-amber-500",
    "from-gray-300 to-gray-400",
    "from-amber-600 to-amber-700",
];
const medalBadgeStyles = [
    "bg-yellow-100 text-yellow-800 border border-yellow-300",
    "bg-gray-100 text-gray-700 border border-gray-300",
    "bg-amber-100 text-amber-800 border border-amber-300",
];
const podiumHeights = ["h-44", "h-36", "h-28"];
const podiumOrder = [1, 0, 2];

const statsConfig = [
    { label: "Participações Confirmadas", icon: CheckCircleIcon },
    { label: "Setores Ativos", icon: BuildingIcon },
    { label: "Ações Disponíveis", icon: CalendarIcon },
    { label: "Voluntários Externos", icon: GlobeIcon },
];

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        ranking: [],
        totalParticipacoes: 0,
        totalExternos: 0,
        totalInscricoesExternas: 0,
        totalAcoes: 0,
        previousParticipacoes: 0,
        previousSetoresAtivos: 0,
    });
    const [periodo, setPeriodo] = useState<"mes" | "ano">("mes");
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchDashboardData = useCallback(async () => {
        const now = new Date();
        let startDate: string;

        if (periodo === "mes") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else {
            startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        }

        const { data: inscricoes } = await supabase
            .from("inscricoes")
            .select(`
        id,
        confirmado_presenca,
        created_at,
        colaboradores (
          id,
          nome,
          is_externo,
          setor_id,
          setores:setor_id (id, nome)
        )
      `)
            .eq("confirmado_presenca", true)
            .gte("created_at", startDate);

        const { data: setores } = await supabase
            .from("setores")
            .select("id, nome");

        const { data: colaboradores } = await supabase
            .from("colaboradores")
            .select("id, setor_id, is_externo");

        const { data: acoes } = await supabase
            .from("acoes_sociais")
            .select("id")
            .eq("ativo", true);

        // Fetch ALL inscriptions from external volunteers (not just confirmed)
        const { data: inscricoesExternas } = await supabase
            .from("inscricoes")
            .select("id, colaboradores!inner(is_externo)")
            .eq("colaboradores.is_externo", true)
            .gte("created_at", startDate);

        if (!inscricoes || !setores || !colaboradores) {
            setLoading(false);
            return;
        }

        const setorMap = new Map<string, Set<string>>();
        const memberCount = new Map<string, number>();
        let externCount = 0;

        colaboradores.forEach((c) => {
            if (!c.is_externo) {
                memberCount.set(c.setor_id, (memberCount.get(c.setor_id) || 0) + 1);
            }
        });

        inscricoes.forEach((insc) => {
            const colab = insc.colaboradores as unknown as {
                id: string;
                is_externo: boolean;
                setor_id: string;
                setores: { id: string; nome: string };
            };
            if (!colab) return;

            if (colab.is_externo) {
                externCount++;
                return;
            }

            const setorId = colab.setor_id;
            if (!setorMap.has(setorId)) {
                setorMap.set(setorId, new Set());
            }
            setorMap.get(setorId)!.add(colab.id);
        });

        const ranking: RankingSetor[] = setores
            .map((s) => {
                const uniqueParticipants = setorMap.get(s.id)?.size || 0;
                const totalMembers = memberCount.get(s.id) || 1;
                return {
                    setor_id: s.id,
                    setor_nome: s.nome,
                    participantes_unicos: uniqueParticipants,
                    total_membros: totalMembers,
                    taxa_engajamento: Math.round((uniqueParticipants / totalMembers) * 100),
                };
            })
            .sort((a, b) => b.participantes_unicos - a.participantes_unicos || b.taxa_engajamento - a.taxa_engajamento);

        // Fetch previous period for comparison
        let prevStartDate: string;
        let prevEndDate: string;
        if (periodo === "mes") {
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else {
            prevStartDate = new Date(now.getFullYear() - 1, 0, 1).toISOString();
            prevEndDate = new Date(now.getFullYear(), 0, 1).toISOString();
        }

        const { data: prevInscricoes } = await supabase
            .from("inscricoes")
            .select("id, colaboradores(setor_id, is_externo)")
            .eq("confirmado_presenca", true)
            .gte("created_at", prevStartDate)
            .lt("created_at", prevEndDate);

        const prevSetores = new Set<string>();
        let prevCount = 0;
        if (prevInscricoes) {
            prevInscricoes.forEach((insc) => {
                const c = insc.colaboradores as unknown as { setor_id: string; is_externo: boolean };
                if (c && !c.is_externo) prevSetores.add(c.setor_id);
                prevCount++;
            });
        }

        setData({
            ranking,
            totalParticipacoes: inscricoes.length,
            totalExternos: externCount,
            totalInscricoesExternas: inscricoesExternas?.length || 0,
            totalAcoes: acoes?.length || 0,
            previousParticipacoes: prevCount,
            previousSetoresAtivos: prevSetores.size,
        });
        setLastUpdate(new Date());
        setLoading(false);
    }, [periodo]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const channel = supabase
            .channel("realtime-inscricoes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "inscricoes" },
                () => {
                    fetchDashboardData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDashboardData]);

    const top3 = data.ranking.slice(0, 3);
    const maxParticipants = Math.max(...data.ranking.map((r) => r.participantes_unicos), 1);

    const statsValues = [
        data.totalParticipacoes,
        data.ranking.filter((r) => r.participantes_unicos > 0).length,
        data.totalAcoes,
        data.totalExternos,
    ];

    return (
        <div className="min-h-screen bg-primary">
            {/* Header */}
            <header className="bg-primary-dark/50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3" aria-label="Voltar para início">
                        <div className="bg-white/90 px-3 py-1.5 rounded-sm">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-7 w-auto" priority />
                        </div>
                        <span className="text-accent text-xs font-medium">Dashboard ao Vivo</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-accent text-xs">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                            Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
                        </div>
                        <Link href="/inscricao" className="btn btn-secondary text-xs py-2 px-3">
                            Inscrever-se
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Title */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-white"><TrophyIcon /></span>
                        <h1 className="text-3xl md:text-4xl font-black text-white">
                            Ranking de Voluntariado
                        </h1>
                    </div>
                    <p className="text-accent text-sm">
                        Acompanhe o engajamento dos setores em tempo real
                    </p>
                </div>

                {/* Period Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-primary-dark/40 p-1 flex">
                        <button
                            className={`px-6 py-2 text-sm font-semibold transition-all ${periodo === "mes"
                                ? "bg-white text-primary shadow-lg"
                                : "text-white/70 hover:text-white"
                                }`}
                            onClick={() => setPeriodo("mes")}
                        >
                            Setor do Mês
                        </button>
                        <button
                            className={`px-6 py-2 text-sm font-semibold transition-all ${periodo === "ano"
                                ? "bg-white text-primary shadow-lg"
                                : "text-white/70 hover:text-white"
                                }`}
                            onClick={() => setPeriodo("ano")}
                        >
                            Setor do Ano
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-white/70">
                        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white mx-auto mb-4" />
                        Carregando dados...
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {statsConfig.map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="bg-white/10 border border-white/20 p-4 text-center animate-fade-in-up"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    <div className="flex justify-center mb-2 text-accent">
                                        <stat.icon />
                                    </div>
                                    <p className="text-2xl md:text-3xl font-black text-white">{statsValues[i]}</p>
                                    <p className="text-xs text-accent font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Period Comparison */}
                        {(data.previousParticipacoes > 0 || data.totalParticipacoes > 0) && (
                            <div className="bg-white/5 border border-white/10 p-4 mb-10 animate-fade-in-up">
                                <p className="text-xs text-accent/70 font-medium uppercase tracking-wider mb-3">
                                    Comparativo vs {periodo === "mes" ? "mês anterior" : "ano anterior"}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(() => {
                                        const delta = data.totalParticipacoes - data.previousParticipacoes;
                                        const pct = data.previousParticipacoes > 0
                                            ? Math.round((delta / data.previousParticipacoes) * 100)
                                            : data.totalParticipacoes > 0 ? 100 : 0;
                                        const isUp = delta >= 0;
                                        return (
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 flex items-center justify-center ${isUp ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                                    {isUp ? <TrendUpIcon /> : <TrendDownIcon />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">
                                                        {isUp ? "+" : ""}{delta} participações
                                                    </p>
                                                    <p className={`text-xs font-semibold ${isUp ? "text-green-300" : "text-red-300"}`}>
                                                        {isUp ? "+" : ""}{pct}% vs período anterior
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {(() => {
                                        const currentSetores = data.ranking.filter((r) => r.participantes_unicos > 0).length;
                                        const delta = currentSetores - data.previousSetoresAtivos;
                                        const isUp = delta >= 0;
                                        return (
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 flex items-center justify-center ${isUp ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                                    {isUp ? <TrendUpIcon /> : <TrendDownIcon />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">
                                                        {isUp ? "+" : ""}{delta} setores ativos
                                                    </p>
                                                    <p className={`text-xs font-semibold ${isUp ? "text-green-300" : "text-red-300"}`}>
                                                        {data.previousSetoresAtivos > 0
                                                            ? `${isUp ? "+" : ""}${Math.round((delta / data.previousSetoresAtivos) * 100)}%`
                                                            : currentSetores > 0 ? "Novo" : "—"
                                                        } vs período anterior
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        {/* Podium */}
                        {top3.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-center text-white font-bold text-lg mb-6 flex items-center justify-center gap-2">
                                    <MedalIcon />
                                    {periodo === "mes" ? "Pódio do Mês" : "Pódio do Ano"}
                                </h2>
                                <div className="flex items-end justify-center gap-3 md:gap-6 max-w-2xl mx-auto">
                                    {podiumOrder.map((idx) => {
                                        const item = top3[idx];
                                        if (!item) return <div key={idx} className="flex-1" />;
                                        return (
                                            <div
                                                key={item.setor_id}
                                                className="flex-1 flex flex-col items-center animate-scale-in"
                                                style={{ animationDelay: `${idx * 0.15}s` }}
                                            >
                                                {/* Medal Badge */}
                                                <span className={`text-sm font-black px-3 py-1 mb-2 ${medalBadgeStyles[idx]}`}>
                                                    {medalLabels[idx]}
                                                </span>
                                                {/* Sector name */}
                                                <p className="text-white font-bold text-xs md:text-sm text-center mb-2 line-clamp-2 min-h-[2.5rem]">
                                                    {item.setor_nome}
                                                </p>
                                                {/* Podium bar */}
                                                <div
                                                    className={`w-full ${podiumHeights[idx]} bg-gradient-to-t ${medalColors[idx]} flex flex-col items-center justify-center p-2 shadow-lg`}
                                                >
                                                    <p className="text-2xl md:text-3xl font-black text-white">
                                                        {item.participantes_unicos}
                                                    </p>
                                                    <p className="text-[10px] text-white/80 font-medium">
                                                        participações
                                                    </p>
                                                    <p className="text-[10px] text-white/60 mt-1">
                                                        {item.taxa_engajamento}% engajamento
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Full Ranking List */}
                        <div className="bg-white/10 border border-white/20 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/10">
                                <h2 className="text-white font-bold">Ranking Completo por Setor</h2>
                            </div>
                            <div className="divide-y divide-white/10">
                                {data.ranking.map((item, i) => (
                                    <div
                                        key={item.setor_id}
                                        className="px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors animate-slide-in-right"
                                        style={{ animationDelay: `${i * 0.05}s` }}
                                    >
                                        {/* Position */}
                                        <div className="w-8 text-center">
                                            {i < 3 ? (
                                                <span className={`text-xs font-black px-2 py-0.5 ${medalBadgeStyles[i]}`}>
                                                    {medalLabels[i]}
                                                </span>
                                            ) : (
                                                <span className="text-white/50 font-bold text-sm">
                                                    {i + 1}º
                                                </span>
                                            )}
                                        </div>

                                        {/* Name + badge */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-sm truncate">
                                                {item.setor_nome}
                                            </p>
                                            <p className="text-accent text-xs">
                                                {item.participantes_unicos} de {item.total_membros} membros
                                            </p>
                                        </div>

                                        {/* Engagement bar */}
                                        <div className="hidden md:block flex-1 max-w-xs">
                                            <div className="w-full bg-white/10 h-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-accent to-primary-light transition-all duration-700"
                                                    style={{
                                                        width: `${(item.participantes_unicos / maxParticipants) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Engagement % */}
                                        <div className="text-right">
                                            <p className="text-white font-bold text-lg">
                                                {item.taxa_engajamento}%
                                            </p>
                                            <p className="text-accent text-[10px] font-medium">
                                                engajamento
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Community Engagement Card */}
                        <div className="mt-8 bg-white/10 border border-white/20 overflow-hidden animate-fade-in-up">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                                <span className="text-accent"><HeartHandshakeIcon /></span>
                                <h2 className="text-white font-bold">Engajamento Comunitário</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Total External Inscriptions */}
                                    <div className="text-center">
                                        <p className="text-3xl md:text-4xl font-black text-white">
                                            {data.totalInscricoesExternas}
                                        </p>
                                        <p className="text-accent text-sm font-medium mt-1">
                                            Inscrições Externas
                                        </p>
                                        <p className="text-white/50 text-xs mt-0.5">
                                            Total de inscrições de voluntários da comunidade
                                        </p>
                                    </div>

                                    {/* Confirmed External */}
                                    <div className="text-center">
                                        <p className="text-3xl md:text-4xl font-black text-white">
                                            {data.totalExternos}
                                        </p>
                                        <p className="text-accent text-sm font-medium mt-1">
                                            Presenças Confirmadas
                                        </p>
                                        <p className="text-white/50 text-xs mt-0.5">
                                            Voluntários externos com presença confirmada
                                        </p>
                                    </div>

                                    {/* Community Reach % */}
                                    <div className="text-center">
                                        <p className="text-3xl md:text-4xl font-black text-white">
                                            {data.totalParticipacoes > 0
                                                ? Math.round((data.totalInscricoesExternas / (data.totalParticipacoes + data.totalInscricoesExternas - data.totalExternos)) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-accent text-sm font-medium mt-1">
                                            Alcance Comunitário
                                        </p>
                                        <p className="text-white/50 text-xs mt-0.5">
                                            Proporção de participação externa nas ações
                                        </p>
                                    </div>
                                </div>

                                {data.totalInscricoesExternas > 0 && (
                                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-accent/80 text-sm">
                                        <GlobeIcon />
                                        <span>
                                            {data.totalInscricoesExternas} pessoa{data.totalInscricoesExternas > 1 ? "s" : ""} de fora se inscreveram nas ações sociais
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center gap-2">
                    <div className="bg-white/90 px-3 py-1 rounded-sm">
                        <Image src="/logo.svg" alt="Logo IADVh" width={100} height={36} className="h-5 w-auto" />
                    </div>
                    <p className="text-accent/70 text-xs text-center">
                        IADVh — Instituto de Apoio ao Desenvolvimento da Vida Humana
                    </p>
                    <p className="text-accent/50 text-[10px] text-center">
                        Sistema de Monitoramento de Voluntariado — Gerenciado pela Equipe de Responsabilidade Social
                    </p>
                </div>
            </footer>
        </div>
    );
}
