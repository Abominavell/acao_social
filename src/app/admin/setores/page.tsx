"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, apiJson, formatApiError, getStoredAccessToken } from "@/lib/api";
import type { Setor } from "@/lib/types";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default function SetoresPage() {
    const router = useRouter();
    const [setores, setSetores] = useState<Setor[]>([]);
    const [nome, setNome] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function fetchSetores() {
        try {
            const data = await apiJson<Setor[]>("setores/?ordering=nome", { auth: true });
            setSetores(data);
        } catch (e) {
            setError(formatApiError(e));
        }
    }

    useEffect(() => {
        if (!getStoredAccessToken()) {
            router.push("/admin/login");
            return;
        }
        fetchSetores();
    }, [router]);

    async function criarSetor(e: React.FormEvent) {
        e.preventDefault();
        const nomeNormalizado = nome.trim();
        if (!nomeNormalizado) return;
        setError(null);
        const jaExiste = setores.some((s) => s.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase());
        if (jaExiste) {
            setError("Já existe um setor com esse nome.");
            return;
        }

        try {
            await apiJson<Setor>("setores/", {
                method: "POST",
                body: JSON.stringify({ nome: nomeNormalizado }),
                auth: true,
            });
            setNome("");
            fetchSetores();
        } catch (e) {
            setError(formatApiError(e));
        }
    }

    async function salvarEdicao(id: string) {
        const nomeNormalizado = editNome.trim();
        if (!nomeNormalizado) return;
        setError(null);

        const jaExiste = setores.some(
            (s) => s.id !== id && s.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase()
        );
        if (jaExiste) {
            setError("Já existe um setor com esse nome.");
            return;
        }

        try {
            await apiJson<Setor>(`setores/${id}/`, {
                method: "PATCH",
                body: JSON.stringify({ nome: nomeNormalizado }),
                auth: true,
            });
            setEditId(null);
            setEditNome("");
            fetchSetores();
        } catch (e) {
            setError(formatApiError(e));
        }
    }

    async function excluirSetor(id: string) {
        if (!window.confirm("Deseja excluir este setor?")) return;
        setError(null);
        try {
            await apiJson(`setores/${id}/`, { method: "DELETE", auth: true });
            fetchSetores();
        } catch (e) {
            const msg = formatApiError(e);
            if (e instanceof ApiError && e.status >= 500) {
                setError("Este setor pode estar vinculado a registros e não pode ser removido.");
            } else {
                setError(msg);
            }
        }
    }

    return (
        <WorkspaceShell
            title="CRUD de Setores"
            subtitle="Cadastre, edite e remova setores da operação."
            navItems={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/admin", label: "Admin" },
                { href: "/admin/colaboradores", label: "Colaboradores" },
            ]}
        >
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Setores</h1>
                <Link href="/admin" className="btn btn-outline">Voltar ao Admin</Link>
            </div>

            <form onSubmit={criarSetor} className="card mb-6 flex gap-3 flex-col md:flex-row">
                <input
                    className="input-field"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do setor"
                />
                <button type="submit" className="btn btn-primary md:w-auto">Adicionar</button>
            </form>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-semibold text-text-primary">Setores cadastrados</div>
                <div className="divide-y divide-gray-100">
                    {setores.map((setor) => (
                        <div key={setor.id} className="px-6 py-4 flex items-center gap-3">
                            {editId === setor.id ? (
                                <>
                                    <input className="input-field" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                                    <button type="button" className="btn btn-primary text-xs" onClick={() => salvarEdicao(setor.id)}>Salvar</button>
                                    <button type="button" className="btn btn-outline text-xs" onClick={() => setEditId(null)}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{setor.nome}</span>
                                    <button type="button" className="btn btn-outline text-xs" onClick={() => { setEditId(setor.id); setEditNome(setor.nome); }}>Editar</button>
                                    <button type="button" className="btn text-xs bg-red-50 text-red-600 border border-red-200" onClick={() => excluirSetor(setor.id)}>Excluir</button>
                                </>
                            )}
                        </div>
                    ))}
                    {setores.length === 0 && <p className="px-6 py-4 text-sm text-text-secondary">Nenhum setor cadastrado.</p>}
                </div>
            </div>
        </WorkspaceShell>
    );
}
