"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Setor, Colaborador, AcaoSocial } from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

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

    useEffect(() => {
        fetchSetores();
        fetchAcoes();
    }, []);

    useEffect(() => {
        if (selectedSetor) {
            fetchColaboradores(selectedSetor);
            setSelectedColaborador("");
            setStep(2);
        }
    }, [selectedSetor]);

    async function fetchSetores() {
        const { data } = await supabase
            .from("setores")
            .select("*")
            .order("nome");
        if (data) setSetores(data);
    }

    async function fetchColaboradores(setorId: string) {
        const { data } = await supabase
            .from("colaboradores")
            .select("*")
            .eq("setor_id", setorId)
            .order("nome");
        if (data) setColaboradores(data);
    }

    async function fetchAcoes() {
        const { data } = await supabase
            .from("acoes_sociais")
            .select("*")
            .eq("ativo", true)
            .gte("data_evento", new Date().toISOString())
            .order("data_evento");
        if (data) setAcoes(data);
    }

    async function handleInscrever() {
        if (!selectedColaborador || !selectedAcao) return;
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

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function resetForm() {
        setStep(1);
        setSelectedSetor("");
        setSelectedColaborador("");
        setSelectedAcao("");
        setSuccess(false);
        setError(null);
    }

    const stepLabels = ["Setor", "Colaborador", "Ação", "Confirmação"];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary text-text-on-primary sticky top-0 z-50">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-primary font-black text-xs">IA</span>
                        </div>
                        <span className="font-bold text-sm">Voluntariado IADVH</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {stepLabels.map((label, i) => {
                        const stepNum = (i + 1) as Step;
                        const isActive = step >= stepNum;
                        const isCurrent = step === stepNum;
                        return (
                            <div key={label} className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCurrent
                                            ? "bg-primary text-white scale-110 shadow-lg"
                                            : isActive
                                                ? "bg-primary-light text-white"
                                                : "bg-gray-200 text-text-secondary"
                                        }`}
                                >
                                    {isActive && stepNum < step ? "✓" : stepNum}
                                </div>
                                <span
                                    className={`text-xs mt-1 font-medium ${isCurrent ? "text-primary" : "text-text-secondary"
                                        }`}
                                >
                                    {label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step 1: Setor */}
                {step >= 1 && !success && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            1. Selecione seu Setor
                        </label>
                        <select
                            className="input-field"
                            value={selectedSetor}
                            onChange={(e) => setSelectedSetor(e.target.value)}
                        >
                            <option value="">Escolha o setor...</option>
                            {setores.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Step 2: Colaborador */}
                {step >= 2 && !success && (
                    <div className="card mb-4 animate-fade-in-up">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            2. Identifique-se
                        </label>
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
                                <option key={c.id} value={c.id}>
                                    {c.nome} {c.is_externo ? "(Externo)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Step 3: Ação Social */}
                {step >= 3 && !success && (
                    <div className="animate-fade-in-up">
                        <h3 className="text-sm font-semibold text-text-primary mb-3">
                            3. Escolha uma Ação Social
                        </h3>
                        {acoes.length === 0 ? (
                            <div className="card text-center py-8">
                                <p className="text-text-secondary">
                                    Nenhuma ação social disponível no momento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {acoes.map((acao) => (
                                    <button
                                        key={acao.id}
                                        onClick={() => setSelectedAcao(acao.id)}
                                        className={`card w-full text-left cursor-pointer transition-all ${selectedAcao === acao.id
                                                ? "ring-2 ring-primary bg-green-50"
                                                : "hover:shadow-[var(--shadow-card-hover)]"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-text-primary">
                                                    {acao.titulo}
                                                </h4>
                                                {acao.descricao && (
                                                    <p className="text-text-secondary text-sm mt-1">
                                                        {acao.descricao}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs text-primary font-medium">
                                                        📅 {formatDate(acao.data_evento)}
                                                    </span>
                                                    {acao.vagas_limite > 0 && (
                                                        <span className="badge badge-info">
                                                            {acao.vagas_limite} vagas
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedAcao === acao.id && (
                                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span className="text-white text-xs">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Confirm Button */}
                        {selectedAcao && (
                            <div className="mt-6 animate-fade-in-up">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-[var(--radius-sm)] px-4 py-3 mb-4 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    className="btn btn-primary w-full py-4 text-base"
                                    onClick={handleInscrever}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Inscrevendo...
                                        </span>
                                    ) : (
                                        "🤝 Confirmar Inscrição"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Success */}
                {success && (
                    <div className="card text-center py-10 animate-scale-in">
                        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-2">
                            Inscrição Realizada!
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Sua inscrição foi registrada com sucesso. Aguarde a confirmação de presença pelo administrador no dia da ação.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                className="btn btn-primary w-full py-3"
                                onClick={resetForm}
                            >
                                Nova Inscrição
                            </button>
                            <Link href="/dashboard" className="btn btn-outline w-full py-3">
                                📊 Ver Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
