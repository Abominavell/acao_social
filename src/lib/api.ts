/**
 * Cliente HTTP para a API Django (NEXT_PUBLIC_API_URL, ex.: http://127.0.0.1:8000/api)
 */

const ACCESS_KEY = "monitoramento_access_token";
const REFRESH_KEY = "monitoramento_refresh_token";
const USERNAME_KEY = "monitoramento_auth_username";

/** Padrão local quando `.env.local` ainda não define NEXT_PUBLIC_API_URL (só em desenvolvimento). */
const DEFAULT_DEV_API_BASE = "http://127.0.0.1:8000/api";

export function getApiBase(): string {
    const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (raw) {
        return raw.replace(/\/$/, "");
    }
    if (process.env.NODE_ENV === "development") {
        if (typeof console !== "undefined") {
            console.warn(
                "[api] NEXT_PUBLIC_API_URL não definido; usando",
                DEFAULT_DEV_API_BASE,
                "— adicione ao .env.local em produção.",
            );
        }
        return DEFAULT_DEV_API_BASE.replace(/\/$/, "");
    }
    throw new Error(
        "Defina NEXT_PUBLIC_API_URL no build (ex.: http://127.0.0.1:8000/api)",
    );
}

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, body: unknown, message?: string) {
        super(message ?? `HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}

function buildQuery(params: Record<string, unknown>): string {
    const parts: string[] = [];
    for (const [key, val] of Object.entries(params)) {
        if (val === undefined || val === null) continue;
        if (Array.isArray(val)) {
            if (val.length === 0) continue;
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val.join(","))}`);
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
        }
    }
    return parts.length ? `?${parts.join("&")}` : "";
}

/** Monta URL relativa à API: `inscricoes/` + query */
export function apiUrl(resourcePath: string, params?: Record<string, unknown>): string {
    const path = resourcePath.startsWith("/") ? resourcePath.slice(1) : resourcePath;
    const q = params ? buildQuery(params) : "";
    return `${getApiBase()}/${path}${q}`;
}

/** Aceita `recurso/?a=1` ou URL absoluta. */
export function resolveApiUrl(pathOrRelative: string): string {
    if (pathOrRelative.startsWith("http")) return pathOrRelative;
    const p = pathOrRelative.startsWith("/") ? pathOrRelative.slice(1) : pathOrRelative;
    return `${getApiBase()}/${p}`;
}

export function getStoredAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUsername(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USERNAME_KEY);
}

export function clearAuthStorage(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USERNAME_KEY);
}

export function storeTokens(access: string, refresh: string, username: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USERNAME_KEY, username);
}

async function refreshAccessToken(): Promise<string | null> {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetch(`${getApiBase()}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
        clearAuthStorage();
        return null;
    }
    const data = (await res.json()) as { access?: string };
    if (data.access) {
        localStorage.setItem(ACCESS_KEY, data.access);
        return data.access;
    }
    return null;
}

type FetchOptions = RequestInit & {
    /** Se true (padrão), envia Bearer quando houver token. Use false para endpoints públicos. */
    auth?: boolean;
};

/**
 * GET/POST/PATCH/DELETE na API. `path` é relativo à base (ex.: `setores/?ordering=nome`).
 */
export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
    const { auth = true, headers: initHeaders, ...rest } = options;
    const headers = new Headers(initHeaders);

    if (auth) {
        const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null;
        if (!token) {
            throw new ApiError(401, { detail: "Faça login para continuar." }, "Unauthorized");
        }
        headers.set("Authorization", `Bearer ${token}`);
    }

    const body = rest.body;
    if (body instanceof FormData) {
        headers.delete("Content-Type");
    } else if (
        body &&
        typeof body === "string" &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    const url = resolveApiUrl(path);

    let res: Response;
    try {
        res = await fetch(url, { ...rest, headers });
    } catch (err) {
        const msg =
            err instanceof TypeError
                ? "Não foi possível contatar a API. Verifique a URL (NEXT_PUBLIC_API_URL), CORS na API (CORS_ALLOWED_ORIGINS com a origem exata deste site, https://…), rede e tamanho do arquivo."
                : String(err);
        throw new ApiError(0, { detail: msg }, "Failed to fetch");
    }

    if (res.status === 401 && auth) {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
            headers.set("Authorization", `Bearer ${newAccess}`);
            try {
                res = await fetch(url, { ...rest, headers });
            } catch (err) {
                const msg =
                    err instanceof TypeError
                        ? "Não foi possível contatar a API após renovar o token."
                        : String(err);
                throw new ApiError(0, { detail: msg }, "Failed to fetch");
            }
        }
    }

    return res;
}

export async function apiJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const res = await apiFetch(path, options);
    const text = await res.text();
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text) as unknown;
        } catch {
            body = { detail: text.slice(0, 200) };
        }
    }
    if (!res.ok) {
        throw new ApiError(res.status, body);
    }
    return body as T;
}

/** Login JWT (usuário Django criado com createsuperuser). */
export async function loginWithPassword(username: string, password: string): Promise<void> {
    const res = await fetch(`${getApiBase()}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
    });
    const body = (await res.json().catch(() => ({}))) as {
        access?: string;
        refresh?: string;
        detail?: string;
    };
    if (!res.ok || !body.access || !body.refresh) {
        const msg =
            typeof body.detail === "string"
                ? body.detail
                : "Credenciais inválidas.";
        throw new Error(msg);
    }
    storeTokens(body.access, body.refresh, username.trim());
}

export function formatApiError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 0) {
            const b = err.body as Record<string, unknown>;
            if (typeof b?.detail === "string") return b.detail;
            return err.message;
        }
        const b = err.body as Record<string, unknown>;
        if (typeof b?.detail === "string") return b.detail;
        if (Array.isArray(b?.detail) && typeof b.detail[0] === "string") {
            return b.detail[0];
        }
        for (const v of Object.values(b)) {
            if (Array.isArray(v) && typeof v[0] === "string") return v[0];
            if (typeof v === "string") return v;
        }
        return err.message;
    }
    if (err instanceof Error) return err.message;
    return "Erro desconhecido.";
}
