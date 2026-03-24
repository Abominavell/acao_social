"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
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
