"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { RankingSetor } from "@/lib/types";

interface DashboardData {
    ranking: RankingSetor[];
    totalParticipacoes: number;
    totalExternos: number;
    totalAcoes: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        ranking: [],
        totalParticipacoes: 0,
        totalExternos: 0,
        totalAcoes: 0,
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

        // Fetch all confirmed inscriptions with collaborator and sector info
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

        // Fetch all sectors with member counts
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

        if (!inscricoes || !setores || !colaboradores) {
            setLoading(false);
            return;
        }

        // Build ranking: count unique collaborator IDs per sector
        const setorMap = new Map<string, Set<string>>();
        const memberCount = new Map<string, number>();
        let externCount = 0;

        // Count total members per sector (internal only)
        colaboradores.forEach((c) => {
            if (!c.is_externo) {
                memberCount.set(c.setor_id, (memberCount.get(c.setor_id) || 0) + 1);
            }
        });

        // Count unique participants per sector
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

        // Build ranking array
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

        setData({
            ranking,
            totalParticipacoes: inscricoes.length,
            totalExternos: externCount,
            totalAcoes: acoes?.length || 0,
        });
        setLastUpdate(new Date());
        setLoading(false);
    }, [periodo]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Supabase Realtime
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
    const rest = data.ranking.slice(3);
    const maxParticipants = Math.max(...data.ranking.map((r) => r.participantes_unicos), 1);

    const medalEmojis = ["🥇", "🥈", "🥉"];
    const medalColors = [
        "from-yellow-400 to-amber-500",
        "from-gray-300 to-gray-400",
        "from-amber-600 to-amber-700",
    ];
    const medalBgColors = ["bg-yellow-50 border-yellow-300", "bg-gray-50 border-gray-300", "bg-amber-50 border-amber-300"];
    const podiumHeights = ["h-44", "h-36", "h-28"];
    const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze display order

    return (
        <div className="min-h-screen bg-primary">
            {/* Header */}
            <header className="bg-primary-dark/30 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-primary font-black text-xs">IA</span>
                        </div>
                        <div>
                            <span className="font-bold text-white">IADVH</span>
                            <span className="text-accent text-xs ml-2">Dashboard ao Vivo</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-accent text-xs">
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
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                        🏆 Ranking de Voluntariado
                    </h1>
                    <p className="text-accent text-sm">
                        Acompanhe o engajamento dos setores em tempo real
                    </p>
                </div>

                {/* Period Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-primary-dark/40 backdrop-blur-sm rounded-full p-1 flex">
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${periodo === "mes"
                                    ? "bg-white text-primary shadow-lg"
                                    : "text-white/70 hover:text-white"
                                }`}
                            onClick={() => setPeriodo("mes")}
                        >
                            Setor do Mês
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${periodo === "ano"
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
                        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4" />
                        Carregando dados...
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { label: "Participações Confirmadas", value: data.totalParticipacoes, icon: "✅" },
                                { label: "Setores Ativos", value: data.ranking.filter((r) => r.participantes_unicos > 0).length, icon: "🏢" },
                                { label: "Ações Disponíveis", value: data.totalAcoes, icon: "📅" },
                                { label: "Voluntários Externos", value: data.totalExternos, icon: "🌍" },
                            ].map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[var(--radius-md)] p-4 text-center animate-fade-in-up"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    <p className="text-2xl mb-1">{stat.icon}</p>
                                    <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                                    <p className="text-xs text-accent font-medium">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Podium */}
                        {top3.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-center text-white font-bold text-lg mb-6">
                                    {periodo === "mes" ? "🏅 Pódio do Mês" : "🏅 Pódio do Ano"}
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
                                                {/* Medal */}
                                                <span className="text-3xl md:text-4xl mb-2">{medalEmojis[idx]}</span>
                                                {/* Sector name */}
                                                <p className="text-white font-bold text-xs md:text-sm text-center mb-2 line-clamp-2 min-h-[2.5rem]">
                                                    {item.setor_nome}
                                                </p>
                                                {/* Podium bar */}
                                                <div
                                                    className={`w-full ${podiumHeights[idx]} bg-gradient-to-t ${medalColors[idx]} rounded-t-[var(--radius-md)] flex flex-col items-center justify-center p-2 shadow-lg`}
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
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[var(--radius-md)] overflow-hidden">
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
                                                <span className="text-xl">{medalEmojis[i]}</span>
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
                                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-accent to-primary-light rounded-full transition-all duration-700"
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

                        {/* External Volunteers Highlight */}
                        {data.totalExternos > 0 && (
                            <div className="mt-8 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-[var(--radius-md)] p-6 text-center animate-fade-in-up">
                                <span className="text-4xl block mb-2">🌍</span>
                                <p className="text-white font-bold text-xl">
                                    {data.totalExternos} Voluntário{data.totalExternos > 1 ? "s" : ""} Externo{data.totalExternos > 1 ? "s" : ""}
                                </p>
                                <p className="text-accent text-sm">
                                    Pessoas de fora do instituto que participaram de nossas ações
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-accent/70 text-xs">
                        IADVH • Instituto de Apoio ao Desenvolvimento da Vida Humana • Dashboard de Voluntariado
                    </p>
                </div>
            </footer>
        </div>
    );
}
