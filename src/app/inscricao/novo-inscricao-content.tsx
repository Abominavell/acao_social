"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Colaborador, DataProjeto, Inscricao, Setor } from "@/lib/types";
import { ApiError, apiJson, formatApiError } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;
const SEDE_AUTH_STORAGE_KEY = "monitoramento_sede_auth";

function CheckIcon({ className = "" }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <path d="m5 12 5 5L20 7" />
        </svg>
    );
}

function HandshakeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m11 17 2 2a1 1 0 1 0 3-3" />
            <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
            <path d="m21 3 1 11h-2" />
            <path d="M3 3 2 14h2" />
            <path d="m7 18 2-2a1 1 0 0 0-3-3l-2.5 2.5a1 1 0 1 0 3 3" />
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

function SuccessIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
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

function formatDateTimeShort(dateStr: string) {
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${formatDateShort(dateStr)} • ${time}`;
}

export default function NovoInscricaoContent() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [datasProjetos, setDatasProjetos] = useState<DataProjeto[]>([]);

    const [selectedSetor, setSelectedSetor] = useState<string>("");
    const [selectedColaborador, setSelectedColaborador] = useState<string>("");
    const [selectedDataProjetoId, setSelectedDataProjetoId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Tipo (Sede/Externo)
    const [isExternoForm, setIsExternoForm] = useState(false);
    const [sedeAuthNome, setSedeAuthNome] = useState<string>("");
    const [sedeAuthenticated, setSedeAuthenticated] = useState(false);

    // Externo form
    const [externoNome, setExternoNome] = useState("");
    const [externoUnidade, setExternoUnidade] = useState("");
    const [externoColabs, setExternoColabs] = useState<Colaborador[]>([]);
    const [showExternoList, setShowExternoList] = useState(false);
    const [externoLoading, setExternoLoading] = useState(false);

    // Step 3 filters
    const [filterProjectTitle, setFilterProjectTitle] = useState<string>("all");
    const [existingDataByProjetoId, setExistingDataByProjetoId] = useState<Record<string, string>>({});

    // Capacity stats
    const [statsByDataTotal, setStatsByDataTotal] = useState<Record<string, number>>({});
    const [statsByDataSetor, setStatsByDataSetor] = useState<Record<string, Record<string, number>>>({});

    const nowIso = useMemo(() => new Date().toISOString(), []);

    async function fetchSetores() {
        try {
            const data = await apiJson<Setor[]>("setores/?ordering=nome", { auth: false });
            setSetores(data);
        } catch {
            setSetores([]);
        }
    }

    async function fetchColaboradores(setorId: string) {
        try {
            const data = await apiJson<Colaborador[]>(
                `colaboradores/?setor_id=${encodeURIComponent(setorId)}&ordering=nome`,
                { auth: false },
            );
            setColaboradores(data);
        } catch {
            setColaboradores([]);
        }
    }

    async function fetchExternoColabs() {
        try {
            const data = await apiJson<Colaborador[]>("colaboradores/?is_externo=true&ordering=nome", { auth: false });
            setExternoColabs(data);
        } catch {
            setExternoColabs([]);
        }
    }

    async function fetchStep3Data() {
        if (!selectedColaborador) return;

        setLoading(true);
        setError(null);

        try {
            const now = new Date().toISOString();

            const [datasData, statsInscData, existingInsc] = await Promise.all([
                apiJson<DataProjeto[]>(
                    `datas_projeto/?ativo=true&data_evento__gte=${encodeURIComponent(now)}&ordering=data_evento`,
                    { auth: false },
                ),
                apiJson<Inscricao[]>(
                    `inscricoes/?data_evento__gte=${encodeURIComponent(now)}&ordering=-created_at`,
                    { auth: false },
                ),
                apiJson<Inscricao[]>(`inscricoes/?colaborador_id=${encodeURIComponent(selectedColaborador)}&ordering=-created_at`, { auth: false }),
            ]);

            const datasAtivas = datasData.filter((d) => d.ativo && d.projetos?.ativo);
            setDatasProjetos(datasAtivas);

            // capacity stats from future datas
            const total: Record<string, number> = {};
            const bySector: Record<string, Record<string, number>> = {};

            statsInscData.forEach((insc) => {
                const dataId = insc.data_projeto_id;
                total[dataId] = (total[dataId] || 0) + 1;

                const colab = insc.colaboradores as Colaborador | undefined;
                if (!colab || colab.is_externo || !colab.setor_id) return;
                if (!bySector[dataId]) bySector[dataId] = {};
                bySector[dataId][colab.setor_id] = (bySector[dataId][colab.setor_id] || 0) + 1;
            });

            setStatsByDataTotal(total);
            setStatsByDataSetor(bySector);

            // duplication map: 1 inscrição por PROJETO
            const map: Record<string, string> = {};
            existingInsc.forEach((insc) => {
                const projetoId = insc.projeto_id;
                const dataId = insc.data_projeto_id;
                if (projetoId && dataId) map[projetoId] = dataId;
            });
            setExistingDataByProjetoId(map);

            setSelectedDataProjetoId("");
        } catch (e) {
            console.error(e);
            setError("Erro ao carregar datas do projeto.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegisterExterno() {
        if (!externoNome || !externoUnidade) {
            setError("Preencha seu nome e instituição/unidade.");
            return;
        }

        setExternoLoading(true);
        setError(null);

        const fullName = `${externoNome.trim()} (${externoUnidade.trim()})`;

        let extColab: { id: string } | null = null;
        try {
            const found = await apiJson<Colaborador[]>(
                `colaboradores/?nome=${encodeURIComponent(fullName)}&is_externo=true`,
                { auth: false },
            );
            extColab = found[0] ? { id: found[0].id } : null;
        } catch {
            extColab = null;
        }

        if (!extColab) {
            try {
                const created = await apiJson<Colaborador>("colaboradores/", {
                    method: "POST",
                    body: JSON.stringify({ nome: fullName, is_externo: true }),
                    auth: false,
                });
                extColab = { id: created.id };
            } catch {
                setExternoLoading(false);
                setError("Erro ao registrar. Tente novamente.");
                return;
            }
        }

        setExternoLoading(false);
        setSelectedColaborador(extColab.id);
        setStep(3);
    }

    function handleSelectExternoReturning(colabId: string) {
        setSelectedColaborador(colabId);
        setStep(3);
    }

    async function handleInscrever() {
        if (!selectedColaborador || !selectedDataProjetoId) return;

        setLoading(true);
        setError(null);

        try {
            const selectedData = datasProjetos.find((d) => d.id === selectedDataProjetoId);
            if (!selectedData?.projetos?.id) throw new Error("Data/projeto inválido.");

            const existingDataId = existingDataByProjetoId[selectedData.projetos.id];
            if (existingDataId && existingDataId === selectedData.id) {
                setError("Você já está inscrito neste projeto.");
                return;
            }

            await apiJson<Inscricao>("inscricoes/", {
                method: "POST",
                body: JSON.stringify({
                    projeto_id: selectedData.projetos.id,
                    data_projeto_id: selectedData.id,
                    colaborador_id: selectedColaborador,
                    confirmado_presenca: false,
                }),
                auth: false,
            });

            setSuccess(true);
            setStep(4);
        } catch (e) {
            if (e instanceof ApiError && e.status === 400) {
                const msg = JSON.stringify(e.body);
                if (msg.toLowerCase().includes("duplicada") || msg.toLowerCase().includes("inscri")) {
                    setError("Você já está inscrito neste projeto.");
                } else {
                    setError(formatApiError(e));
                }
            } else {
                setError("Erro ao realizar inscrição. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setStep(1);
        setSelectedSetor("");
        setSelectedColaborador("");
        setSelectedDataProjetoId("");
        setSuccess(false);
        setError(null);
        setIsExternoForm(false);
        setExternoNome("");
        setExternoUnidade("");
        setShowExternoList(false);
        setExternoLoading(false);
        setFilterProjectTitle("all");
        setExistingDataByProjetoId({});
        setStatsByDataTotal({});
        setStatsByDataSetor({});
        setDatasProjetos([]);
        setColaboradores([]);
        setSedeAuthNome("");
        setSedeAuthenticated(false);
        if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(SEDE_AUTH_STORAGE_KEY);
        }
    }

    // initial load
    useEffect(() => {
        fetchSetores();
        if (typeof window !== "undefined") {
            const raw = window.sessionStorage.getItem(SEDE_AUTH_STORAGE_KEY);
            if (raw) {
                try {
                    const authData = JSON.parse(raw) as { colaborador_id: string; setor_id: string; nome: string };
                    if (authData?.colaborador_id && authData?.setor_id) {
                        setSelectedColaborador(authData.colaborador_id);
                        setSelectedSetor(authData.setor_id);
                        setSedeAuthNome(authData.nome || "");
                        setSedeAuthenticated(true);
                        setIsExternoForm(false);
                        setStep(3);
                    }
                } catch {
                    window.sessionStorage.removeItem(SEDE_AUTH_STORAGE_KEY);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (isExternoForm) fetchExternoColabs();
    }, [isExternoForm]);

    useEffect(() => {
        if (selectedSetor && selectedSetor !== "__show_selector__") {
            if (sedeAuthenticated) return;
            fetchColaboradores(selectedSetor);
            setSelectedColaborador("");
            setStep(2);
        }
    }, [selectedSetor, sedeAuthenticated]);

    // Step 3 load
    useEffect(() => {
        if (step >= 3 && !success && selectedColaborador) {
            fetchStep3Data();
        }
    }, [step, selectedColaborador, success]);

    const projectNames = useMemo(() => {
        const names = new Set(datasProjetos.map((d) => d.projetos?.titulo).filter(Boolean) as string[]);
        return Array.from(names).sort();
    }, [datasProjetos]);

    const filteredDatas = useMemo(() => {
        if (filterProjectTitle === "all") return datasProjetos;
        return datasProjetos.filter((d) => d.projetos?.titulo === filterProjectTitle);
    }, [datasProjetos, filterProjectTitle]);

    const groupedByMonth = useMemo(() => {
        const groups: { label: string; items: DataProjeto[] }[] = [];
        let currentMonth = "";

        filteredDatas.forEach((data) => {
            const month = new Date(data.data_evento).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
            if (month !== currentMonth) {
                currentMonth = month;
                groups.push({ label: month, items: [] });
            }
            groups[groups.length - 1].items.push(data);
        });

        return groups;
    }, [filteredDatas]);

    const selectedData = datasProjetos.find((d) => d.id === selectedDataProjetoId);
    const selectedProjetoTitulo = selectedData?.projetos?.titulo || "";
    const selectedIsAlreadyInscrito =
        !!selectedData?.projetos?.id && existingDataByProjetoId[selectedData.projetos.id] === selectedData.id;

    const stepLabels = ["Setor", "Colaborador", "Projeto", "Confirmação"];

    return (
        <div className="min-h-screen bg-background">
            <header className="header-institutional">
                <div className="w-[92vw] max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2" aria-label="Voltar para início">
                        <div className="bg-white/90 px-3 py-1.5 rounded-sm">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-8 w-auto" priority />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="w-[92vw] max-w-[1400px] mx-auto px-4 py-6 pb-28">
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
                                <span className={`text-xs mt-1 font-medium ${isCurrent ? "text-primary" : "text-text-secondary"}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Step 1 */}
                {step >= 1 && !success && !isExternoForm && !selectedSetor && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-3">1. Você é colaborador da Sede ou Externo a sede?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                                onClick={() => {
                                    router.push("/inscricao/login");
                                }}
                            >
                                <span className="text-sm font-semibold text-text-primary">Colaborador da Sede</span>
                                <span className="text-xs text-text-secondary">Entrar com CPF e data de nascimento</span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-center"
                                onClick={() => setIsExternoForm(true)}
                            >
                                <span className="text-sm font-semibold text-text-primary">Colaborador Filial</span>
                                <span className="text-xs text-text-secondary">Sou colaborador mas nao atuo na sede</span>
                            </button>
                        </div>
                    </div>
                )}

                {!isExternoForm && step >= 3 && sedeAuthNome && (
                    <div className="card mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-text-secondary">Colaborador da sede autenticado</label>
                                <span className="text-sm font-semibold text-text-primary">{sedeAuthNome}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        window.sessionStorage.removeItem(SEDE_AUTH_STORAGE_KEY);
                                    }
                                    setSedeAuthenticated(false);
                                    router.push("/inscricao/login");
                                }}
                                className="text-xs text-text-secondary hover:text-primary underline"
                            >
                                Trocar login
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1b: Sede */}
                {step >= 1 && !success && !isExternoForm && selectedSetor === "__show_selector__" && (
                    <div className="card mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-text-primary">1. Selecione seu setor</label>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">Voltar</button>
                        </div>
                        <select className="input-field" value="" onChange={(e) => setSelectedSetor(e.target.value)}>
                            <option value="">Escolha seu setor...</option>
                            {setores.map((s) => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                {step >= 1 && !success && !isExternoForm && selectedSetor && selectedSetor !== "__show_selector__" && (
                    <div className="card mb-4 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-text-secondary">Setor</label>
                                <span className="text-sm font-semibold text-text-primary">{setores.find((s) => s.id === selectedSetor)?.nome}</span>
                            </div>
                            {!sedeAuthenticated && (
                                <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">Alterar</button>
                            )}
                        </div>
                    </div>
                )}

                {/* Externo Form */}
                {isExternoForm && !success && step < 3 && (
                    <div className="card mb-4 animate-fade-in-up border-l-4 border-l-accent">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-text-primary">1. Cadastro de Colaborador Filial</label>
                            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-primary underline">Voltar</button>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Seu nome completo"
                                className="input-field"
                                value={externoNome}
                                onChange={(e) => setExternoNome(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Filial / Unidade"
                                className="input-field"
                                value={externoUnidade}
                                onChange={(e) => setExternoUnidade(e.target.value)}
                            />
                            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs rounded">{error}</div>}
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleRegisterExterno}
                                disabled={externoLoading || !externoNome || !externoUnidade}
                            >
                                {externoLoading ? "Registrando..." : "Continuar"}
                            </button>

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
                                        <select className="input-field mt-2" value="" onChange={(e) => handleSelectExternoReturning(e.target.value)}>
                                            <option value="">Selecione seu nome...</option>
                                            {externoColabs.map((c) => (
                                                <option key={c.id} value={c.id}>{c.nome}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Colaborador (Sede) */}
                {step >= 2 && !success && !isExternoForm && !sedeAuthNome && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-2">2. Identifique-se</label>
                        <select
                            className="input-field"
                            value={selectedColaborador}
                            onChange={(e) => {
                                setSelectedColaborador(e.target.value);
                                if (e.target.value) setStep(3);
                            }}
                        >
                            <option value="">Selecione seu nome...</option>
                            {colaboradores.map((c) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Step 3: Projeto + Data */}
                {step >= 3 && !success && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">3. Escolha um Projeto e uma Data</h3>

                        {projectNames.length > 1 && (
                            <div className="mb-4">
                                <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
                                    <span className="font-medium">Filtrar por projeto:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setFilterProjectTitle("all")} className={`filter-tab ${filterProjectTitle === "all" ? "filter-tab-active" : ""}`}>
                                        Todos ({datasProjetos.length})
                                    </button>
                                    {projectNames.map((name) => {
                                        const count = datasProjetos.filter((d) => d.projetos?.titulo === name).length;
                                        return (
                                            <button key={name} onClick={() => setFilterProjectTitle(name)} className={`filter-tab ${filterProjectTitle === name ? "filter-tab-active" : ""}`}>
                                                {name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {loading && datasProjetos.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-text-secondary">Carregando datas...</p>
                            </div>
                        ) : filteredDatas.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-text-secondary">Nenhuma data disponível no momento.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {groupedByMonth.map((group) => (
                                    <div key={group.label}>
                                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 sticky top-16 bg-background py-1 z-10">
                                            {group.label}
                                        </h4>
                                        <div className="space-y-2">
                                            {group.items.map((data) => {
                                                const projectId = data.projetos?.id || "";
                                                const existingDataId = existingDataByProjetoId[projectId];

                                                const isSelectedExisting = existingDataId && existingDataId === data.id;

                                                // Capacity
                                                let limit = data.vagas_limite;
                                                let inscritos = statsByDataTotal[data.id] || 0;

                                                if (!isExternoForm && selectedSetor && data.vagas_por_setor && typeof data.vagas_por_setor[selectedSetor] === "number") {
                                                    limit = data.vagas_por_setor[selectedSetor];
                                                    inscritos = statsByDataSetor[data.id]?.[selectedSetor] || 0;
                                                }

                                                const vagasRestantes = limit - inscritos;
                                                const esgotado = vagasRestantes <= 0;

                                                const disabledByDuplicate = !!existingDataId && existingDataId !== data.id;
                                                const disabled = disabledByDuplicate || (esgotado && !isSelectedExisting);

                                                const badgeText = disabledByDuplicate
                                                    ? "Já inscrito neste projeto"
                                                    : isSelectedExisting
                                                        ? "Sua inscrição"
                                                        : esgotado
                                                            ? "Esgotado"
                                                            : `${vagasRestantes} vaga${vagasRestantes !== 1 ? "s" : ""} restante`;

                                                return (
                                                    <button
                                                        key={data.id}
                                                        disabled={disabled}
                                                        onClick={() => !disabled && setSelectedDataProjetoId(data.id)}
                                                        className={`w-full text-left flex items-start gap-3 p-3 transition-all border ${
                                                            selectedDataProjetoId === data.id
                                                                ? "bg-green-50 border-primary ring-1 ring-primary cursor-pointer"
                                                                : disabled
                                                                    ? "bg-gray-50 border-transparent opacity-60 cursor-not-allowed"
                                                                    : "bg-surface border-transparent hover:bg-gray-50 cursor-pointer"
                                                        }`}
                                                    >
                                                        <div className={`flex flex-col flex-shrink-0 w-16 text-center rounded overflow-hidden shadow-sm ${selectedDataProjetoId === data.id ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"}`}>
                                                            <div className="py-1.5 text-xs font-bold border-b border-black/10">
                                                                {formatDateShort(data.data_evento)}
                                                            </div>
                                                            <div className={`py-1 text-[10px] font-medium ${selectedDataProjetoId === data.id ? "bg-primary-dark" : "bg-gray-200"}`}>
                                                                {new Date(data.data_evento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <span className="font-semibold text-sm text-text-primary leading-tight mb-1 block">
                                                                {data.projetos?.titulo || "Projeto"}
                                                            </span>

                                                            <div className={`text-[11px] inline-flex items-center px-1.5 py-0.5 rounded ${
                                                                disabledByDuplicate || isSelectedExisting
                                                                    ? "bg-amber-50 text-amber-700 font-semibold"
                                                                    : esgotado
                                                                        ? "bg-red-50 text-error font-semibold"
                                                                        : "bg-primary/5 text-primary font-medium"
                                                            }`}
                                                            >
                                                                {badgeText}
                                                            </div>
                                                        </div>
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

                {/* Step 4 success */}
                {success && (
                    <div className="card text-center py-10 animate-scale-in">
                        <div className="w-20 h-20 bg-accent flex items-center justify-center mx-auto mb-4 text-primary">
                            <SuccessIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-2">Inscrição Realizada!</h3>
                        <p className="text-text-secondary mb-6">Sua inscrição foi registrada. Aguarde a confirmação de presença pelo administrador.</p>
                        <div className="flex flex-col gap-3">
                            <button className="btn btn-primary w-full btn-lg" onClick={resetForm}>Nova Inscrição</button>
                            <Link href="/dashboard" className="btn btn-outline w-full btn-lg flex items-center justify-center gap-2">
                                <BarChartIcon /> Ver Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Confirm Bar */}
            {selectedDataProjetoId && step === 3 && !success && (
                <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 shadow-elevated z-50 animate-fade-in-up">
                    <div className="w-[92vw] max-w-[1400px] mx-auto px-4 py-3">
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-2 text-xs">{error}</div>}

                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-text-secondary">Selecionado:</p>
                                <p className="text-sm font-bold text-text-primary truncate">
                                    {selectedProjetoTitulo} — {selectedData ? formatDateTimeShort(selectedData.data_evento) : ""}
                                </p>
                            </div>
                            <button
                                className="btn btn-primary flex items-center gap-2 flex-shrink-0"
                                onClick={handleInscrever}
                                disabled={loading || selectedIsAlreadyInscrito}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Inscrevendo...
                                    </span>
                                ) : selectedIsAlreadyInscrito ? (
                                    <>
                                        <HandshakeIcon /> Já inscrito
                                    </>
                                ) : (
                                    <>
                                        <HandshakeIcon /> Confirmar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

