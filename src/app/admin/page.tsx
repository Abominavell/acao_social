/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import type { AcaoSocial, Inscricao, Setor } from "@/lib/types";

/* ── SVG Icons ── */

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="M12 5v14" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}

function ClipboardListIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" /><path d="M12 16h4" />
            <path d="M8 11h.01" /><path d="M8 16h.01" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    );
}

function LogOutIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
    );
}

function ChevronLeftIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function AdminContent() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [acoes, setAcoes] = useState<AcaoSocial[]>([]);
    const [selectedAcao, setSelectedAcao] = useState<string>("");
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingAcao, setEditingAcao] = useState<AcaoSocial | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [newAcao, setNewAcao] = useState<{ titulo: string, descricao: string, data_evento: string, vagas_limite: number, vagas_por_setor: Record<string, number> }>({
        titulo: "",
        descricao: "",
        data_evento: "",
        vagas_limite: 20,
        vagas_por_setor: {},
    });

    const [filterTipo, setFilterTipo] = useState<"todos" | "sede" | "externos">("todos");
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [setores, setSetores] = useState<Setor[]>([]);



    async function fetchSetores() {
        const { data } = await supabase.from("setores").select("*").order("nome");
        if (data) setSetores(data);
    }

    async function fetchAcoes() {
        const { data } = await supabase
            .from("acoes_sociais")
            .select("*")
            .order("data_evento", { ascending: false });
        if (data) {
            setAcoes(data);
            if (data.length > 0 && !selectedAcao) setSelectedAcao(data[0].id);
        }
    }

    async function fetchInscricoes(acaoId: string) {
        setLoading(true);
        const { data } = await supabase
            .from("inscricoes")
            .select(`*, colaboradores (id, nome, is_externo, setor_id, setores:setor_id (nome))`)
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
            prev.map((i) => (i.id === inscricaoId ? { ...i, confirmado_presenca: !current } : i))
        );
    }

    useEffect(() => {
        fetchAcoes();
        fetchSetores();
    }, []);

    useEffect(() => {
        if (selectedAcao) fetchInscricoes(selectedAcao);
    }, [selectedAcao]);

    async function handleCreateAcao(e: React.FormEvent) {
        e.preventDefault();
        if (!newAcao.titulo || !newAcao.data_evento) return;

        // Clean up empty sector limits
        const cleanVagasSetor = { ...newAcao.vagas_por_setor };
        Object.keys(cleanVagasSetor).forEach(k => {
            if (cleanVagasSetor[k] === undefined || isNaN(cleanVagasSetor[k])) {
                delete cleanVagasSetor[k];
            }
        });

        const { error } = await supabase.from("acoes_sociais").insert({
            titulo: newAcao.titulo,
            descricao: newAcao.descricao || null,
            data_evento: newAcao.data_evento,
            vagas_limite: newAcao.vagas_limite,
            vagas_por_setor: Object.keys(cleanVagasSetor).length > 0 ? cleanVagasSetor : null,
            ativo: true,
        });
        if (error) {
            console.error("Erro ao criar ação:", error);
            return;
        }
        setNewAcao({ titulo: "", descricao: "", data_evento: "", vagas_limite: 20, vagas_por_setor: {} });
        setShowCreateForm(false);
        await fetchAcoes();
    }

    async function handleEditAcao(e: React.FormEvent) {
        e.preventDefault();
        if (!editingAcao) return;

        const cleanVagasSetor = editingAcao.vagas_por_setor ? { ...editingAcao.vagas_por_setor } : {};
        Object.keys(cleanVagasSetor).forEach(k => {
            if (cleanVagasSetor[k] === undefined || isNaN(cleanVagasSetor[k])) {
                delete cleanVagasSetor[k];
            }
        });

        const updatePayload = {
            titulo: editingAcao.titulo,
            descricao: editingAcao.descricao,
            data_evento: editingAcao.data_evento,
            vagas_limite: editingAcao.vagas_limite,
            vagas_por_setor: Object.keys(cleanVagasSetor).length > 0 ? cleanVagasSetor : null,
            ativo: editingAcao.ativo,
        };

        const { error } = await supabase
            .from("acoes_sociais")
            .update(updatePayload)
            .eq("id", editingAcao.id);

        if (error) {
            console.error("Erro ao salvar ação:", error);
            alert("Erro ao salvar alterações. Verifique o console para mais detalhes.");
            return;
        }

        setEditingAcao(null);
        await fetchAcoes();
    }

    async function handleDeleteAcao(acaoId: string) {
        await supabase.from("inscricoes").delete().eq("acao_id", acaoId);
        await supabase.from("acoes_sociais").delete().eq("id", acaoId);
        setDeleteConfirm(null);
        if (selectedAcao === acaoId) setSelectedAcao("");
        await fetchAcoes();
    }

    /* ── Improvement #2: Toggle Active ── */
    async function toggleAtivo(acao: AcaoSocial) {
        await supabase
            .from("acoes_sociais")
            .update({ ativo: !acao.ativo })
            .eq("id", acao.id);
        fetchAcoes();
    }

    /* ── Improvement #4: Export CSV ── */
    function exportCSV() {
        const selectedAcaoData = acoes.find((a) => a.id === selectedAcao);
        if (!selectedAcaoData || inscricoes.length === 0) return;

        const headers = ["Voluntário", "Setor", "Tipo", "Data Inscrição", "Presença Confirmada"];
        const rows = inscricoes.map((insc) => {
            const colab = insc.colaboradores as unknown as {
                nome: string;
                is_externo: boolean;
                setores: { nome: string };
            };
            return [
                colab?.nome || "—",
                colab?.setores?.nome || "—",
                colab?.is_externo ? "Externo" : "Interno",
                formatDate(insc.created_at),
                insc.confirmado_presenca ? "Sim" : "Não",
            ];
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateSlug = selectedAcaoData.data_evento.split("T")[0];
        link.href = url;
        link.download = `presencas_${selectedAcaoData.titulo.replace(/\s+/g, "_")}_${dateSlug}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
    }

    function formatDateInput(dateStr: string) {
        const d = new Date(dateStr);
        return d.toISOString().slice(0, 16);
    }

    async function handleSignOut() {
        await signOut();
        router.push("/admin/login");
    }

    function prevMonth() {
        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    }

    function nextMonth() {
        setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
    }

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

    const actionsByDate: Record<string, AcaoSocial[]> = {};
    acoes.forEach(a => {
        const dStr = a.data_evento.split("T")[0];
        if (!actionsByDate[dStr]) actionsByDate[dStr] = [];
        actionsByDate[dStr].push(a);
    });

    const monthName = currentMonthDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const totalInscritos = inscricoes.length;
    const totalConfirmados = inscricoes.filter((i) => i.confirmado_presenca).length;
    const selectedAcaoData = acoes.find((a) => a.id === selectedAcao);

    const filteredInscricoes = inscricoes.filter(insc => {
        if (filterTipo === "todos") return true;
        const colab = insc.colaboradores as unknown as { is_externo: boolean };
        if (filterTipo === "externos" && colab?.is_externo) return true;
        if (filterTipo === "sede" && !colab?.is_externo) return true;
        return false;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-dark text-white border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3" aria-label="Voltar para início">
                        <div className="bg-white/90 px-3 py-1.5 rounded-sm">
                            <Image src="/logo.svg" alt="Logo IADVh" width={120} height={44} className="h-7 w-auto" priority />
                        </div>
                        <span className="font-bold text-sm text-white/60">Admin</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40 hidden md:inline">{user?.email}</span>
                        <Link href="/dashboard" className="text-sm text-accent hover:underline">
                            Dashboard
                        </Link>
                        <button onClick={handleSignOut} className="btn btn-header-outline text-xs flex items-center gap-1.5 py-1.5 px-3 min-h-0">
                            <LogOutIcon /> Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Painel de Administração</h1>
                        <p className="text-text-secondary text-sm">
                            Gerencie ações sociais e confirme presenças dos voluntários
                        </p>
                    </div>
                    <button
                        className="btn btn-primary flex items-center gap-2"
                        onClick={() => { setShowCreateForm(!showCreateForm); setEditingAcao(null); }}
                    >
                        {showCreateForm ? <><CloseIcon /> Fechar</> : <><PlusIcon /> Nova Ação</>}
                    </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="card mb-8 animate-fade-in-up">
                        <h2 className="font-bold text-lg mb-4">Nova Ação Social</h2>
                        <form onSubmit={handleCreateAcao} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Título *</label>
                                <input className="input-field" placeholder="Ex: Campanha do Agasalho" value={newAcao.titulo} onChange={(e) => setNewAcao({ ...newAcao, titulo: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Data e Hora *</label>
                                <input type="datetime-local" className="input-field" value={newAcao.data_evento} onChange={(e) => setNewAcao({ ...newAcao, data_evento: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                                <input className="input-field" placeholder="Descrição breve" value={newAcao.descricao} onChange={(e) => setNewAcao({ ...newAcao, descricao: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Limite de Vagas Global</label>
                                <input type="number" className="input-field" min={1} value={newAcao.vagas_limite} onChange={(e) => setNewAcao({ ...newAcao, vagas_limite: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Vagas Específicas por Setor (Opcional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded border border-gray-100 max-h-48 overflow-y-auto">
                                    {setores.map(s => (
                                        <div key={s.id}>
                                            <label className="text-xs text-text-secondary truncate block" title={s.nome}>{s.nome}</label>
                                            <input
                                                type="number"
                                                className="input-field py-1 px-2 text-sm"
                                                placeholder="Sem lim."
                                                value={newAcao.vagas_por_setor[s.id] || ""}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setNewAcao(prev => ({
                                                        ...prev,
                                                        vagas_por_setor: {
                                                            ...prev.vagas_por_setor,
                                                            [s.id]: isNaN(val) ? undefined : val
                                                        } as Record<string, number>
                                                    }))
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="btn btn-primary">Criar Ação Social</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Modal */}
                {editingAcao && (
                    <div className="card mb-8 animate-fade-in-up border-2 border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg">Editar Ação</h2>
                            <button onClick={() => setEditingAcao(null)} className="text-text-secondary hover:text-text-primary p-1"><CloseIcon /></button>
                        </div>
                        <form onSubmit={handleEditAcao} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Título *</label>
                                <input className="input-field" value={editingAcao.titulo} onChange={(e) => setEditingAcao({ ...editingAcao, titulo: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Data e Hora *</label>
                                <input type="datetime-local" className="input-field" value={formatDateInput(editingAcao.data_evento)} onChange={(e) => setEditingAcao({ ...editingAcao, data_evento: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                                <input className="input-field" value={editingAcao.descricao || ""} onChange={(e) => setEditingAcao({ ...editingAcao, descricao: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Limite de Vagas Global</label>
                                <input type="number" className="input-field" min={1} value={editingAcao.vagas_limite} onChange={(e) => setEditingAcao({ ...editingAcao, vagas_limite: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Vagas Específicas por Setor (Opcional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded border border-gray-100 max-h-48 overflow-y-auto">
                                    {setores.map(s => (
                                        <div key={s.id}>
                                            <label className="text-xs text-text-secondary truncate block" title={s.nome}>{s.nome}</label>
                                            <input
                                                type="number"
                                                className="input-field py-1 px-2 text-sm"
                                                placeholder="Sem lim."
                                                value={editingAcao.vagas_por_setor?.[s.id] || ""}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setEditingAcao(prev => {
                                                        if (!prev) return prev;
                                                        return {
                                                            ...prev,
                                                            vagas_por_setor: {
                                                                ...(prev.vagas_por_setor || {}),
                                                                [s.id]: isNaN(val) ? undefined : val
                                                            } as Record<string, number>
                                                        };
                                                    })
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2 flex gap-3">
                                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                                <button type="button" onClick={() => setEditingAcao(null)} className="btn btn-outline">Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="card mb-6 border-2 border-error animate-fade-in-up">
                        <p className="text-text-primary font-semibold mb-3">
                            Tem certeza que deseja excluir esta ação? Todas as inscrições vinculadas também serão removidas.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => handleDeleteAcao(deleteConfirm)} className="btn bg-error text-white hover:bg-red-700">
                                Sim, Excluir
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="btn btn-outline">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Selector + Stats + Action Buttons */}
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-text-secondary">Calendário de Ações</label>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-1 text-gray-400 hover:text-primary"><ChevronLeftIcon /></button>
                                <span className="text-sm font-bold capitalize w-32 text-center">{monthName}</span>
                                <button onClick={nextMonth} className="p-1 text-gray-400 hover:text-primary"><ChevronRightIcon /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d} className="font-semibold text-gray-400">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((dateObj, i) => {
                                if (!dateObj) return <div key={`empty-${i}`} className="p-2" />;
                                // Adjust for local timezone difference
                                const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
                                const dStr = localDate.toISOString().split("T")[0];
                                const dayActions = actionsByDate[dStr] || [];
                                const hasAction = dayActions.length > 0;
                                const isSelected = dayActions.some(a => a.id === selectedAcao);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (hasAction) setSelectedAcao(dayActions[0].id);
                                        }}
                                        disabled={!hasAction}
                                        className={`p-2 text-sm rounded transition-all flex flex-col items-center justify-center 
                                            ${isSelected ? "bg-primary text-white font-bold shadow-md" :
                                                hasAction ? "bg-primary/10 text-primary font-bold hover:bg-primary/20 border border-primary/20" :
                                                    "text-gray-400 hover:bg-gray-50"}`}
                                    >
                                        <span>{dateObj.getDate()}</span>
                                        {hasAction && <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-primary"}`} />}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Action buttons for selected action */}
                        {selectedAcaoData && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => { setEditingAcao(selectedAcaoData); setShowCreateForm(false); }}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    <EditIcon /> Editar
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => setDeleteConfirm(selectedAcaoData.id)}
                                    className="text-xs text-error hover:underline flex items-center gap-1"
                                >
                                    <TrashIcon /> Excluir
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => toggleAtivo(selectedAcaoData)}
                                    className={`text-xs hover:underline flex items-center gap-1 ${selectedAcaoData.ativo ? "text-warning" : "text-success"}`}
                                >
                                    {selectedAcaoData.ativo ? "Desativar" : "Ativar"}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-black text-primary">{totalInscritos}</p>
                        <p className="text-xs text-text-secondary font-medium">Inscritos</p>
                        {selectedAcaoData && (
                            <p className="text-[10px] text-text-secondary mt-1">de {selectedAcaoData.vagas_limite} vagas</p>
                        )}
                    </div>
                    <div className="card text-center">
                        <p className="text-3xl font-black text-success">{totalConfirmados}</p>
                        <p className="text-xs text-text-secondary font-medium">Presenças</p>
                    </div>
                </div>

                {/* Inscriptions Table */}
                <div className="card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="font-bold text-text-primary">Lista de Inscritos</h2>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button onClick={() => setFilterTipo("todos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "todos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Todos</button>
                                <button onClick={() => setFilterTipo("sede")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "sede" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Sede</button>
                                <button onClick={() => setFilterTipo("externos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "externos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Externos</button>
                            </div>
                        </div>
                        {inscricoes.length > 0 && (
                            <button onClick={exportCSV} className="btn btn-outline text-xs py-1.5 px-3 min-h-0 flex items-center gap-1.5 ml-auto sm:ml-0">
                                <DownloadIcon /> Exportar CSV
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary mx-auto mb-3" />
                            Carregando...
                        </div>
                    ) : inscricoes.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="mx-auto mb-3 text-text-secondary/40"><ClipboardListIcon /></div>
                            <p>Nenhuma inscrição encontrada para esta ação.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Voluntário</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Setor</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Inscrição</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Presença</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInscricoes.map((insc) => {
                                        const colab = insc.colaboradores as unknown as {
                                            id: string; nome: string; is_externo: boolean; setores: { nome: string };
                                        };
                                        return (
                                            <tr key={insc.id} className={`transition-colors ${insc.confirmado_presenca ? "bg-green-50" : "hover:bg-gray-50"}`}>
                                                <td className="px-6 py-4"><span className="font-medium text-text-primary">{colab?.nome || "—"}</span></td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{colab?.setores?.nome || "—"}</td>
                                                <td className="px-6 py-4">
                                                    {colab?.is_externo ? (
                                                        <span className="badge badge-warning">Externo</span>
                                                    ) : (
                                                        <span className="badge badge-success">Interno</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{formatDate(insc.created_at)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => togglePresenca(insc.id, insc.confirmado_presenca)}
                                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${insc.confirmado_presenca ? "bg-primary" : "bg-gray-300"}`}
                                                        title={insc.confirmado_presenca ? "Presença confirmada" : "Confirmar presença"}
                                                    >
                                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${insc.confirmado_presenca ? "translate-x-6" : "translate-x-0"}`} />
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

// AdminPage sem proteção temporariamente para fase de testes
function AdminPage() {
    return <AdminContent />;
}

export default function AdminPageWithAuth() {
    return (
        <AuthProvider>
            <AdminPage />
        </AuthProvider>
    );
}
