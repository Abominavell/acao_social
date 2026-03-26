"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    apiJson,
    clearAuthStorage,
    getStoredAccessToken,
    getStoredUsername,
    loginWithPassword,
} from "@/lib/api";

export interface AuthUser {
    username: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (username: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signOut: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getStoredAccessToken();
        const username = getStoredUsername();
        if (token && username) {
            setUser({ username });
        }
        setLoading(false);
    }, []);

    async function signIn(username: string, password: string) {
        const normalizedCpf = username.replace(/\D/g, "");
        const looksLikeCpfLogin =
            /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(username.trim()) ||
            (normalizedCpf.length >= 10 && normalizedCpf.length <= 11);

        if (looksLikeCpfLogin) {
            try {
                await apiJson("auth/colaborador-login/", {
                    method: "POST",
                    auth: false,
                    body: JSON.stringify({
                        cpf: normalizedCpf,
                        senha: password,
                    }),
                });
                clearAuthStorage();
                setUser(null);
                return { error: "Acesso negado: colaboradores não podem acessar o painel administrativo." };
            } catch {
                // Se falhar no endpoint de login, ainda verificamos se esse identificador pertence a colaborador.
                try {
                    const byCpf = await apiJson<Array<{ id: string }>>(
                        `colaboradores/?cpf=${encodeURIComponent(normalizedCpf)}`,
                        { auth: false },
                    );
                    if (Array.isArray(byCpf) && byCpf.length > 0) {
                        clearAuthStorage();
                        setUser(null);
                        return { error: "Acesso negado: colaboradores não podem acessar o painel administrativo." };
                    }
                } catch {
                    // Ignore and continue fallback.
                }
            }
        }

        try {
            await loginWithPassword(username, password);
            setUser({ username: username.trim() });
            return { error: null };
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha no login.";
            return { error: msg };
        }
    }

    function signOut() {
        clearAuthStorage();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
