"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Colaborador, DataProjeto, Inscricao, Projeto, Setor } from "@/lib/types";
import { apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { Table, Th, Td } from "@/components/ui/table";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProjectPickerModal } from "@/app/admin/components/project-picker-modal";
import { InscricoesGroupedTable } from "@/app/admin/components/inscricoes-grouped-table";

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
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
            <path d="M8 2v4" />
            <path d="M16 2v4" />
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

function ClipboardListIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

type ProjetoDataDraft = { data_evento: string; vagas_limite: number };
type EditProjetoDataDraft = {
    id?: string;
    data_evento: string;
    vagas_limite: number;
    ativo: boolean;
    markedForDelete?: boolean;
};

export default function NovoProjetoAdminContent() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);

    const [setores, setSetores] = useState<Setor[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [projetos, setProjetos] = useState<Projeto[]>([]);
    const [datasProjetos, setDatasProjetos] = useState<DataProjeto[]>([]);
    const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
    const [confirmedParticipantIds, setConfirmedParticipantIds] = useState<string[]>([]);

    const [selectedDataProjetoId, setSelectedDataProjetoId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showProjetoPicker, setShowProjetoPicker] = useState(false);
    const [showEditProjetoForm, setShowEditProjetoForm] = useState(false);
    const [editProjetoError, setEditProjetoError] = useState<string | null>(null);
    const [deleteConfirmProjetoId, setDeleteConfirmProjetoId] = useState<string | null>(null);
    const [expandedProjetoId, setExpandedProjetoId] = useState<string | null>(null);

    const [filterTipo, setFilterTipo] = useState<"todos" | "sede" | "externos">("todos");
    const [filterStatus, setFilterStatus] = useState<"todas" | "realizadas" | "nao_realizadas">("todas");
    const [filterMonth, setFilterMonth] = useState<string>("");

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const [newProjeto, setNewProjeto] = useState<{
        titulo: string;
        descricao: string;
        vagas_limite_total: number;
        datas: ProjetoDataDraft[];
    }>({
        titulo: "",
        descricao: "",
        vagas_limite_total: 0,
        datas: [{ data_evento: "", vagas_limite: 0 }],
    });
    const [editProjeto, setEditProjeto] = useState<{
        id: string;
        titulo: string;
        descricao: string;
        vagas_limite_total: number;
        ativo: boolean;
        datas: EditProjetoDataDraft[];
    }>({
        id: "",
        titulo: "",
        descricao: "",
        vagas_limite_total: 0,
        ativo: true,
        datas: [],
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function parseExternoName(nome: string): { name: string; unit: string } {
        const match = nome.match(/^(.+?)\s*\((.+)\)$/);
        if (match) return { name: match[1].trim(), unit: match[2].trim() };
        return { name: nome, unit: "—" };
    }

    function toDateTimeLocalValue(dateStr: string): string {
        const d = new Date(dateStr);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    async function fetchSetores() {
        try {
            const data = await apiJson<Setor[]>("setores/?ordering=nome", { auth: true });
            setSetores(data);
        } catch {
            setSetores([]);
        }
    }

    async function fetchColaboradores() {
        try {
            const data = await apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: true });
            setColaboradores(data);
        } catch {
            setColaboradores([]);
        }
    }

    async function fetchProjetos() {
        try {
            const data = await apiJson<Projeto[]>("projetos/?ordering=-created_at", { auth: true });
            setProjetos(data);
        } catch {
            setProjetos([]);
        }
    }

    async function fetchDatasProjetos() {
        try {
            const data = await apiJson<DataProjeto[]>("datas_projeto/?ordering=data_evento", { auth: true });
            setDatasProjetos(data);
        } catch {
            setDatasProjetos([]);
        }
    }

    async function fetchInscricoes(dataProjetoId?: string) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ ordering: "-created_at" });
            if (dataProjetoId) params.set("data_projeto_id", dataProjetoId);
            const data = await apiJson<Inscricao[]>(`inscricoes/?${params.toString()}`, { auth: true });
            setInscricoes(data);
        } catch {
            setInscricoes([]);
        }
        setLoading(false);
    }

    async function fetchConfirmedParticipationIds() {
        try {
            const data = await apiJson<Inscricao[]>("inscricoes/?confirmado_presenca=true&ordering=-created_at", { auth: true });
            const ids = Array.from(new Set(data.map((i) => i.colaborador_id).filter(Boolean)));
            setConfirmedParticipantIds(ids);
        } catch {
            setConfirmedParticipantIds([]);
        }
    }

    function getFilteredInscricoes() {
        return inscricoes.filter((insc) => {
            const colab = insc.colaboradores as unknown as { is_externo: boolean; setor_id: string | null; nome: string; setores?: { nome: string } | null };

            if (filterTipo !== "todos") {
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

    async function togglePresenca(inscricaoId: string, current: boolean) {
        try {
            await apiJson(`inscricoes/${inscricaoId}/`, {
                method: "PATCH",
                body: JSON.stringify({ confirmado_presenca: !current }),
                auth: true,
            });
            setInscricoes((prev) => prev.map((i) => (i.id === inscricaoId ? { ...i, confirmado_presenca: !current } : i)));
            await fetchConfirmedParticipationIds();
        } catch (e) {
            console.error(formatApiError(e));
        }
    }

    async function handleResetParticipacoes() {
        const ok = window.confirm("Tem certeza que deseja resetar todas as participações confirmadas?");
        if (!ok) return;

        try {
            await apiJson("inscricoes/reset_participacoes/", {
                method: "POST",
                body: JSON.stringify({}),
                auth: true,
            });
            await fetchInscricoes(selectedDataProjetoId || undefined);
            await fetchConfirmedParticipationIds();
        } catch (e) {
            console.error("Erro ao resetar participações:", formatApiError(e));
            alert("Não foi possível resetar participações.");
        }
    }

    async function handleCreateProjeto(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        if (!newProjeto.titulo.trim()) {
            setFormError("Informe o nome do projeto.");
            return;
        }
        if (!newProjeto.vagas_limite_total || newProjeto.vagas_limite_total <= 0) {
            setFormError("Informe `vagas_limite_total` do projeto.");
            return;
        }
        if (newProjeto.datas.length === 0) {
            setFormError("Adicione pelo menos 1 data/horário.");
            return;
        }

        const cleanedDatas = newProjeto.datas
            .map((d) => ({ data_evento: d.data_evento, vagas_limite: Number(d.vagas_limite) }))
            .filter((d) => d.data_evento && Number.isFinite(d.vagas_limite) && d.vagas_limite > 0);

        if (cleanedDatas.length === 0) {
            setFormError("Adicione datas/horários válidos com `vagas_limite` > 0.");
            return;
        }

        const soma = cleanedDatas.reduce((acc, d) => acc + d.vagas_limite, 0);
        if (soma !== newProjeto.vagas_limite_total) {
            setFormError(`A soma das vagas por data (${soma}) precisa ser igual ao limite global (${newProjeto.vagas_limite_total}).`);
            return;
        }

        try {
            const created = await apiJson<Projeto>("projetos/", {
                method: "POST",
                body: JSON.stringify({
                    titulo: newProjeto.titulo.trim(),
                    descricao: newProjeto.descricao.trim() ? newProjeto.descricao.trim() : null,
                    vagas_limite: newProjeto.vagas_limite_total,
                    ativo: true,
                }),
                auth: true,
            });

            await Promise.all(
                cleanedDatas.map((d) =>
                    apiJson<DataProjeto>("datas_projeto/", {
                        method: "POST",
                        body: JSON.stringify({
                            projeto_id: created.id,
                            data_evento: d.data_evento,
                            vagas_limite: d.vagas_limite,
                            ativo: true,
                        }),
                        auth: true,
                    }),
                ),
            );
        } catch (e) {
            console.error("Erro ao criar projeto:", formatApiError(e));
            setFormError("Erro ao criar projeto. Verifique o console.");
            return;
        }

        setShowCreateForm(false);
        setFormError(null);
        setNewProjeto({ titulo: "", descricao: "", vagas_limite_total: 0, datas: [{ data_evento: "", vagas_limite: 0 }] });
        await fetchProjetos();
        await fetchDatasProjetos();
        setSelectedDataProjetoId("");
        await fetchInscricoes();
    }

    async function handleDeleteProjeto(projetoId: string) {
        try {
            await apiJson(`projetos/${projetoId}/`, { method: "DELETE", auth: true });
        } catch (e) {
            console.error("Erro ao excluir projeto:", formatApiError(e));
            return;
        }

        setDeleteConfirmProjetoId(null);
        if (selectedDataProjetoId) setSelectedDataProjetoId("");
        await fetchProjetos();
        await fetchDatasProjetos();
        await fetchInscricoes();
    }

    async function toggleAtivoProjeto(projeto: Projeto) {
        try {
            await apiJson(`projetos/${projeto.id}/`, {
                method: "PATCH",
                body: JSON.stringify({ ativo: !projeto.ativo }),
                auth: true,
            });
            fetchProjetos();
        } catch (e) {
            console.error(formatApiError(e));
        }
    }

    function openEditProjetoForm(projeto: Projeto) {
        const datasDoProjeto = datasProjetos
            .filter((d) => d.projeto_id === projeto.id)
            .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
            .map((d) => ({
                id: d.id,
                data_evento: toDateTimeLocalValue(d.data_evento),
                vagas_limite: d.vagas_limite,
                ativo: d.ativo,
            }));
        setEditProjeto({
            id: projeto.id,
            titulo: projeto.titulo || "",
            descricao: projeto.descricao || "",
            vagas_limite_total: projeto.vagas_limite || 0,
            ativo: projeto.ativo,
            datas: datasDoProjeto,
        });
        setEditProjetoError(null);
        setShowProjetoPicker(false);
        setShowEditProjetoForm(true);
    }

    async function handleUpdateProjeto(e: React.FormEvent) {
        e.preventDefault();
        setEditProjetoError(null);
        if (!editProjeto.id) {
            setEditProjetoError("Selecione um projeto para editar.");
            return;
        }
        if (!editProjeto.titulo.trim()) {
            setEditProjetoError("Informe o nome do projeto.");
            return;
        }
        if (!editProjeto.vagas_limite_total || editProjeto.vagas_limite_total <= 0) {
            setEditProjetoError("Informe o limite de vagas global.");
            return;
        }
        const activeDatas = editProjeto.datas.filter((d) => !d.markedForDelete);
        if (activeDatas.length === 0) {
            setEditProjetoError("Adicione pelo menos 1 ação (data/horário) no projeto.");
            return;
        }
        const invalidData = activeDatas.find((d) => !d.data_evento || !d.vagas_limite || d.vagas_limite <= 0);
        if (invalidData) {
            setEditProjetoError("Todas as ações ativas devem ter data/hora e vagas > 0.");
            return;
        }
        const somaVagas = activeDatas.reduce((acc, d) => acc + (Number(d.vagas_limite) || 0), 0);
        if (somaVagas !== editProjeto.vagas_limite_total) {
            setEditProjetoError(`A soma das vagas das ações (${somaVagas}) deve ser igual ao limite global (${editProjeto.vagas_limite_total}).`);
            return;
        }

        try {
            await apiJson(`projetos/${editProjeto.id}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    titulo: editProjeto.titulo.trim(),
                    descricao: editProjeto.descricao.trim() ? editProjeto.descricao.trim() : null,
                    vagas_limite: editProjeto.vagas_limite_total,
                    ativo: editProjeto.ativo,
                }),
                auth: true,
            });

            const requests: Promise<unknown>[] = [];
            editProjeto.datas.forEach((d) => {
                if (d.id && d.markedForDelete) {
                    requests.push(apiJson(`datas_projeto/${d.id}/`, { method: "DELETE", auth: true }));
                    return;
                }
                if (d.id) {
                    requests.push(
                        apiJson(`datas_projeto/${d.id}/`, {
                            method: "PATCH",
                            body: JSON.stringify({
                                data_evento: d.data_evento,
                                vagas_limite: d.vagas_limite,
                                ativo: d.ativo,
                            }),
                            auth: true,
                        }),
                    );
                    return;
                }
                if (!d.markedForDelete) {
                    requests.push(
                        apiJson("datas_projeto/", {
                            method: "POST",
                            body: JSON.stringify({
                                projeto_id: editProjeto.id,
                                data_evento: d.data_evento,
                                vagas_limite: d.vagas_limite,
                                ativo: d.ativo,
                            }),
                            auth: true,
                        }),
                    );
                }
            });
            await Promise.all(requests);

            setShowEditProjetoForm(false);
            await fetchProjetos();
            await fetchDatasProjetos();
            await fetchInscricoes(selectedDataProjetoId || undefined);
        } catch (e) {
            setEditProjetoError(formatApiError(e));
        }
    }

    const selectedDataProjeto = useMemo(() => datasProjetos.find((d) => d.id === selectedDataProjetoId), [datasProjetos, selectedDataProjetoId]);
    const selectedProjeto = useMemo(() => selectedDataProjeto?.projetos, [selectedDataProjeto]);
    const naoParticiparam = useMemo(() => {
        const confirmedIds = new Set(confirmedParticipantIds);
        return colaboradores.filter((c) => !confirmedIds.has(c.id));
    }, [colaboradores, confirmedParticipantIds]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/admin/login");
            return;
        }
        if (!getStoredAccessToken()) return;
        (async () => {
            await fetchProjetos();
            await fetchDatasProjetos();
            await fetchSetores();
            await fetchColaboradores();
            await fetchConfirmedParticipationIds();
        })();
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            await fetchInscricoes(selectedDataProjetoId || undefined);
            setExpandedProjetoId(null);
        })();
    }, [selectedDataProjetoId, user]);

    const totalInscritos = inscricoes.length;
    const totalConfirmados = inscricoes.filter((i) => i.confirmado_presenca).length;

    const monthName = currentMonthDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

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

    const calendarDays: Array<Date | null> = [];
    for (let i = 0; i < firstDayOfMonth; i += 1) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i += 1) calendarDays.push(new Date(year, month, i));

    const now = new Date();
    const filteredDatasByStatus = datasProjetos.filter((d) => {
        if (filterStatus === "todas") return true;
        const eventDate = new Date(d.data_evento);
        if (filterStatus === "realizadas") return eventDate < now;
        return eventDate >= now;
    });

    const datasByDate: Record<string, DataProjeto[]> = {};
    filteredDatasByStatus.forEach((d) => {
        const dStr = new Date(d.data_evento).toISOString().split("T")[0];
        if (!datasByDate[dStr]) datasByDate[dStr] = [];
        datasByDate[dStr].push(d);
    });

    const monthOptions: { value: string; label: string }[] = [];
    const uniqueMonths = new Set<string>();
    inscricoes.forEach((insc) => {
        const d = new Date(insc.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!uniqueMonths.has(key)) {
            uniqueMonths.add(key);
            monthOptions.push({
                value: key,
                label: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            });
        }
    });
    monthOptions.sort((a, b) => b.value.localeCompare(a.value));

    const filteredInscricoes = getFilteredInscricoes();
    const groupedInscricoesByProjeto = useMemo(() => {
        const grouped = filteredInscricoes.reduce((acc, insc) => {
            const projeto = insc.projetos as Projeto | undefined;
            const key = projeto?.id || insc.projeto_id;
            if (!acc[key]) acc[key] = { projeto, items: [] as Inscricao[] };
            acc[key].items.push(insc);
            return acc;
        }, {} as Record<string, { projeto?: Projeto; items: Inscricao[] }>);

        return Object.entries(grouped).sort(([, a], [, b]) => {
            const aName = a.projeto?.titulo || "";
            const bName = b.projeto?.titulo || "";
            return aName.localeCompare(bName);
        });
    }, [filteredInscricoes]);

    function exportCSV() {
        const source = filteredInscricoes;
        if (source.length === 0) return;

        const selectedProjetoTitulo = selectedProjeto?.titulo || "";
        const selectedDataEvento = selectedDataProjeto?.data_evento || "";
        const dateSlug = new Date().toISOString().split("T")[0];

        const headers = ["Projeto", "Data/Hora Evento", "Voluntario", "Setor", "Tipo", "Data Inscricao", "Presenca Confirmada"];
        const rows = source.map((insc) => {
            const colab = insc.colaboradores as unknown as Colaborador | undefined;

            const projetoTitulo = insc.projetos?.titulo || "—";
            const dataEvento = insc.datas_projeto?.data_evento ? new Date(insc.datas_projeto.data_evento).toLocaleString("pt-BR") : "—";

            let displayName = colab?.nome || "—";
            let displaySetor = colab?.setores?.nome || "—";
            if (colab?.is_externo) {
                const extInfo = parseExternoName(colab.nome);
                displayName = extInfo.name;
                displaySetor = extInfo.unit;
            }

            const tipo = colab?.is_externo ? "Externo" : "Interno";
            const dataInscricao = new Date(insc.created_at).toLocaleString("pt-BR");
            const presencia = insc.confirmado_presenca ? "Sim" : "Não";

            return [projetoTitulo, dataEvento, displayName, displaySetor, tipo, dataInscricao, presencia];
        });

        const escapeCsvCell = (value: string) => value.replace(/"/g, '""').trim();
        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${escapeCsvCell(String(cell))}"`).join(";"))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        const projetoSlug = selectedProjetoTitulo ? selectedProjetoTitulo.replace(/\s+/g, "_") : "todas_os_projetos";
        const eventoSlug = selectedDataEvento ? selectedDataEvento.split("T")[0] : "todas_as_datas";
        link.href = url;
        link.download = `presencas_${projetoSlug}_${eventoSlug}_${dateSlug}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    async function handleSignOut() {
        await signOut();
        router.push("/admin/login");
    }

    return (
        <WorkspaceShell
            title="Painel de Administração"
            subtitle="Gerencie projetos, datas/horários e presenças."
            navItems={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/admin", label: "Admin" },
                { href: "/inscricao", label: "Inscrição" },
            ]}
            rightSlot={
                <div className="flex items-center gap-2">
                    {mounted ? (
                        <span className="hidden text-xs text-slate-300 md:inline">{user?.username}</span>
                    ) : null}
                    <Button onClick={handleSignOut} variant="outline" size="sm" leftIcon={<LogOutIcon />}>
                        Sair
                    </Button>
                </div>
            }
        >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white">Gestão operacional</h2>
                        <p className="text-slate-300 text-sm">Projetos, metas de vagas, inscrições e confirmação de presença.</p>
                        <div className="mt-3 flex items-center gap-2">
                            <Link href="/admin/setores" className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                Setores
                            </Link>
                            <Link href="/admin/colaboradores" className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                Colaboradores
                            </Link>
                            <Link href="/admin/metas" className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                Metas por Setor
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProjetoPicker((prev) => !prev)}
                            title="Selecionar projeto para alterar"
                        >
                            Alterar Projeto
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetParticipacoes}
                        >
                            Resetar participações
                        </Button>
                        <Button
                            leftIcon={showCreateForm ? <CloseIcon /> : <PlusIcon />}
                            onClick={() => {
                                setShowCreateForm(!showCreateForm);
                                setFormError(null);
                            }}
                        >
                            {showCreateForm ? "Fechar" : "Novo Projeto"}
                        </Button>
                    </div>
                </div>

                {showCreateForm && (
                    <Card className="mb-8 animate-fade-in-up">
                        <h2 className="font-bold text-lg mb-4">Novo Projeto</h2>
                        {formError && (
                            <Alert tone="error" className="mb-4">{formError}</Alert>
                        )}
                        <form onSubmit={handleCreateProjeto} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Nome do projeto *"
                                    placeholder="Ex: Campanha do Agasalho"
                                    value={newProjeto.titulo}
                                    onChange={(e) => setNewProjeto({ ...newProjeto, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Limite de vagas global *"
                                    type="number"
                                    min={1}
                                    value={newProjeto.vagas_limite_total || 0}
                                    onChange={(e) => setNewProjeto({ ...newProjeto, vagas_limite_total: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Descrição"
                                    placeholder="Descrição breve"
                                    value={newProjeto.descricao}
                                    onChange={(e) => setNewProjeto({ ...newProjeto, descricao: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-text-secondary">
                                        Datas e horários * (soma das vagas deve bater com o total)
                                    </label>
                                    <Button
                                        type="button"
                                        onClick={() => setNewProjeto((prev) => ({ ...prev, datas: [...prev.datas, { data_evento: "", vagas_limite: 0 }] }))}
                                        variant="outline"
                                        size="sm"
                                    >
                                        + Adicionar data
                                    </Button>
                                </div>

                                <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-100">
                                    {newProjeto.datas.map((d, idx) => (
                                        <div key={idx} className="grid md:grid-cols-3 gap-3 items-end">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-semibold text-text-secondary mb-1">Data e Hora</label>
                                                <Input
                                                    type="datetime-local"
                                                    value={d.data_evento}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        setNewProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            datas[idx] = { ...datas[idx], data_evento: v };
                                                            return { ...prev, datas };
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-text-secondary mb-1">Vagas *</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={d.vagas_limite || 0}
                                                    onChange={(e) => {
                                                        const v = parseInt(e.target.value) || 0;
                                                        setNewProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            datas[idx] = { ...datas[idx], vagas_limite: v };
                                                            return { ...prev, datas };
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    disabled={newProjeto.datas.length <= 1}
                                                    onClick={() => {
                                                        setNewProjeto((prev) => {
                                                            const datas = prev.datas.filter((_, i) => i !== idx);
                                                            return { ...prev, datas };
                                                        });
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="text-xs text-text-secondary">
                                        Soma atual:{" "}
                                        <span className="font-semibold text-text-primary">
                                            {newProjeto.datas.reduce((acc, d) => acc + (Number(d.vagas_limite) || 0), 0)}
                                        </span>{" "}
                                        / {newProjeto.vagas_limite_total || 0}
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Button type="submit">
                                    Criar Projeto
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                <Modal
                    open={!!deleteConfirmProjetoId}
                    title="Confirmar exclusão"
                    onClose={() => setDeleteConfirmProjetoId(null)}
                >
                    <p className="mb-4 text-sm text-slate-700">
                        Excluir este projeto? Todas as datas e inscrições vinculadas serão removidas.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={() => deleteConfirmProjetoId && handleDeleteProjeto(deleteConfirmProjetoId)} variant="danger">
                            Sim, excluir
                        </Button>
                        <Button onClick={() => setDeleteConfirmProjetoId(null)} variant="outline">
                            Cancelar
                        </Button>
                    </div>
                </Modal>

                {showEditProjetoForm && (
                    <div className="card mb-6 animate-fade-in-up border border-primary/25">
                        <h2 className="font-bold text-lg mb-4">Editar Projeto</h2>
                        {editProjetoError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm rounded">{editProjetoError}</div>
                        )}
                        <form onSubmit={handleUpdateProjeto} className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome do projeto *</label>
                                <input
                                    className="input-field"
                                    value={editProjeto.titulo}
                                    onChange={(e) => setEditProjeto((prev) => ({ ...prev, titulo: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Limite de vagas global *</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="input-field"
                                    value={editProjeto.vagas_limite_total || 0}
                                    onChange={(e) => setEditProjeto((prev) => ({ ...prev, vagas_limite_total: parseInt(e.target.value, 10) || 0 }))}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                                <input
                                    className="input-field"
                                    value={editProjeto.descricao}
                                    onChange={(e) => setEditProjeto((prev) => ({ ...prev, descricao: e.target.value }))}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="inline-flex items-center gap-2 text-sm text-text-primary">
                                    <input
                                        type="checkbox"
                                        checked={editProjeto.ativo}
                                        onChange={(e) => setEditProjeto((prev) => ({ ...prev, ativo: e.target.checked }))}
                                    />
                                    Projeto ativo
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-text-secondary">Ações (datas e horários)</label>
                                    <button
                                        type="button"
                                        className="btn btn-outline text-xs py-1.5 px-3 min-h-0"
                                        onClick={() =>
                                            setEditProjeto((prev) => ({
                                                ...prev,
                                                datas: [...prev.datas, { data_evento: "", vagas_limite: 0, ativo: true }],
                                            }))
                                        }
                                    >
                                        + Adicionar ação
                                    </button>
                                </div>
                                <div className="space-y-2 bg-gray-50 border border-gray-100 rounded p-3">
                                    {editProjeto.datas.map((d, idx) => (
                                        <div key={d.id || `new-${idx}`} className={`grid md:grid-cols-6 gap-2 items-end ${d.markedForDelete ? "opacity-50" : ""}`}>
                                            <div className="md:col-span-3">
                                                <label className="block text-[11px] font-semibold text-text-secondary mb-1">Data e Hora</label>
                                                <input
                                                    type="datetime-local"
                                                    className="input-field"
                                                    value={d.data_evento}
                                                    disabled={!!d.markedForDelete}
                                                    onChange={(e) =>
                                                        setEditProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            datas[idx] = { ...datas[idx], data_evento: e.target.value };
                                                            return { ...prev, datas };
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-text-secondary mb-1">Vagas</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className="input-field"
                                                    value={d.vagas_limite}
                                                    disabled={!!d.markedForDelete}
                                                    onChange={(e) =>
                                                        setEditProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            datas[idx] = { ...datas[idx], vagas_limite: parseInt(e.target.value, 10) || 0 };
                                                            return { ...prev, datas };
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-text-secondary mb-1">Status</label>
                                                <select
                                                    className="input-field"
                                                    value={d.ativo ? "ativo" : "inativo"}
                                                    disabled={!!d.markedForDelete}
                                                    onChange={(e) =>
                                                        setEditProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            datas[idx] = { ...datas[idx], ativo: e.target.value === "ativo" };
                                                            return { ...prev, datas };
                                                        })
                                                    }
                                                >
                                                    <option value="ativo">Ativa</option>
                                                    <option value="inativo">Inativa</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline text-xs py-1.5 px-3 min-h-0 w-full"
                                                    onClick={() =>
                                                        setEditProjeto((prev) => {
                                                            const datas = [...prev.datas];
                                                            if (datas[idx].id) {
                                                                datas[idx] = { ...datas[idx], markedForDelete: !datas[idx].markedForDelete };
                                                            } else {
                                                                datas.splice(idx, 1);
                                                            }
                                                            return { ...prev, datas };
                                                        })
                                                    }
                                                >
                                                    {d.id ? (d.markedForDelete ? "Desfazer" : "Excluir") : "Remover"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-xs text-text-secondary">
                                        Soma atual das ações ativas:{" "}
                                        <span className="font-semibold text-text-primary">
                                            {editProjeto.datas.filter((d) => !d.markedForDelete).reduce((acc, d) => acc + (Number(d.vagas_limite) || 0), 0)}
                                        </span>{" "}
                                        / {editProjeto.vagas_limite_total}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex items-center gap-2">
                                <button type="submit" className="btn btn-primary">Salvar alterações</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowEditProjetoForm(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}

                <ProjectPickerModal
                    open={showProjetoPicker}
                    projetos={projetos}
                    datasProjetos={datasProjetos}
                    onClose={() => setShowProjetoPicker(false)}
                    onSelectProject={openEditProjetoForm}
                />

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2 card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                                    Calendário de Datas do Projeto
                                    {selectedDataProjetoId && (
                                        <button
                                            onClick={() => setSelectedDataProjetoId("")}
                                            className="text-[10px] text-primary hover:underline font-normal bg-primary/10 px-2 py-0.5 rounded-full"
                                        >
                                            Limpar Seleção ✖
                                        </button>
                                    )}
                                </label>
                                <div className="flex bg-gray-100 p-0.5 rounded-md">
                                    <button
                                        onClick={() => setFilterStatus("todas")}
                                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "todas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Todas
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("realizadas")}
                                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "realizadas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Realizadas
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("nao_realizadas")}
                                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${filterStatus === "nao_realizadas" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Futuras
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="p-1 text-gray-400 hover:text-primary">
                                    <ChevronLeftIcon />
                                </button>
                                <span className="text-sm font-bold capitalize w-32 text-center">{monthName}</span>
                                <button onClick={nextMonth} className="p-1 text-gray-400 hover:text-primary">
                                    <ChevronRightIcon />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                                <div key={d} className="font-semibold text-gray-400">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((dateObj, i) => {
                                if (!dateObj) return <div key={`empty-${i}`} className="p-2" />;

                                const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
                                const dStr = localDate.toISOString().split("T")[0];
                                const dayDatas = datasByDate[dStr] || [];

                                const hasData = dayDatas.length > 0;
                                const isSelected = hasData && dayDatas.some((d) => d.id === selectedDataProjetoId);
                                const allInactive = hasData && dayDatas.every((d) => !d.ativo);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (hasData) setSelectedDataProjetoId(isSelected ? "" : dayDatas[0].id);
                                        }}
                                        disabled={!hasData}
                                        className={`p-2 text-sm rounded transition-all flex flex-col items-center justify-center
                                            ${isSelected ? "bg-primary text-white font-bold shadow-md" : allInactive ? "bg-gray-100 text-gray-400 line-through opacity-60" : hasData ? "bg-primary/10 text-primary font-bold hover:bg-primary/20 border border-primary/20" : "text-gray-400 hover:bg-gray-50"}`}
                                    >
                                        <span>{dateObj.getDate()}</span>
                                        {hasData && <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : allInactive ? "bg-gray-400" : "bg-primary"}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4">
                        {selectedDataProjetoId && selectedDataProjeto ? (
                            <div className="card h-full flex flex-col animate-fade-in-up border-l-4 border-l-primary">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1 block">Data Selecionada</span>
                                    <h3 className="text-xl font-black text-text-primary leading-tight">{selectedProjeto?.titulo || "Projeto"}</h3>
                                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                                        <CalendarIcon /> {formatDate(selectedDataProjeto.data_evento)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gray-50 p-3 rounded text-center">
                                        <p className="text-2xl font-black text-primary">{totalInscritos}</p>
                                        <p className="text-[10px] text-text-secondary font-medium">Inscritos / {selectedDataProjeto.vagas_limite} Limite</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded text-center">
                                        <p className="text-2xl font-black text-success">{totalConfirmados}</p>
                                        <p className="text-[10px] text-green-700 font-medium">Presenças Confirmadas</p>
                                    </div>
                                </div>

                                {selectedDataProjeto.vagas_por_setor && Object.keys(selectedDataProjeto.vagas_por_setor).length > 0 && (
                                    <div className="mb-4 flex-1">
                                        <p className="text-xs font-semibold text-text-secondary mb-2">Vagas por Setor</p>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                            {Object.entries(selectedDataProjeto.vagas_por_setor as Record<string, number>).map(([setId, limit]) => {
                                                const setorNome = setores.find((s) => s.id === setId)?.nome || "Setor Removido";
                                                const used = inscricoes.filter((insc) => {
                                                    const colab = insc.colaboradores as unknown as { is_externo: boolean; setor_id: string | null; nome: string; setores?: { nome: string } | null } | undefined;
                                                    if (!colab) return false;
                                                    if (!colab.is_externo && colab.setor_id === setId) return true;
                                                    if (colab.is_externo) {
                                                        const extInfo = parseExternoName(colab.nome);
                                                        return extInfo.unit === setorNome;
                                                    }
                                                    return false;
                                                }).length;

                                                return (
                                                    <div key={setId} className="bg-white border border-gray-100 rounded p-2 flex justify-between items-center shadow-sm">
                                                        <span className="text-[10px] text-text-secondary font-medium truncate pr-2 w-3/4" title={setorNome}>
                                                            {setorNome}
                                                        </span>
                                                        <span className={`text-[10px] font-bold ${used >= limit ? "text-error" : "text-primary"}`}>
                                                            {used}/{limit}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-3 mt-auto border-t border-gray-100">
                                    {selectedProjeto && (
                                        <button
                                            onClick={() => openEditProjetoForm(selectedProjeto)}
                                            className="btn min-h-0 py-1.5 px-3 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 flex-1"
                                        >
                                            Editar Projeto
                                        </button>
                                    )}
                                    {selectedProjeto && (
                                        <button
                                            onClick={() => toggleAtivoProjeto(selectedProjeto)}
                                            className={`btn min-h-0 py-1.5 px-3 text-xs flex-1 border flex items-center justify-center gap-1 ${
                                                selectedProjeto.ativo ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                            }`}
                                        >
                                            {selectedProjeto.ativo ? "Desativar Projeto" : "Ativar Projeto"}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => selectedProjeto && setDeleteConfirmProjetoId(selectedProjeto.id)}
                                        className="btn min-h-0 py-1.5 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 border-error flex items-center justify-center gap-1 flex-shrink-0"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card h-full flex flex-col justify-center animate-fade-in-up">
                                <div className="text-center mb-6">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block">Visão Geral</span>
                                    <h3 className="text-lg font-bold text-text-primary">Todas as Datas</h3>
                                    <p className="text-xs text-text-secondary mt-1">Selecione uma data/horário no calendário para ver detalhes.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">
                                        <div className="w-10 h-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
                                            <ClipboardListIcon />
                                        </div>
                                        <p className="text-3xl font-black text-primary">{totalInscritos}</p>
                                        <p className="text-xs text-text-secondary font-medium">Inscritos Globais</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center">
                                        <div className="w-10 h-10 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center mb-2">
                                            <CheckCircleIcon />
                                        </div>
                                        <p className="text-3xl font-black text-success">{totalConfirmados}</p>
                                        <p className="text-xs text-text-secondary font-medium">Presenças Globais</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Card className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-text-primary">Ainda não participaram de nenhuma ação</h2>
                        <span className="text-xs text-text-secondary">{naoParticiparam.length} colaborador(es)</span>
                    </div>
                    {naoParticiparam.length === 0 ? (
                        <p className="text-sm text-text-secondary">Todos os colaboradores já possuem pelo menos uma presença confirmada.</p>
                    ) : (
                        <div className="max-h-48 overflow-y-auto">
                            <Table>
                                <thead>
                                    <tr className="text-left">
                                        <Th>Nome</Th>
                                        <Th>Setor</Th>
                                        <Th>Tipo</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {naoParticiparam.map((c) => (
                                        <tr key={c.id}>
                                            <Td className="text-text-primary">{c.nome}</Td>
                                            <Td className="text-text-secondary">{c.setores?.nome || "—"}</Td>
                                            <Td>{c.is_externo ? <span className="badge badge-warning">Externo</span> : <span className="badge badge-success">Interno</span>}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card>

                <div className="card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="font-bold text-text-primary">
                                {selectedDataProjeto ? `Inscritos: ${selectedProjeto?.titulo || "Projeto"}` : "Lista de Inscritos - Todas as datas"}
                            </h2>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button onClick={() => setFilterTipo("todos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "todos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                                    Todos
                                </button>
                                <button onClick={() => setFilterTipo("sede")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "sede" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                                    Sede
                                </button>
                                <button onClick={() => setFilterTipo("externos")} className={`px-3 py-1 text-xs font-medium rounded ${filterTipo === "externos" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                                    Externos
                                </button>
                            </div>
                            <select className="text-xs border border-gray-200 rounded px-2 py-1.5 text-text-secondary bg-white" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                <option value="">Todos os meses</option>
                                {monthOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {filteredInscricoes.length > 0 && (
                            <Button onClick={exportCSV} variant="outline" size="sm" leftIcon={<DownloadIcon />} className="ml-auto sm:ml-0">
                                Exportar CSV
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="animate-spin w-6 h-6 border-2 border-primary/30 border-t-primary mx-auto mb-3" />
                            Carregando...
                        </div>
                    ) : selectedDataProjetoId && selectedDataProjeto ? (
                        <Table>
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <Th className="px-6">Voluntário</Th>
                                        <Th className="px-6">Setor</Th>
                                        <Th className="px-6">Tipo</Th>
                                        <Th className="px-6">Data Inscrição</Th>
                                        <Th className="px-6">Data Evento</Th>
                                        <Th className="px-6 text-center">Presença</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredInscricoes.map((insc) => {
                                        const colab = insc.colaboradores as unknown as { is_externo: boolean; nome: string; setores?: { nome: string } | null };
                                        const externoInfo = colab?.is_externo ? parseExternoName(colab.nome) : null;
                                        const displayName = externoInfo ? externoInfo.name : colab?.nome || "—";
                                        const displaySetor = externoInfo ? externoInfo.unit : colab?.setores?.nome || "—";
                                        return (
                                            <tr key={insc.id} className={`transition-colors ${insc.confirmado_presenca ? "bg-green-50" : "hover:bg-gray-50"}`}>
                                                <Td className="px-6 py-4">
                                                    <span className="font-medium text-text-primary">{displayName}</span>
                                                </Td>
                                                <Td className="px-6 py-4 text-sm text-text-secondary">{displaySetor}</Td>
                                                <Td className="px-6 py-4">
                                                    {colab?.is_externo ? <span className="badge badge-warning">Externo</span> : <span className="badge badge-success">Interno</span>}
                                                </Td>
                                                <Td className="px-6 py-4 text-sm text-text-secondary">{formatDate(insc.created_at)}</Td>
                                                <Td className="px-6 py-4 text-sm text-text-secondary">{selectedDataProjeto ? formatDate(selectedDataProjeto.data_evento) : "—"}</Td>
                                                <Td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => togglePresenca(insc.id, insc.confirmado_presenca)}
                                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${insc.confirmado_presenca ? "bg-primary" : "bg-gray-300"}`}
                                                        title={insc.confirmado_presenca ? "Presença confirmada" : "Confirmar presença"}
                                                    >
                                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${insc.confirmado_presenca ? "translate-x-6" : "translate-x-0"}`} />
                                                    </button>
                                                </Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                        </Table>
                    ) : filteredInscricoes.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="mx-auto mb-3 text-text-secondary/40">
                                <ClipboardListIcon />
                            </div>
                            <p>Nenhuma inscrição encontrada.</p>
                        </div>
                    ) : (
                        <InscricoesGroupedTable
                            groups={groupedInscricoesByProjeto}
                            expandedProjetoId={expandedProjetoId}
                            onToggleExpand={(id) => setExpandedProjetoId((prev) => (prev === id ? null : id))}
                            onTogglePresenca={togglePresenca}
                            formatDate={formatDate}
                            parseExternoName={parseExternoName}
                        />
                    )}
                </div>
        </WorkspaceShell>
    );
}

