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
