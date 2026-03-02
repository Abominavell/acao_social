"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { AcaoSocial, Inscricao } from "@/lib/types";

export default function AdminPage() {
    const [acoes, setAcoes] = useState<AcaoSocial[]>([]);
    const [selectedAcao, setSelectedAcao] = useState<string>("");
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAcao, setNewAcao] = useState({
        titulo: "",
        descricao: "",
        data_evento: "",
        vagas_limite: 20,
    });

    useEffect(() => {
        fetchAcoes();
    }, []);

    useEffect(() => {
        if (selectedAcao) {
            fetchInscricoes(selectedAcao);
        }
    }, [selectedAcao]);

    async function fetchAcoes() {
        const { data } = await supabase
            .from("acoes_sociais")
            .select("*")
            .order("data_evento", { ascending: false });
        if (data) {
            setAcoes(data);
            if (data.length > 0 && !selectedAcao) {
                setSelectedAcao(data[0].id);
            }
        }
    }

    async function fetchInscricoes(acaoId: string) {
        setLoading(true);
        const { data } = await supabase
            .from("inscricoes")
            .select(`
        *,
        colaboradores (id, nome, is_externo, setor_id,
          setores:setor_id (nome)
        )
      `)
            .eq("acao_id", acaoId)
            .order("created_at");

        if (data) setInscricoes(data as unknown as Inscricao[]);
        setLoading(false);
    }

    async function togglePresenca(inscricaoId: string, current: boolean) {
        await supabase
            .from("inscricoes")
            .update({ confirmado_presenca: !current })
            .eq("id", inscricaoId);

        setInscricoes((prev) =>
            prev.map((i) =>
                i.id === inscricaoId
                    ? { ...i, confirmado_presenca: !current }
                    : i
            )
        );
    }

    async function handleCreateAcao(e: React.FormEvent) {
        e.preventDefault();
        if (!newAcao.titulo || !newAcao.data_evento) return;

        await supabase.from("acoes_sociais").insert({
            titulo: newAcao.titulo,
            descricao: newAcao.descricao || null,
            data_evento: newAcao.data_evento,
            vagas_limite: newAcao.vagas_limite,
            ativo: true,
        });

        setNewAcao({ titulo: "", descricao: "", data_evento: "", vagas_limite: 20 });
        setShowCreateForm(false);
        fetchAcoes();
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const totalInscritos = inscricoes.length;
    const totalConfirmados = inscricoes.filter((i) => i.confirmado_presenca).length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-dark text-white">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-black text-xs">IA</span>
                            </div>
                            <span className="font-bold">IADVH Admin</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/inscricao" className="text-sm text-accent hover:underline">
                            Inscrição
                        </Link>
                        <Link href="/dashboard" className="text-sm text-accent hover:underline">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            Painel de Administração
                        </h1>
                        <p className="text-text-secondary text-sm">
                            Gerencie ações sociais e confirme presenças dos voluntários
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "✕ Fechar" : "+ Nova Ação"}
                    </button>
                </div>

                {/* Create New Action Form */}
                {showCreateForm && (
                    <div className="card mb-8 animate-fade-in-up">
                        <h2 className="font-bold text-lg mb-4">Nova Ação Social</h2>
                        <form onSubmit={handleCreateAcao} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Título *
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="Ex: Campanha do Agasalho"
                                    value={newAcao.titulo}
                                    onChange={(e) => setNewAcao({ ...newAcao, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Data e Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={newAcao.data_evento}
                                    onChange={(e) => setNewAcao({ ...newAcao, data_evento: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Descrição
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="Descrição breve da ação"
                                    value={newAcao.descricao}
                                    onChange={(e) => setNewAcao({ ...newAcao, descricao: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Limite de Vagas
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min={1}
                                    value={newAcao.vagas_limite}
                                    onChange={(e) => setNewAcao({ ...newAcao, vagas_limite: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="btn btn-primary">
                                    Criar Ação Social
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Action Selector + Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2 card">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Ação Social
                        </label>
                        <select
                            className="input-field"
                            value={selectedAcao}
                            onChange={(e) => setSelectedAcao(e.target.value)}
                        >
                            {acoes.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.titulo} — {formatDate(a.data_evento)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-black text-primary">{totalInscritos}</p>
                        <p className="text-xs text-text-secondary font-medium">Inscritos</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-black text-success">{totalConfirmados}</p>
                        <p className="text-xs text-text-secondary font-medium">Presenças</p>
                    </div>
                </div>

                {/* Inscriptions Table */}
                <div className="card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-text-primary">Lista de Inscritos</h2>
                    </div>
                    {loading ? (
                        <div className="text-center py-12 text-text-secondary">
                            Carregando...
                        </div>
                    ) : inscricoes.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <p className="text-4xl mb-2">📋</p>
                            <p>Nenhuma inscrição encontrada para esta ação.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Voluntário
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Setor
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                                            Data Inscrição
                                        </th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">
                                            Presença
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inscricoes.map((insc) => {
                                        const colab = insc.colaboradores as unknown as {
                                            id: string;
                                            nome: string;
                                            is_externo: boolean;
                                            setores: { nome: string };
                                        };
                                        return (
                                            <tr
                                                key={insc.id}
                                                className={`transition-colors ${insc.confirmado_presenca
                                                        ? "bg-green-50"
                                                        : "hover:bg-gray-50"
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-text-primary">
                                                        {colab?.nome || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">
                                                    {colab?.setores?.nome || "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {colab?.is_externo ? (
                                                        <span className="badge badge-warning">Externo</span>
                                                    ) : (
                                                        <span className="badge badge-success">Interno</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">
                                                    {formatDate(insc.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            togglePresenca(insc.id, insc.confirmado_presenca)
                                                        }
                                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${insc.confirmado_presenca
                                                                ? "bg-primary"
                                                                : "bg-gray-300"
                                                            }`}
                                                        title={
                                                            insc.confirmado_presenca
                                                                ? "Presença confirmada"
                                                                : "Confirmar presença"
                                                        }
                                                    >
                                                        <span
                                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${insc.confirmado_presenca
                                                                    ? "translate-x-6"
                                                                    : "translate-x-0"
                                                                }`}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
