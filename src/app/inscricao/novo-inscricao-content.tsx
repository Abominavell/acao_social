"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Colaborador, DataProjeto, Inscricao, Setor } from "@/lib/types";
import { ApiError, apiJson, formatApiError } from "@/lib/api";
import { StepIndicator } from "@/app/inscricao/components/step-indicator";
import { InscricaoStickyConfirmBar } from "@/app/inscricao/components/inscricao-sticky-confirm-bar";
import { ProjectDateSelector } from "@/app/inscricao/components/project-date-selector";
import { InscricaoSuccessCard } from "@/app/inscricao/components/inscricao-success-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Step = 1 | 2 | 3 | 4;
const SEDE_AUTH_STORAGE_KEY = "monitoramento_sede_auth";
type SedeLoginResponse = {
    ok: boolean;
    colaborador_id: string;
    nome: string;
    setor_id: string;
};

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

function formatCpfDigits(cpfDigits: string) {
    const d = cpfDigits.replace(/\D/g, "").slice(0, 11);
    if (d.length !== 11) return d;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function NovoInscricaoContent() {
    const [step, setStep] = useState<Step>(1);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [datasProjetos, setDatasProjetos] = useState<DataProjeto[]>([]);

    const [selectedSetor, setSelectedSetor] = useState<string>("");
    const [selectedColaborador, setSelectedColaborador] = useState<string>("");
    const [selectedDataProjetoId, setSelectedDataProjetoId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sedeAuthNome, setSedeAuthNome] = useState<string>("");
    const [sedeAuthenticated, setSedeAuthenticated] = useState(false);
    const [loginCpf, setLoginCpf] = useState("");
    const [loginSenha, setLoginSenha] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

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

    async function handleInlineLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!loginCpf.trim() || !loginSenha.trim()) return;
        setLoginLoading(true);
        setError(null);
        try {
            const cpfDigits = loginCpf.replace(/\D/g, "");
            let data: SedeLoginResponse;
            try {
                data = await apiJson<SedeLoginResponse>("auth/colaborador-login/", {
                    method: "POST",
                    auth: false,
                    body: JSON.stringify({
                        cpf: cpfDigits,
                        senha: loginSenha.trim(),
                    }),
                });
            } catch {
                data = await apiJson<SedeLoginResponse>("auth/colaborador-login/", {
                    method: "POST",
                    auth: false,
                    body: JSON.stringify({
                        cpf: formatCpfDigits(cpfDigits),
                        senha: loginSenha.trim(),
                    }),
                });
            }
            if (typeof window !== "undefined") {
                window.sessionStorage.setItem(
                    SEDE_AUTH_STORAGE_KEY,
                    JSON.stringify({
                        colaborador_id: data.colaborador_id,
                        nome: data.nome,
                        setor_id: data.setor_id,
                    }),
                );
            }
            setSelectedColaborador(data.colaborador_id);
            setSelectedSetor(data.setor_id);
            setSedeAuthNome(data.nome || "");
            setSedeAuthenticated(true);
            setStep(3);
        } catch (e) {
            setError(formatApiError(e));
        } finally {
            setLoginLoading(false);
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
        setFilterProjectTitle("all");
        setExistingDataByProjetoId({});
        setStatsByDataTotal({});
        setStatsByDataSetor({});
        setDatasProjetos([]);
        setSedeAuthNome("");
        setSedeAuthenticated(false);
        setLoginCpf("");
        setLoginSenha("");
        setLoginLoading(false);
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
                        setStep(3);
                    }
                } catch {
                    window.sessionStorage.removeItem(SEDE_AUTH_STORAGE_KEY);
                }
            }
        }
    }, []);

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

    const stepLabels = ["Login", "Projeto", "Confirmação"];
    const progressStep = success ? 3 : sedeAuthenticated ? 2 : 1;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
                <div className="mx-auto flex w-[92vw] max-w-[1400px] items-center justify-between gap-3 px-4 py-4">
                    <Link href="/" className="flex items-center gap-2" aria-label="Voltar para início">
                        <div className="rounded-lg bg-white/95 px-3 py-1.5 shadow-sm ring-1 ring-black/5">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-8 w-auto" priority />
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard"
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        >
                            Ver dashboard
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-[92vw] max-w-[1400px] px-4 py-6 pb-28">
                {!success ? (
                    <section className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-emerald-100/60 to-slate-100 p-5 dark:border-white/10 dark:from-slate-900 dark:via-emerald-950/70 dark:to-slate-900">
                        <p className="inline-flex rounded-full border border-emerald-300/60 bg-emerald-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-300/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                            Inscrição guiada
                        </p>
                        <h1 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white md:text-2xl">
                            Garanta sua vaga em poucos passos
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                            Faça login com seus dados, escolha o projeto e confirme sua participação com segurança.
                        </p>
                    </section>
                ) : null}
                <StepIndicator labels={stepLabels} currentStep={progressStep} />

                {/* Step 1: Login */}
                {!success && !sedeAuthenticated && (
                    <div className="card mb-4 animate-fade-in-up border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                        <label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-white">1. Faça login para continuar</label>
                        <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">
                            Use seu CPF e sua senha (data de nascimento em formato DDMMAAAA).
                            <br />
                            Ex.: se nasceu em <span className="font-semibold">05/07/1981</span> use <span className="font-semibold">05071981</span>.
                        </p>
                        <form onSubmit={handleInlineLogin} className="space-y-3">
                            <input
                                className="input-field border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                placeholder="CPF (somente números)"
                                value={loginCpf}
                                onChange={(e) => setLoginCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
                                autoComplete="username"
                                inputMode="numeric"
                                maxLength={11}
                                required
                            />
                            <input
                                className="input-field border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                placeholder="Senha (DDMMAAAA)"
                                value={loginSenha}
                                onChange={(e) => setLoginSenha(e.target.value)}
                                type="password"
                                autoComplete="current-password"
                                inputMode="numeric"
                                maxLength={8}
                                required
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Exemplo de senha: 01011990</p>
                            <button type="submit" className="btn btn-primary w-full" disabled={loginLoading || !loginCpf.trim() || !loginSenha.trim()}>
                                {loginLoading ? "Entrando..." : "Entrar e continuar"}
                            </button>
                        </form>
                    </div>
                )}

                {!success && sedeAuthenticated && step >= 3 && sedeAuthNome && (
                    <div className="card mb-4 animate-fade-in-up border-emerald-400/40 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-500/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-emerald-700 dark:text-emerald-200">Colaborador da sede autenticado</label>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{sedeAuthNome}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        window.sessionStorage.removeItem(SEDE_AUTH_STORAGE_KEY);
                                    }
                                    setSedeAuthenticated(false);
                                    setSedeAuthNome("");
                                    setSelectedColaborador("");
                                    setSelectedSetor("");
                                    setStep(1);
                                    setLoginCpf("");
                                    setLoginSenha("");
                                }}
                                className="text-xs text-slate-600 underline hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            >
                                Trocar login
                            </button>
                        </div>
                    </div>
                )}

                {!success && sedeAuthenticated && selectedSetor && (
                    <div className="card mb-4 animate-fade-in-up border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-xs text-slate-600 dark:text-slate-300">Setor</label>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{setores.find((s) => s.id === selectedSetor)?.nome}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Projeto + Data */}
                {sedeAuthenticated && step >= 3 && !success && (
                    <ProjectDateSelector
                        projectNames={projectNames}
                        filterProjectTitle={filterProjectTitle}
                        onFilterProjectTitle={setFilterProjectTitle}
                        datasProjetos={datasProjetos}
                        loading={loading}
                        filteredDatas={filteredDatas}
                        groupedByMonth={groupedByMonth}
                        existingDataByProjetoId={existingDataByProjetoId}
                        selectedSetor={selectedSetor}
                        statsByDataTotal={statsByDataTotal}
                        statsByDataSetor={statsByDataSetor}
                        selectedDataProjetoId={selectedDataProjetoId}
                        onSelectDataProjetoId={setSelectedDataProjetoId}
                        formatDateShort={formatDateShort}
                    />
                )}

                {/* Step 4 success */}
                {success && (
                    <InscricaoSuccessCard
                        onNewInscricao={resetForm}
                        dashboardIcon={<BarChartIcon />}
                        successIcon={<SuccessIcon />}
                    />
                )}
            </main>

            {/* Sticky Confirm Bar */}
            {selectedDataProjetoId && step === 3 && !success && (
                <InscricaoStickyConfirmBar
                    error={error ?? ""}
                    selectedProjetoTitulo={selectedProjetoTitulo}
                    selectedDataEventoLabel={selectedData ? formatDateTimeShort(selectedData.data_evento) : ""}
                    loading={loading}
                    selectedIsAlreadyInscrito={selectedIsAlreadyInscrito}
                    onConfirm={handleInscrever}
                    icon={<HandshakeIcon />}
                />
            )}
        </div>
    );
}

