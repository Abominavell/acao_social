/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Setor, Colaborador, AcaoSocial } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

/* ── SVG Icons ── */

function CheckIcon({ className = "" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="m5 12 5 5L20 7" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2v4" /><path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function HandshakeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
            <path d="m21 3 1 11h-2" /><path d="M3 3 2 14h2" />
            <path d="m7 18 2-2a1 1 0 0 0-3-3l-2.5 2.5a1 1 0 1 0 3 3" />
        </svg>
    );
}

function SuccessIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function BarChartIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

function formatDateShort(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    });
}

function formatDateFull(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getMonthLabel(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
}

export default function InscricaoPage() {
    const [step, setStep] = useState<Step>(1);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [acoes, setAcoes] = useState<AcaoSocial[]>([]);
    const [selectedSetor, setSelectedSetor] = useState<string>("");
    const [selectedColaborador, setSelectedColaborador] = useState<string>("");
    const [selectedAcao, setSelectedAcao] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterProject, setFilterProject] = useState<string>("all");
    const [inscriptionCounts, setInscriptionCounts] = useState<Record<string, { total: number; bySector: Record<string, number> }>>({});

    // External flow state
    const [isExternoForm, setIsExternoForm] = useState(false);
    const [externoNome, setExternoNome] = useState("");
    const [externoUnidade, setExternoUnidade] = useState("");
    const [externoColabs, setExternoColabs] = useState<Colaborador[]>([]);
    const [showExternoList, setShowExternoList] = useState(false);
    const [externoLoading, setExternoLoading] = useState(false);



    async function fetchSetores() {
        const { data } = await supabase.from("setores").select("*").order("nome");
        if (data) setSetores(data);
    }

    async function fetchColaboradores(setorId: string) {
        const { data } = await supabase.from("colaboradores").select("*").eq("setor_id", setorId).order("nome");
        if (data) setColaboradores(data);
    }

    async function fetchAcoes() {
        const { data } = await supabase
            .from("acoes_sociais")
            .select("*")
            .eq("ativo", true)
            .gte("data_evento", new Date().toISOString())
            .order("data_evento");
        if (data) {
            setAcoes(data);
            // Fetch inscription counts for vacancy control (grouped by action and sector)
            const { data: counts } = await supabase
                .from("inscricoes")
                .select("acao_id, colaboradores(setor_id)");

            if (counts) {
                const countMap: Record<string, { total: number; bySector: Record<string, number> }> = {};
                counts.forEach((row) => {
                    const acaoId = row.acao_id;
                    const colab = row.colaboradores as unknown as { setor_id: string } | null;
                    const setorId = colab?.setor_id;

                    if (!countMap[acaoId]) {
                        countMap[acaoId] = { total: 0, bySector: {} };
                    }

                    countMap[acaoId].total += 1;
                    if (setorId) {
                        countMap[acaoId].bySector[setorId] = (countMap[acaoId].bySector[setorId] || 0) + 1;
                    }
                });
                setInscriptionCounts(countMap);
            }
        }
    }

    async function fetchExternoColabs() {
        const { data } = await supabase.from("colaboradores").select("*").eq("is_externo", true).order("nome");
        if (data) setExternoColabs(data);
    }

    useEffect(() => {
        fetchSetores();
        fetchAcoes();
    }, []);

    useEffect(() => {
        if (isExternoForm) fetchExternoColabs();
    }, [isExternoForm]);

    useEffect(() => {
        if (selectedSetor && selectedSetor !== "__show_selector__") {
            fetchColaboradores(selectedSetor);
            setSelectedColaborador("");
            setStep(2);
        }
    }, [selectedSetor]);

    async function handleRegisterExterno() {
        if (!externoNome || !externoUnidade) {
            setError("Preencha seu nome e instituição/unidade.");
            return;
        }
        setExternoLoading(true);
        setError(null);

        const fullName = `${externoNome.trim()} (${externoUnidade.trim()})`;

        // Re-use or create colab
        let { data: extColab } = await supabase.from("colaboradores")
            .select("id").eq("nome", fullName).eq("is_externo", true).single();

        if (!extColab) {
            const { data: freshColab } = await supabase.from("colaboradores")
                .insert({ nome: fullName, is_externo: true })
                .select().single();
            extColab = freshColab;
        }

        setExternoLoading(false);

        if (!extColab) {
            setError("Erro ao registrar. Tente novamente.");
            return;
        }

        setSelectedColaborador(extColab.id);
        setStep(3);
        await fetchExternoColabs();
    }

    function handleSelectExternoReturning(colabId: string) {
        setSelectedColaborador(colabId);
        setStep(3);
    }

    async function handleInscrever() {
        if (!selectedAcao || !selectedColaborador) return;

        setLoading(true);
        setError(null);

        const { error: insertError } = await supabase.from("inscricoes").insert({
            acao_id: selectedAcao,
            colaborador_id: selectedColaborador,
            confirmado_presenca: false,
        });

        setLoading(false);
        if (insertError) {
            if (insertError.code === "23505") {
                setError("Você já está inscrito nesta ação social!");
            } else {
                setError("Erro ao realizar inscrição. Tente novamente.");
            }
        } else {
            setSuccess(true);
            setStep(4);
        }
    }

    function resetForm() {
        setStep(1);
        setSelectedSetor("");
        setSelectedColaborador("");
        setSelectedAcao("");
        setSuccess(false);
        setError(null);
        setFilterProject("all");
        setIsExternoForm(false);
        setExternoNome("");
        setExternoUnidade("");
        setShowExternoList(false);
        setExternoLoading(false);
    }

    // Derive unique project names for filter tabs
    const projectNames = useMemo(() => {
        const names = new Set(acoes.map((a) => a.titulo));
        return Array.from(names).sort();
    }, [acoes]);

    // Filter and group actions by month
    const filteredAcoes = useMemo(() => {
        if (filterProject === "all") return acoes;
        return acoes.filter((a) => a.titulo === filterProject);
    }, [acoes, filterProject]);

    const groupedByMonth = useMemo(() => {
        const groups: { label: string; items: AcaoSocial[] }[] = [];
        let currentMonth = "";

        filteredAcoes.forEach((acao) => {
            const month = getMonthLabel(acao.data_evento);
            if (month !== currentMonth) {
                currentMonth = month;
                groups.push({ label: month, items: [] });
            }
            groups[groups.length - 1].items.push(acao);
        });

        return groups;
    }, [filteredAcoes]);

    const selectedAcaoData = acoes.find((a) => a.id === selectedAcao);
    const stepLabels = ["Setor", "Colaborador", "Ação", "Confirmação"];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="header-institutional">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Voltar para início">
                        <div className="bg-white/90 px-3 py-1.5 rounded-sm">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-8 w-auto" priority />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 pb-28">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {stepLabels.map((label, i) => {
                        const stepNum = (i + 1) as Step;
                        const isActive = step >= stepNum;
                        const isCurrent = step === stepNum;
                        return (
                            <div key={label} className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCurrent ? "bg-primary text-white scale-110 shadow-lg" : isActive ? "bg-primary-light text-white" : "bg-gray-200 text-text-secondary"}`}>
                                    {isActive && stepNum < step ? <CheckIcon /> : stepNum}
                                </div>
                                <span className={`text-xs mt-1 font-medium ${isCurrent ? "text-primary" : "text-text-secondary"}`}>
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step 1: Escolha tipo — Sede ou Externo */}
                {step >= 1 && !success && !isExternoForm && !selectedSetor && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                            1. Você é colaborador da Sede ou Externo a sede?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                                onClick={() => {
                                    setIsExternoForm(false);
                                    // Show sector selector by setting a placeholder
                                    setSelectedSetor("__show_selector__");
                                }}
                            >
                                <span className="text-2xl"></span>
                                <span className="text-sm font-semibold text-text-primary">Colaborador da Sede</span>
                                <span className="text-xs text-text-secondary">Trabalho na sede do IADVH</span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-center"
                                onClick={() => setIsExternoForm(true)}
                            >
                                <span className="text-2xl"></span>
                                <span className="text-sm font-semibold text-text-primary">Colaborador Filial</span>
                                <span className="text-xs text-text-secondary">Sou colaborador mas nao atuo na sede</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1b: Sede — Setor Selector */}
                {step >= 1 && !success && !isExternoForm && selectedSetor === "__show_selector__" && (
                    <div className="card mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-text-primary">
                                1. Selecione seu setor
                            </label>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">
                                Voltar
                            </button>
                        </div>
                        <select className="input-field" value="" onChange={(e) => setSelectedSetor(e.target.value)}>
                            <option value="">Escolha seu setor...</option>
                            {setores.map((s) => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Step 1b (selected): Show selected setor */}
                {step >= 1 && !success && !isExternoForm && selectedSetor && selectedSetor !== "__show_selector__" && (
                    <div className="card mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-text-secondary">Setor</label>
                                <span className="text-sm font-semibold text-text-primary">
                                    {setores.find(s => s.id === selectedSetor)?.nome}
                                </span>
                            </div>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">
                                Alterar
                            </button>
                        </div>
                    </div>
                )}

                {/* Externo Form */}
                {isExternoForm && !success && step < 3 && (
                    <div className="card mb-4 animate-fade-in-up border-l-4 border-l-accent">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-text-primary">
                                1. Cadastro de Colaborador Filial
                            </label>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">
                                Voltar
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Seu nome completo"
                                className="input-field"
                                value={externoNome}
                                onChange={e => setExternoNome(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Filial / Unidade"
                                className="input-field"
                                value={externoUnidade}
                                onChange={e => setExternoUnidade(e.target.value)}
                            />
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs rounded">{error}</div>
                            )}
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleRegisterExterno}
                                disabled={externoLoading || !externoNome || !externoUnidade}
                            >
                                {externoLoading ? "Registrando..." : "Continuar"}
                            </button>

                            {/* Returning volunteer drawer */}
                            {externoColabs.length > 0 && (
                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowExternoList(!showExternoList)}
                                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1 w-full justify-center"
                                    >
                                        {showExternoList ? "▲ Fechar lista" : "▼ Já me cadastrei antes"}
                                    </button>
                                    {showExternoList && (
                                        <select
                                            className="input-field mt-2"
                                            value=""
                                            onChange={e => handleSelectExternoReturning(e.target.value)}
                                        >
                                            <option value="">Selecione seu nome...</option>
                                            {externoColabs.map(c => (
                                                <option key={c.id} value={c.id}>{c.nome}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Externo: Show selected collaborator summary when step >= 3 */}
                {isExternoForm && !success && step >= 3 && selectedColaborador && (
                    <div className="card mb-4 animate-fade-in-up border-l-4 border-l-accent">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-text-secondary">Colaborador Filial</label>
                                <span className="text-sm font-semibold text-text-primary">
                                    {externoColabs.find(c => c.id === selectedColaborador)?.nome || `${externoNome} (${externoUnidade})`}
                                </span>
                            </div>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">
                                Alterar
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Colaborador (only for sede flow) */}
                {step >= 2 && !success && !isExternoForm && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            2. Identifique-se
                        </label>
                        <select className="input-field" value={selectedColaborador} onChange={(e) => { setSelectedColaborador(e.target.value); if (e.target.value) setStep(3); }}>
                            <option value="">Selecione seu nome...</option>
                            {colaboradores.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Step 3: Ação Social */}
                {step >= 3 && !success && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">
                            {isExternoForm ? "2" : "3"}. Escolha uma Ação Social
                        </h3>

                        {/* Filter Tabs */}
                        {projectNames.length > 1 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
                                    <FilterIcon />
                                    <span className="font-medium">Filtrar por projeto:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFilterProject("all")}
                                        className={`filter-tab ${filterProject === "all" ? "filter-tab-active" : ""}`}
                                    >
                                        Todos ({acoes.length})
                                    </button>
                                    {projectNames.map((name) => {
                                        const count = acoes.filter((a) => a.titulo === name).length;
                                        return (
                                            <button
                                                key={name}
                                                onClick={() => setFilterProject(name)}
                                                className={`filter-tab ${filterProject === name ? "filter-tab-active" : ""}`}
                                            >
                                                {name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {filteredAcoes.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-text-secondary">
                                    Nenhuma ação social disponível no momento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedByMonth.map((group) => (
                                    <div key={group.label}>
                                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 sticky top-16 bg-background py-1 z-10 capitalize">
                                            {group.label}
                                        </h4>
                                        <div className="space-y-2">
                                            {group.items.map((acao) => {
                                                const stats = inscriptionCounts[acao.id] || { total: 0, bySector: {} };

                                                // Calculate active limit
                                                let limit = acao.vagas_limite;
                                                let inscritos = stats.total;
                                                let isSectorLimit = false;

                                                if (!isExternoForm && selectedSetor && acao.vagas_por_setor && typeof acao.vagas_por_setor[selectedSetor] === 'number') {
                                                    limit = acao.vagas_por_setor[selectedSetor];
                                                    inscritos = stats.bySector[selectedSetor] || 0;
                                                    isSectorLimit = true;
                                                }

                                                const vagasRestantes = limit - inscritos;
                                                const esgotado = vagasRestantes <= 0;

                                                const formatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                                const timeString = formatter.format(new Date(acao.data_evento));

                                                return (
                                                    <button
                                                        key={acao.id}
                                                        onClick={() => !esgotado && setSelectedAcao(acao.id)}
                                                        disabled={esgotado}
                                                        className={`w-full text-left flex items-start gap-3 p-3 transition-all border ${esgotado
                                                            ? "bg-gray-50 border-transparent opacity-60 cursor-not-allowed"
                                                            : selectedAcao === acao.id
                                                                ? "bg-green-50 border-primary ring-1 ring-primary cursor-pointer"
                                                                : "bg-surface border-transparent hover:bg-gray-50 cursor-pointer"
                                                            }`}
                                                    >
                                                        {/* Date & Time Badge */}
                                                        <div className={`flex flex-col flex-shrink-0 w-16 text-center rounded overflow-hidden shadow-sm ${selectedAcao === acao.id ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"}`}>
                                                            <div className="py-1.5 text-xs font-bold border-b border-black/10">
                                                                {formatDateShort(acao.data_evento)}
                                                            </div>
                                                            <div className={`py-1 text-[10px] font-medium ${selectedAcao === acao.id ? "bg-primary-dark" : "bg-gray-200"}`}>
                                                                {timeString}
                                                            </div>
                                                        </div>

                                                        {/* Title + Desc + Vacancy */}
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <span className="font-semibold text-sm text-text-primary leading-tight mb-1 block">
                                                                {acao.titulo}
                                                            </span>
                                                            {acao.descricao && (
                                                                <span className={`text-xs text-text-secondary mb-2 leading-relaxed ${selectedAcao === acao.id ? "" : "line-clamp-2"}`}>
                                                                    {acao.descricao}
                                                                </span>
                                                            )}
                                                            <div className={`text-[11px] inline-flex items-center px-1.5 py-0.5 rounded ${esgotado ? "bg-red-50 text-error font-semibold" : "bg-primary/5 text-primary font-medium"}`}>
                                                                {esgotado ? "Esgotado" : `${vagasRestantes} vaga${vagasRestantes !== 1 ? "s" : ""} restante${vagasRestantes !== 1 ? "s" : ""}`}
                                                                {isSectorLimit && !esgotado && " (p/ seu setor)"}
                                                                {isSectorLimit && esgotado && " p/ seu setor"}
                                                            </div>
                                                        </div>

                                                        {/* Check or Esgotado badge */}
                                                        {esgotado ? (
                                                            <span className="badge bg-red-100 text-error text-[10px] flex-shrink-0 mt-1">Lotado</span>
                                                        ) : selectedAcao === acao.id ? (
                                                            <div className="w-6 h-6 bg-primary flex items-center justify-center flex-shrink-0 mt-1 rounded-full">
                                                                <CheckIcon className="text-white" />
                                                            </div>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Success */}
                {success && (
                    <div className="card text-center py-10 animate-scale-in">
                        <div className="w-20 h-20 bg-accent flex items-center justify-center mx-auto mb-4 text-primary">
                            <SuccessIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Inscrição Realizada!</h3>
                        <p className="text-text-secondary mb-6">
                            Sua inscrição foi registrada com sucesso. Aguarde a confirmação de presença pelo administrador no dia da ação.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button className="btn btn-primary w-full btn-lg" onClick={resetForm}>Nova Inscrição</button>
                            <Link href="/dashboard" className="btn btn-outline w-full btn-lg flex items-center justify-center gap-2">
                                <BarChartIcon /> Ver Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Confirm Bar (visible when action is selected) */}
            {selectedAcao && step === 3 && !success && (
                <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 shadow-elevated z-50 animate-fade-in-up">
                    <div className="max-w-lg mx-auto px-4 py-3">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-2 text-xs">
                                {error}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-secondary">Selecionado:</p>
                                <p className="text-sm font-bold text-text-primary truncate">
                                    {selectedAcaoData?.titulo} — {selectedAcaoData ? formatDateShort(selectedAcaoData.data_evento) : ""}
                                </p>
                            </div>
                            <button
                                className="btn btn-primary flex items-center gap-2 flex-shrink-0"
                                onClick={handleInscrever}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Inscrevendo...
                                    </span>
                                ) : (
                                    <><HandshakeIcon /> Confirmar</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
