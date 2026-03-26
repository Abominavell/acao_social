/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiJson, formatApiError } from "@/lib/api";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import type { AcaoSocial, Colaborador, Inscricao, Setor } from "@/lib/types";
import NovoProjetoAdminContent from "./novo-projeto-admin-content";

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

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2v4" /><path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

function AdminContent() {
    const { user, loading: authLoading, signOut } = useAuth();
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
    const [formError, setFormError] = useState<string | null>(null);

    const [filterTipo, setFilterTipo] = useState<"todos" | "sede" | "externos">("todos");
    const [filterStatus, setFilterStatus] = useState<"todas" | "realizadas" | "nao_realizadas">("todas");
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [expandedAcaoId, setExpandedAcaoId] = useState<string | null>(null);
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [setores, setSetores] = useState<Setor[]>([]);
    const [setorInternalCounts, setSetorInternalCounts] = useState<Record<string, number>>({});



    async function fetchSetores() {
        try {
            const data = await apiJson<Setor[]>("setores/?ordering=nome", { auth: true });
            setSetores(data);
        } catch {
            /* silencioso: painel continua sem lista de setores */
        }
    }

    async function fetchSetorInternalCounts() {
        try {
            const colaboradores = await apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: true });
            const counts: Record<string, number> = {};
            colaboradores.forEach((c) => {
                if (!c.is_externo && c.setor_id) {
                    counts[c.setor_id] = (counts[c.setor_id] || 0) + 1;
                }
            });
            setSetorInternalCounts(counts);
        } catch {
            setSetorInternalCounts({});
        }
    }

    async function fetchAcoes() {
        try {
            const data = await apiJson<AcaoSocial[]>("acoes_sociais/?ordering=-data_evento", { auth: true });
            setAcoes(data);
        } catch {
            /* silencioso */
        }
    }

    function calculateVagasSetorProporcional(vagasLimite: number): Record<string, number> {
        const entries = Object.entries(setorInternalCounts).filter(([, count]) => count > 0);
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

    function validateVagasSetor(vagasPorSetor: Record<string, number>, vagasLimite: number): string | null {
        const cleanValues = Object.values(vagasPorSetor).filter((v) => !isNaN(v) && v > 0);
        const soma = cleanValues.reduce((a, b) => a + b, 0);
        if (cleanValues.length === 0) return "Não há colaboradores internos suficientes para distribuir as vagas.";
        if (soma !== vagasLimite) return `A soma das vagas por setor (${soma}) deve ser igual ao limite global (${vagasLimite}).`;
        return null;
    }

    async function fetchInscricoes(acaoId?: string) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ ordering: "-created_at" });
            if (acaoId) params.set("acao_id", acaoId);
            const data = await apiJson<Inscricao[]>(`inscricoes/?${params.toString()}`, { auth: true });
            setInscricoes(data);
        } catch {
            setInscricoes([]);
        }
        setLoading(false);
    }

    async function togglePresenca(inscricaoId: string, current: boolean) {
        try {
            await apiJson(`inscricoes/${inscricaoId}/`, {
                method: "PATCH",
                body: JSON.stringify({ confirmado_presenca: !current }),
                auth: true,
            });
            setInscricoes((prev) =>
                prev.map((i) => (i.id === inscricaoId ? { ...i, confirmado_presenca: !current } : i))
            );
        } catch (e) {
            console.error(formatApiError(e));
        }
    }

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/admin/login");
            return;
        }
        fetchAcoes();
        fetchSetores();
        fetchSetorInternalCounts();
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) return;
        fetchInscricoes(selectedAcao);
    }, [selectedAcao, user]);

    async function handleCreateAcao(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        if (!newAcao.titulo || !newAcao.data_evento) return;

        const cleanVagasSetor = calculateVagasSetorProporcional(newAcao.vagas_limite);

        // Validate sector vacancies
        const validationErr = validateVagasSetor(cleanVagasSetor, newAcao.vagas_limite);
        if (validationErr) {
            setFormError(validationErr);
            return;
        }

        try {
            await apiJson("acoes_sociais/", {
                method: "POST",
                body: JSON.stringify({
                    titulo: newAcao.titulo,
                    descricao: newAcao.descricao || null,
                    data_evento: newAcao.data_evento,
                    vagas_limite: newAcao.vagas_limite,
                    vagas_por_setor: Object.keys(cleanVagasSetor).length > 0 ? cleanVagasSetor : null,
                    ativo: true,
                }),
                auth: true,
            });
        } catch (e) {
            console.error("Erro ao criar ação:", formatApiError(e));
            return;
        }
        setFormError(null);
        setNewAcao({ titulo: "", descricao: "", data_evento: "", vagas_limite: 20, vagas_por_setor: {} });
        setShowCreateForm(false);
        await fetchAcoes();
    }

    async function handleEditAcao(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        if (!editingAcao) return;

        const cleanVagasSetor = calculateVagasSetorProporcional(editingAcao.vagas_limite);

        // Validate sector vacancies
        const validationErr = validateVagasSetor(cleanVagasSetor, editingAcao.vagas_limite);
        if (validationErr) {
            setFormError(validationErr);
            return;
        }

        const updatePayload = {
            titulo: editingAcao.titulo,
            descricao: editingAcao.descricao,
            data_evento: editingAcao.data_evento,
            vagas_limite: editingAcao.vagas_limite,
            vagas_por_setor: Object.keys(cleanVagasSetor).length > 0 ? cleanVagasSetor : null,
            ativo: editingAcao.ativo,
        };

        try {
            await apiJson(`acoes_sociais/${editingAcao.id}/`, {
                method: "PATCH",
                body: JSON.stringify(updatePayload),
                auth: true,
            });
        } catch (e) {
            console.error("Erro ao salvar ação:", formatApiError(e));
            alert("Erro ao salvar alterações. Verifique o console para mais detalhes.");
            return;
        }

        setFormError(null);
        setEditingAcao(null);
        await fetchAcoes();
    }

    async function handleDeleteAcao(acaoId: string) {
        const list = await apiJson<{ id: string }[]>(`inscricoes/?acao_id=${acaoId}`, { auth: true });
        await Promise.all(
            list.map((i) => apiJson(`inscricoes/${i.id}/`, { method: "DELETE", auth: true })),
        );
        await apiJson(`acoes_sociais/${acaoId}/`, { method: "DELETE", auth: true });
        setDeleteConfirm(null);
        if (selectedAcao === acaoId) setSelectedAcao("");
        await fetchAcoes();
    }

    /* ── Improvement #2: Toggle Active ── */
    async function toggleAtivo(acao: AcaoSocial) {
        try {
            await apiJson(`acoes_sociais/${acao.id}/`, {
                method: "PATCH",
                body: JSON.stringify({ ativo: !acao.ativo }),
                auth: true,
            });
            fetchAcoes();
        } catch (e) {
            console.error(formatApiError(e));
        }
    }

    function getFilteredInscricoes() {
        return inscricoes.filter((insc) => {
            if (filterTipo !== "todos") {
                const colab = insc.colaboradores as unknown as { is_externo: boolean };
                if (filterTipo === "externos" && !colab?.is_externo) return false;
                if (filterTipo === "sede" && colab?.is_externo) return false;
            }
            if (filterMonth) {
                const inscDate = new Date(insc.created_at);
                const [fYear, fMonth] = filterMonth.split("-").map(Number);
                if (inscDate.getFullYear() !== fYear || inscDate.getMonth() + 1 !== fMonth) return false;
            }
            return true;
        });
    }

    /* ── Improvement #4: Export CSV ── */
    function exportCSV() {
        const selectedAcaoData = acoes.find((a) => a.id === selectedAcao);
        const source = getFilteredInscricoes();
        if (source.length === 0) return;

        const headers = ["Voluntario", "Setor", "Tipo", "Data Inscricao", "Presenca Confirmada"];
        const rows = source.map((insc) => {
            const colab = insc.colaboradores as unknown as {
                nome: string;
                is_externo: boolean;
                setores: { nome: string };
            };
            const dataInscricao = new Date(insc.created_at).toLocaleString("pt-BR");
            return [
                colab?.nome || "—",
                colab?.setores?.nome || "—",
                colab?.is_externo ? "Externo" : "Interno",
                dataInscricao,
                insc.confirmado_presenca ? "Sim" : "Não",
            ];
        });

        const escapeCsvCell = (value: string) => value.replace(/"/g, '""').trim();
        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${escapeCsvCell(cell)}"`).join(";"))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateSlug = new Date().toISOString().split("T")[0];
        const acaoSlug = selectedAcaoData
            ? selectedAcaoData.titulo.replace(/\s+/g, "_")
            : "todas_as_acoes";
        link.href = url;
        link.download = `presencas_${acaoSlug}_${dateSlug}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            weekday: "long", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
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

    const generatedNewVagasPorSetor = calculateVagasSetorProporcional(newAcao.vagas_limite);
    const generatedEditVagasPorSetor = editingAcao
        ? calculateVagasSetorProporcional(editingAcao.vagas_limite)
        : {};

    if (authLoading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center text-text-secondary">
                Carregando...
            </main>
        );
    }

    if (!user) return null;

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

    // Filter actions by Realizadas/Não realizadas
    const now = new Date();
    const filteredAcoesByStatus = acoes.filter(a => {
        if (filterStatus === "todas") return true;
        const eventDate = new Date(a.data_evento);
        if (filterStatus === "realizadas") return eventDate < now;
        return eventDate >= now;
    });

    const actionsByDate: Record<string, AcaoSocial[]> = {};
    filteredAcoesByStatus.forEach(a => {
        const dStr = a.data_evento.split("T")[0];
        if (!actionsByDate[dStr]) actionsByDate[dStr] = [];
        actionsByDate[dStr].push(a);
    });

    const monthName = currentMonthDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const totalInscritos = inscricoes.length;
    const totalConfirmados = inscricoes.filter((i) => i.confirmado_presenca).length;
    const selectedAcaoData = acoes.find((a) => a.id === selectedAcao);

    const filteredInscricoes = getFilteredInscricoes();
    const groupedInscricoes = Object.entries(
        filteredInscricoes.reduce((acc, insc) => {
            const acao = (insc.acoes_sociais as unknown as AcaoSocial | undefined);
            const key = acao?.id || "sem_acao";
            if (!acc[key]) {
                acc[key] = {
                    acao,
                    items: [] as Inscricao[],
                };
            }
            acc[key].items.push(insc);
            return acc;
        }, {} as Record<string, { acao?: AcaoSocial; items: Inscricao[] }>),
    ).sort(([, a], [, b]) => {
        const aDate = a.acao?.data_evento ? new Date(a.acao.data_evento).getTime() : 0;
        const bDate = b.acao?.data_evento ? new Date(b.acao.data_evento).getTime() : 0;
        return bDate - aDate;
    });

    // Parse external volunteer name: "Nome (Unidade)" → { name, unit }
    function parseExternoName(nome: string): { name: string; unit: string } {
        const match = nome.match(/^(.+?)\s*\((.+)\)$/);
        if (match) return { name: match[1].trim(), unit: match[2].trim() };
        return { name: nome, unit: "—" };
    }

    // Generate month options for the filter
    const monthOptions: { value: string; label: string }[] = [];
    const uniqueMonths = new Set<string>();
    inscricoes.forEach(insc => {
        const d = new Date(insc.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!uniqueMonths.has(key)) {
            uniqueMonths.add(key);
            monthOptions.push({
                value: key,
                label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            });
        }
    });
    monthOptions.sort((a, b) => b.value.localeCompare(a.value));

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
                        <span className="text-xs text-white/40 hidden md:inline">{user?.username}</span>
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
                            Gerencie ações sociais e presenças
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <Link href="/admin/setores" className="btn btn-outline text-xs py-1.5 px-3 min-h-0">
                                Setores
                            </Link>
                            <Link href="/admin/colaboradores" className="btn btn-outline text-xs py-1.5 px-3 min-h-0">
                                Colaboradores
                            </Link>
                            <Link href="/admin/metas" className="btn btn-outline text-xs py-1.5 px-3 min-h-0">
                                Metas por Setor
                            </Link>
                        </div>
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
                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm rounded">{formError}</div>
                        )}
                        <form onSubmit={handleCreateAcao} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do projeto *</label>
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
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Vagas proporcionais por setor (automático: % do setor na empresa x vagas da ação)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded border border-gray-100 max-h-48 overflow-y-auto">
                                    {setores.map(s => (
                                        <div key={s.id}>
                                            <label className="text-xs text-text-secondary truncate block" title={s.nome}>
                                                {s.nome} ({setorInternalCounts[s.id] || 0})
                                            </label>
                                            <input
                                                type="number"
                                                className="input-field py-1 px-2 text-sm"
                                                value={generatedNewVagasPorSetor[s.id] || 0}
                                                disabled
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
                            <button onClick={() => { setEditingAcao(null); setFormError(null); }} className="text-text-secondary hover:text-text-primary p-1"><CloseIcon /></button>
                        </div>
                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm rounded">{formError}</div>
                        )}
                        <form onSubmit={handleEditAcao} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do projeto *</label>
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
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Vagas proporcionais por setor (automático: % do setor na empresa x vagas da ação)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded border border-gray-100 max-h-48 overflow-y-auto">
                                    {setores.map(s => (
                                        <div key={s.id}>
                                            <label className="text-xs text-text-secondary truncate block" title={s.nome}>
                                                {s.nome} ({setorInternalCounts[s.id] || 0})
                                            </label>
                                            <input
                                                type="number"
                                                className="input-field py-1 px-2 text-sm"
                                                value={generatedEditVagasPorSetor[s.id] || 0}
                                                disabled
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
                        {/* Action Selector */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                    Calendário de Ações
                                    {selectedAcao && (
                                        <button onClick={() => setSelectedAcao("")} className="text-[10px] text-primary hover:underline font-normal bg-primary/10 px-2 py-0.5 rounded-full">
                                            Limpar Seleção ✖
                                        </button>
                                    )}
                                </label>
                                <div className="flex bg-gray-100 p-0.5 rounded-md">
                                    <button onClick={() => setFilterStatus("todas")} className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "todas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Todas</button>
                                    <button onClick={() => setFilterStatus("realizadas")} className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "realizadas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Realizadas</button>
                                    <button onClick={() => setFilterStatus("nao_realizadas")} className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "nao_realizadas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Futuras</button>
                                </div>
                            </div>
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
                                const allInactive = hasAction && dayActions.every(a => !a.ativo);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (hasAction) setSelectedAcao(isSelected ? "" : dayActions[0].id);
                                        }}
                                        disabled={!hasAction}
                                        className={`p-2 text-sm rounded transition-all flex flex-col items-center justify-center 
                                            ${isSelected ? "bg-primary text-white font-bold shadow-md" :
                                                allInactive ? "bg-gray-100 text-gray-400 line-through opacity-60" :
                                                    hasAction ? "bg-primary/10 text-primary font-bold hover:bg-primary/20 border border-primary/20" :
                                                        "text-gray-400 hover:bg-gray-50"}`}
                                    >
                                        <span>{dateObj.getDate()}</span>
                                        {hasAction && <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : allInactive ? "bg-gray-400" : "bg-primary"}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Side Panel */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                        {selectedAcaoData ? (
                            <div className="card h-full flex flex-col animate-fade-in-up border-l-4 border-l-primary">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">Ação Selecionada</span>
                                    <h3 className="text-xl font-black text-text-primary leading-tight">{selectedAcaoData.titulo}</h3>
                                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5"><CalendarIcon /> {formatDate(selectedAcaoData.data_evento)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gray-50 p-3 rounded text-center">
                                        <p className="text-2xl font-black text-primary">{totalInscritos}</p>
                                        <p className="text-[10px] text-text-secondary font-medium">Inscritos / {selectedAcaoData.vagas_limite} Limite</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded text-center">
                                        <p className="text-2xl font-black text-success">{totalConfirmados}</p>
                                        <p className="text-[10px] text-green-700 font-medium">Presenças Confirmadas</p>
                                    </div>
                                </div>

                                {selectedAcaoData.vagas_por_setor && Object.keys(selectedAcaoData.vagas_por_setor).length > 0 && (
                                    <div className="mb-4 flex-1">
                                        <p className="text-xs font-semibold text-text-secondary mb-2">Vagas por Setor</p>
                                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                                            {Object.entries(selectedAcaoData.vagas_por_setor).map(([setId, limit]) => {
                                                const sNome = setores.find(s => s.id === setId)?.nome || "Setor Removido";
                                                const sInscs = inscricoes.filter(i => {
                                                    const colab = i.colaboradores as unknown as { nome: string; is_externo: boolean; setor_id: string; setores?: { nome: string } };
                                                    if (!colab) return false;
                                                    // For internals, check if their setor_id matches this section's ID
                                                    if (!colab.is_externo && colab.setor_id === setId) return true;
                                                    // For externals, the parsed 'unit' might match the sector name
                                                    if (colab.is_externo) {
                                                        const extInfo = parseExternoName(colab.nome);
                                                        return extInfo.unit === sNome;
                                                    }
                                                    return false;
                                                }).length;
                                                return (
                                                    <div key={setId} className="bg-white border border-gray-100 rounded p-2 flex justify-between items-center shadow-sm">
                                                        <span className="text-[10px] text-text-secondary font-medium truncate pr-2 w-3/4" title={sNome}>{sNome}</span>
                                                        <span className={`text-[10px] font-bold ${sInscs >= limit ? "text-error" : "text-primary"}`}>
                                                            {sInscs}/{limit}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-3 mt-auto border-t border-gray-100">
                                    <button
                                        onClick={() => { setEditingAcao(selectedAcaoData); setShowCreateForm(false); }}
                                        className="btn btn-outline min-h-0 py-1.5 px-3 text-xs flex-1 flex items-center justify-center gap-1"
                                    >
                                        <EditIcon /> Editar
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(selectedAcaoData.id)}
                                        className="btn min-h-0 py-1.5 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 border-error flex items-center justify-center gap-1"
                                    >
                                        <TrashIcon />
                                    </button>
                                    <button
                                        onClick={() => toggleAtivo(selectedAcaoData)}
                                        className={`btn min-h-0 py-1.5 px-3 text-xs flex-1 border flex items-center justify-center gap-1 ${selectedAcaoData.ativo ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"}`}
                                    >
                                        {selectedAcaoData.ativo ? "Desativar" : "Ativar"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card h-full flex flex-col justify-center animate-fade-in-up">
                                <div className="text-center mb-6">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block">Visão Geral</span>
                                    <h3 className="text-lg font-bold text-text-primary">Todas as Ações</h3>
                                    <p className="text-xs text-text-secondary mt-1">Selecione uma ação no calendário para ver seus detalhes.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                                        <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2"><ClipboardListIcon /></div>
                                        <p className="text-3xl font-black text-primary">{totalInscritos}</p>
                                        <p className="text-xs text-text-secondary font-medium">Inscritos Globais</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                        <div className="w-10 h-10 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center mb-2"><CheckCircleIcon /></div>
                                        <p className="text-3xl font-black text-success">{totalConfirmados}</p>
                                        <p className="text-xs text-text-secondary font-medium">Presenças Globais</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inscriptions Table */}
                <div className="card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="font-bold text-text-primary">
                                {selectedAcaoData ? `Inscritos: ${selectedAcaoData.titulo}` : "Lista de Inscritos - Todas as Ações"}
                            </h2>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button onClick={() => setFilterTipo("todos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "todos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Todos</button>
                                <button onClick={() => setFilterTipo("sede")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "sede" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Sede</button>
                                <button onClick={() => setFilterTipo("externos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "externos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>Externos</button>
                            </div>
                            <select
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 text-text-secondary bg-white"
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                            >
                                <option value="">Todos os meses</option>
                                {monthOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
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
                    ) : selectedAcaoData ? (
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
                                        const externoInfo = colab?.is_externo ? parseExternoName(colab.nome) : null;
                                        const displayName = externoInfo ? externoInfo.name : (colab?.nome || "—");
                                        const displaySetor = externoInfo ? externoInfo.unit : (colab?.setores?.nome || "—");
                                        return (
                                            <tr key={insc.id} className={`transition-colors ${insc.confirmado_presenca ? "bg-green-50" : "hover:bg-gray-50"}`}>
                                                <td className="px-6 py-4"><span className="font-medium text-text-primary">{displayName}</span></td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{displaySetor}</td>
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
                    ) : (
                        <div className="space-y-6 p-4">
                            {groupedInscricoes.map(([acaoId, group]) => (
                                <div key={acaoId} className="border border-gray-100 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedAcaoId((prev) => (prev === acaoId ? null : acaoId))}
                                        className="w-full bg-gray-50 px-4 py-3 border-b border-gray-100 text-left flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-text-primary">
                                                {group.acao?.titulo || "Ação não identificada"}
                                            </p>
                                            <p className="text-xs text-text-secondary">
                                                {group.acao?.data_evento ? formatDate(group.acao.data_evento) : "Sem data"} • {group.items.length} inscrito(s)
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-primary">
                                            {expandedAcaoId === acaoId ? "Ocultar" : "Ver inscrições"}
                                        </span>
                                    </button>
                                    {expandedAcaoId === acaoId && (
                                        <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-white text-left">
                                                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Voluntário</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Setor</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipo</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data Inscrição</th>
                                                    <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Presença</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {group.items.map((insc) => {
                                                    const colab = insc.colaboradores as unknown as {
                                                        id: string; nome: string; is_externo: boolean; setores: { nome: string };
                                                    };
                                                    const externoInfo = colab?.is_externo ? parseExternoName(colab.nome) : null;
                                                    const displayName = externoInfo ? externoInfo.name : (colab?.nome || "—");
                                                    const displaySetor = externoInfo ? externoInfo.unit : (colab?.setores?.nome || "—");
                                                    return (
                                                        <tr key={insc.id} className={`transition-colors ${insc.confirmado_presenca ? "bg-green-50" : "hover:bg-gray-50"}`}>
                                                            <td className="px-4 py-3"><span className="font-medium text-text-primary">{displayName}</span></td>
                                                            <td className="px-4 py-3 text-sm text-text-secondary">{displaySetor}</td>
                                                            <td className="px-4 py-3">
                                                                {colab?.is_externo ? (
                                                                    <span className="badge badge-warning">Externo</span>
                                                                ) : (
                                                                    <span className="badge badge-success">Interno</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(insc.created_at)}</td>
                                                            <td className="px-4 py-3 text-center">
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
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// AdminPage sem proteção temporariamente para fase de testes
function AdminPage() {
    return <NovoProjetoAdminContent />;
}

export default function AdminPageWithAuth() {
    return (
        <AuthProvider>
            <AdminPage />
        </AuthProvider>
    );
}
