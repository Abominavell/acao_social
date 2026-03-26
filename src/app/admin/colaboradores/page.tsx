"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import type { Colaborador, Setor } from "@/lib/types";

export default function ColaboradoresPage() {
    const router = useRouter();
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [setorId, setSetorId] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [editCpf, setEditCpf] = useState("");
    const [editDataNascimento, setEditDataNascimento] = useState("");
    const [editSetorId, setEditSetorId] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importResult, setImportResult] = useState<string | null>(null);

    async function fetchBase() {
        try {
            const [cols, sets] = await Promise.all([
                apiJson<Colaborador[]>("colaboradores/?ordering=nome", { auth: true }),
                apiJson<Setor[]>("setores/?ordering=nome", { auth: true }),
            ]);
            setColaboradores(cols);
            setSetores(sets);
        } catch (e) {
            setError(formatApiError(e));
        }
    }

    useEffect(() => {
        if (!getStoredAccessToken()) {
            router.push("/admin/login");
            return;
        }
        fetchBase();
    }, [router]);

    async function criarColaborador(e: React.FormEvent) {
        e.preventDefault();
        if (!nome.trim() || !cpf.trim() || !dataNascimento || !setorId) {
            setError("Nome, CPF, data de nascimento e setor são obrigatórios.");
            return;
        }
        setError(null);
        try {
            await apiJson<Colaborador>("colaboradores/", {
                method: "POST",
                body: JSON.stringify({
                    nome: nome.trim(),
                    cpf: cpf.trim(),
                    data_nascimento: dataNascimento,
                    setor_id: setorId,
                    is_externo: false,
                }),
                auth: true,
            });
        } catch (e) {
            setError(formatApiError(e));
            return;
        }
        setNome("");
        setCpf("");
        setDataNascimento("");
        setSetorId("");
        fetchBase();
    }

    async function salvarEdicao(id: string) {
        if (!editNome.trim() || !editCpf.trim() || !editDataNascimento || !editSetorId) {
            setError("Nome, CPF, data de nascimento e setor são obrigatórios na edição.");
            return;
        }
        setError(null);
        try {
            await apiJson<Colaborador>(`colaboradores/${id}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    nome: editNome.trim(),
                    cpf: editCpf.trim(),
                    data_nascimento: editDataNascimento,
                    setor_id: editSetorId,
                    is_externo: false,
                }),
                auth: true,
            });
        } catch (e) {
            setError(formatApiError(e));
            return;
        }
        setEditId(null);
        setEditNome("");
        setEditCpf("");
        setEditDataNascimento("");
        setEditSetorId("");
        fetchBase();
    }

    async function excluirColaborador(id: string) {
        if (!window.confirm("Deseja excluir este colaborador?")) return;
        setError(null);
        try {
            await apiJson(`colaboradores/${id}/`, { method: "DELETE", auth: true });
        } catch (e) {
            setError(formatApiError(e));
            return;
        }
        fetchBase();
    }

    async function importarExcelColaboradores(e: React.FormEvent) {
        e.preventDefault();
        if (!importFile) {
            setError("Selecione um arquivo Excel para importar.");
            return;
        }
        setImportLoading(true);
        setError(null);
        setImportResult(null);
        try {
            const formData = new FormData();
            formData.append("file", importFile);
            const result = await apiJson<{ created: number; updated: number; skipped: number; deactivated: number }>("colaboradores/importar_excel/", {
                method: "POST",
                body: formData,
                auth: true,
            });
            setImportResult(`Importação concluída: ${result.created} criados, ${result.updated} atualizados, ${result.deactivated} desativados, ${result.skipped} ignorados.`);
            setImportFile(null);
            await fetchBase();
        } catch (e) {
            setError(formatApiError(e));
        } finally {
            setImportLoading(false);
        }
    }

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-primary">CRUD de Colaboradores</h1>
                <Link href="/admin" className="btn btn-outline">Voltar ao Admin</Link>
            </div>

            <form onSubmit={importarExcelColaboradores} className="card mb-6">
                <p className="text-sm font-semibold text-text-primary mb-2">Importar colaboradores ativos via Excel</p>
                <p className="text-xs text-text-secondary mb-3">Colunas esperadas: CPF, NOME, DATA NASCIMENTO, SETOR.</p>
                <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="input-field"
                        onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={importLoading || !importFile}>
                        {importLoading ? "Importando..." : "Importar Excel"}
                    </button>
                </div>
                {importResult && <p className="text-xs text-green-700 mt-2">{importResult}</p>}
            </form>

            <form onSubmit={criarColaborador} className="card mb-6 grid md:grid-cols-5 gap-3">
                <input className="input-field md:col-span-2" placeholder="Nome do colaborador" value={nome} onChange={(e) => setNome(e.target.value)} />
                <input className="input-field" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                <input className="input-field" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                <select className="input-field" value={setorId} onChange={(e) => setSetorId(e.target.value)}>
                    <option value="">Selecione o setor</option>
                    {setores.map((setor) => (
                        <option key={setor.id} value={setor.id}>{setor.nome}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary md:col-span-5">Adicionar colaborador</button>
            </form>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-semibold text-text-primary">Colaboradores cadastrados</div>
                <div className="divide-y divide-gray-100">
                    {colaboradores.map((col) => {
                        const setorNome = setores.find((s) => s.id === col.setor_id)?.nome || "—";
                        return (
                            <div key={col.id} className="px-6 py-4 flex items-center gap-3">
                                {editId === col.id ? (
                                    <>
                                        <input className="input-field flex-1" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                                        <input className="input-field" placeholder="CPF" value={editCpf} onChange={(e) => setEditCpf(e.target.value)} />
                                        <input className="input-field" type="date" value={editDataNascimento} onChange={(e) => setEditDataNascimento(e.target.value)} />
                                        <select className="input-field" value={editSetorId} onChange={(e) => setEditSetorId(e.target.value)}>
                                            <option value="">Setor</option>
                                            {setores.map((setor) => (
                                                <option key={setor.id} value={setor.id}>{setor.nome}</option>
                                            ))}
                                        </select>
                                        <button className="btn btn-primary text-xs" onClick={() => salvarEdicao(col.id)}>Salvar</button>
                                        <button className="btn btn-outline text-xs" onClick={() => setEditId(null)}>Cancelar</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="font-medium text-text-primary">{col.nome}</p>
                                            <p className="text-xs text-text-secondary">
                                                CPF: {col.cpf || "—"} • Nasc.: {col.data_nascimento ? new Date(col.data_nascimento).toLocaleDateString("pt-BR") : "—"} • {setorNome}
                                            </p>
                                        </div>
                                        <button
                                            className="btn btn-outline text-xs"
                                            onClick={() => {
                                                setEditId(col.id);
                                                setEditNome(col.nome);
                                                setEditCpf(col.cpf ?? "");
                                                setEditDataNascimento(col.data_nascimento ?? "");
                                                setEditSetorId(col.setor_id ?? "");
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button className="btn text-xs bg-red-50 text-red-600 border border-red-200" onClick={() => excluirColaborador(col.id)}>
                                            Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {colaboradores.length === 0 && <p className="px-6 py-4 text-sm text-text-secondary">Nenhum colaborador cadastrado.</p>}
                </div>
            </div>
        </main>
    );
}
