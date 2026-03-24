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
    const [setorId, setSetorId] = useState("");
    const [isExterno, setIsExterno] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [editSetorId, setEditSetorId] = useState("");
    const [editExterno, setEditExterno] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (!nome.trim() || !setorId) {
            setError("Nome e setor são obrigatórios.");
            return;
        }
        setError(null);
        try {
            await apiJson<Colaborador>("colaboradores/", {
                method: "POST",
                body: JSON.stringify({
                    nome: nome.trim(),
                    setor_id: setorId,
                    is_externo: isExterno,
                }),
                auth: true,
            });
        } catch (e) {
            setError(formatApiError(e));
            return;
        }
        setNome("");
        setSetorId("");
        setIsExterno(false);
        fetchBase();
    }

    async function salvarEdicao(id: string) {
        if (!editNome.trim() || !editSetorId) {
            setError("Nome e setor são obrigatórios na edição.");
            return;
        }
        setError(null);
        try {
            await apiJson<Colaborador>(`colaboradores/${id}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    nome: editNome.trim(),
                    setor_id: editExterno ? null : editSetorId,
                    is_externo: editExterno,
                }),
                auth: true,
            });
        } catch (e) {
            setError(formatApiError(e));
            return;
        }
        setEditId(null);
        setEditNome("");
        setEditSetorId("");
        setEditExterno(false);
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

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-text-primary">CRUD de Colaboradores</h1>
                <Link href="/admin" className="btn btn-outline">Voltar ao Admin</Link>
            </div>

            <form onSubmit={criarColaborador} className="card mb-6 grid md:grid-cols-4 gap-3">
                <input className="input-field md:col-span-2" placeholder="Nome do colaborador" value={nome} onChange={(e) => setNome(e.target.value)} />
                <select className="input-field" value={setorId} onChange={(e) => setSetorId(e.target.value)}>
                    <option value="">Selecione o setor</option>
                    {setores.map((setor) => (
                        <option key={setor.id} value={setor.id}>{setor.nome}</option>
                    ))}
                </select>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isExterno} onChange={(e) => setIsExterno(e.target.checked)} />
                    Externo
                </label>
                <button type="submit" className="btn btn-primary md:col-span-4">Adicionar colaborador</button>
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
                                        <select className="input-field" value={editSetorId} onChange={(e) => setEditSetorId(e.target.value)}>
                                            <option value="">Setor</option>
                                            {setores.map((setor) => (
                                                <option key={setor.id} value={setor.id}>{setor.nome}</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center gap-2 text-xs">
                                            <input type="checkbox" checked={editExterno} onChange={(e) => setEditExterno(e.target.checked)} />
                                            Externo
                                        </label>
                                        <button className="btn btn-primary text-xs" onClick={() => salvarEdicao(col.id)}>Salvar</button>
                                        <button className="btn btn-outline text-xs" onClick={() => setEditId(null)}>Cancelar</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="font-medium text-text-primary">{col.nome}</p>
                                            <p className="text-xs text-text-secondary">{setorNome} {col.is_externo ? "• Externo" : "• Sede"}</p>
                                        </div>
                                        <button
                                            className="btn btn-outline text-xs"
                                            onClick={() => {
                                                setEditId(col.id);
                                                setEditNome(col.nome);
                                                setEditSetorId(col.setor_id ?? "");
                                                setEditExterno(col.is_externo);
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
