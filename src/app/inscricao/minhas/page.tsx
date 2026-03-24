"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiJson } from "@/lib/api";
import type { Setor, Colaborador, AcaoSocial, Inscricao } from "@/lib/types";

/* ── SVG Icons ── */

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2v4" /><path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

type InscricaoComDetalhes = Inscricao & {
    acoes_sociais: AcaoSocial;
};

export default function MinhasInscricoesPage() {
    const [setores, setSetores] = useState<Setor[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [selectedSetor, setSelectedSetor] = useState("");
    const [selectedColaborador, setSelectedColaborador] = useState("");
    const [inscricoes, setInscricoes] = useState<InscricaoComDetalhes[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchSetores();
    }, []);

    useEffect(() => {
        if (selectedSetor) {
            fetchColaboradores(selectedSetor);
            setSelectedColaborador("");
            setInscricoes([]);
            setSearched(false);
        }
    }, [selectedSetor]);

    useEffect(() => {
        if (selectedColaborador) {
            fetchInscricoes(selectedColaborador);
        }
    }, [selectedColaborador]);

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

    async function fetchInscricoes(colaboradorId: string) {
        setLoading(true);
        try {
            const data = await apiJson<InscricaoComDetalhes[]>(
                `inscricoes/?colaborador_id=${encodeURIComponent(colaboradorId)}&ordering=-created_at`,
                { auth: false },
            );
            setInscricoes(data);
        } catch {
            setInscricoes([]);
        }
        setSearched(true);
        setLoading(false);
    }

    const proximas = useMemo(() =>
        inscricoes.filter((i) => new Date(i.acoes_sociais.data_evento) >= new Date()),
        [inscricoes]
    );

    const passadas = useMemo(() =>
        inscricoes.filter((i) => new Date(i.acoes_sociais.data_evento) < new Date()),
        [inscricoes]
    );

    const totalPresencas = passadas.filter((i) => i.confirmado_presenca).length;

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "long", year: "numeric",
        });
    }

    function formatDateShort(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short",
        });
    }

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
                    <Link href="/inscricao" className="btn btn-accent-solid text-xs py-1.5 px-3 min-h-0">
                        Nova Inscrição
                    </Link>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-text-primary mb-1">Minhas Inscrições</h1>
                <p className="text-sm text-text-secondary mb-6">Consulte suas inscrições e presenças confirmadas</p>

                {/* Identification */}
                <div className="card mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <SearchIcon />
                        <span className="font-semibold text-sm text-text-primary">Identifique-se</span>
                    </div>
                    <div className="space-y-3">
                        <select className="input-field" value={selectedSetor} onChange={(e) => setSelectedSetor(e.target.value)}>
                            <option value="">Selecione seu setor...</option>
                            {setores.map((s) => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                        </select>
                        {selectedSetor && (
                            <select className="input-field" value={selectedColaborador} onChange={(e) => setSelectedColaborador(e.target.value)}>
                                <option value="">Selecione seu nome...</option>
                                {colaboradores.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nome} {c.is_externo ? "(Externo)" : ""}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-text-secondary">
                        <div className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary mx-auto mb-3" />
                        Buscando inscrições...
                    </div>
                )}

                {/* No inscriptions */}
                {searched && !loading && inscricoes.length === 0 && (
                    <div className="card text-center py-10">
                        <div className="text-text-secondary/30 flex justify-center mb-3"><UserIcon /></div>
                        <p className="text-text-secondary font-medium mb-2">Nenhuma inscrição encontrada</p>
                        <p className="text-xs text-text-secondary mb-4">Você ainda não se inscreveu em nenhuma ação social.</p>
                        <Link href="/inscricao" className="btn btn-primary">Inscrever-se agora</Link>
                    </div>
                )}

                {/* Results */}
                {searched && !loading && inscricoes.length > 0 && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="card text-center py-3">
                                <p className="text-2xl font-black text-primary">{inscricoes.length}</p>
                                <p className="text-[10px] text-text-secondary font-medium uppercase">Inscrições</p>
                            </div>
                            <div className="card text-center py-3">
                                <p className="text-2xl font-black text-success">{totalPresencas}</p>
                                <p className="text-[10px] text-text-secondary font-medium uppercase">Presenças</p>
                            </div>
                            <div className="card text-center py-3">
                                <p className="text-2xl font-black text-primary-light">{proximas.length}</p>
                                <p className="text-[10px] text-text-secondary font-medium uppercase">Próximas</p>
                            </div>
                        </div>

                        {/* Upcoming */}
                        {proximas.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <CalendarIcon /> Próximas Ações ({proximas.length})
                                </h2>
                                <div className="space-y-2">
                                    {proximas.map((insc) => (
                                        <div key={insc.id} className="bg-surface border border-primary/20 p-3 flex items-center gap-3">
                                            <div className="flex-shrink-0 w-14 text-center py-1.5 text-xs font-bold bg-primary text-white">
                                                {formatDateShort(insc.acoes_sociais.data_evento)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-text-primary truncate">{insc.acoes_sociais.titulo}</p>
                                                <p className="text-xs text-text-secondary">{formatDate(insc.acoes_sociais.data_evento)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary text-xs">
                                                <ClockIcon /> Aguardando
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past */}
                        {passadas.length > 0 && (
                            <div>
                                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    Histórico ({passadas.length})
                                </h2>
                                <div className="space-y-2">
                                    {passadas.map((insc) => (
                                        <div key={insc.id} className={`p-3 flex items-center gap-3 ${insc.confirmado_presenca ? "bg-green-50 border border-green-200" : "bg-surface border border-gray-100"}`}>
                                            <div className="flex-shrink-0 w-14 text-center py-1.5 text-xs font-bold bg-gray-100 text-text-secondary">
                                                {formatDateShort(insc.acoes_sociais.data_evento)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-text-primary truncate">{insc.acoes_sociais.titulo}</p>
                                                <p className="text-xs text-text-secondary">{formatDate(insc.acoes_sociais.data_evento)}</p>
                                            </div>
                                            {insc.confirmado_presenca ? (
                                                <span className="flex items-center gap-1 text-success text-xs font-semibold">
                                                    <CheckCircleIcon /> Presente
                                                </span>
                                            ) : (
                                                <span className="text-xs text-text-secondary">Ausente</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
