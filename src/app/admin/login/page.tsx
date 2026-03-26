"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function LockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <path d="m2 2 20 20" />
        </svg>
    );
}

function LoginForm() {
    const { signIn } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!username || !password) return;

        setLoading(true);
        setError(null);

        const { error: signInError } = await signIn(username, password);

        if (signInError) {
            setError("Usuário ou senha incorretos.");
            setLoading(false);
        } else {
            setLoading(false);
            router.push("/admin");
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <Image
                        src="/logo.svg"
                        alt="Logo IADVh"
                        width={180}
                        height={66}
                        className="mx-auto mb-4 h-14 w-auto"
                        priority
                    />
                    <div className="mb-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                        <LockIcon />
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel Administrativo</h1>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Acesso restrito à Equipe de Responsabilidade Social
                    </p>
                </div>

                {/* Form */}
                <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        {error ? <Alert tone="error" className="mb-4">{error}</Alert> : null}

                        <div className="mb-4">
                            <Input
                                label="Usuário (Django)"
                                className="admin-login-input border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-emerald-200/30"
                                id="username"
                                type="text"
                                placeholder="mesmo usuário do createsuperuser"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="input-field admin-login-input h-10 w-full rounded-xl border border-slate-300 bg-white px-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-emerald-200/30"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading || !username || !password}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                </Card>

                <div className="mt-5 text-center">
                    <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                        Voltar para página inicial
                    </Link>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-500">
                    Sistema de Monitoramento de Voluntariado<br />
                    Gerenciado pela Equipe de Responsabilidade Social
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <AuthProvider>
            <LoginForm />
        </AuthProvider>
    );
}
