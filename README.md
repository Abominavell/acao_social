# Monitoramento de Voluntariado (Next.js)

Frontend para inscrição de voluntários, painel administrativo, dashboard e ranking por setor.

## Configuração

1. Copie `.env.example` para `.env.local`.
2. Defina a URL da API Django:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

3. Instale e rode:

```bash
npm install
npm run dev
```

O backend está em `monitoramento_backend_api` (Django). Crie um superusuário e use o **mesmo nome de usuário** no login do painel (`/admin/login`) para obter o JWT.

## Admin Django (edição direta no banco)

No servidor da API: `http://127.0.0.1:8000/admin/` — todos os modelos (`Setor`, `Colaborador`, `AcaoSocial`, `Inscricao`) estão registrados para edição quando necessário.

## Build

```bash
npm run build
```

## Deploy no Render (frontend)

Com a API já no ar, configure o front assim.

### 1. Novo Web Service (Node)

- **Repository:** este projeto (`monitoramento-de-voluntarios`)
- **Root Directory:** vazio
- **Branch:** `main`
- **Region:** Oregon (mesma da API, se possível)

### 2. Build e Start (copie literalmente)

| Campo | Comando |
|-------|---------|
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |

Não use `…` ou `...` no meio do comando.

### 3. Variável de ambiente (obrigatória)

No serviço do **frontend**, em **Environment**:

- **`NEXT_PUBLIC_API_URL`** = `https://<nome-da-sua-api>.onrender.com/api`  
  - Exemplo se a API for `monitoramento-backend-api`:  
    `https://monitoramento-backend-api.onrender.com/api`  
  - **Sem barra no final.** Salve e faça deploy; se mudar depois, rode um novo build.

### 4. CORS na API (obrigatório para o navegador)

No **Web Service da API** (Django), adicione a URL **pública do frontend** (a que o Render mostrar, com `https://`):

- **`CORS_ALLOWED_ORIGINS`**
- **`CSRF_TRUSTED_ORIGINS`**

Ex.: `https://monitoramento-de-voluntarios.onrender.com` (um valor por linha ou separados por vírgula, conforme o seu `settings.py`).

### 5. Blueprint (opcional)

Se usar **New → Blueprint**, o `render.yaml` na raiz já declara o serviço; ainda assim defina `NEXT_PUBLIC_API_URL` quando o painel pedir (`sync: false`).

Referência rápida: arquivo **`RENDER_FRONTEND.txt`** na raiz do repositório.
