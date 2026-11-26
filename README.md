# RHIZAM — Plataforma institucional

Aplicação institucional responsiva em React, Vite e Supabase.

## Tecnologias

- React 19
- React Router
- Vite
- Supabase Auth e PostgreSQL
- Supabase Edge Functions
- ESLint
- Testes nativos com `node:test`

## Material de referência

As orientações fornecidas para imagens e carrossel estão em [docs/Instrução.docx](./docs/Instru%C3%A7%C3%A3o.docx). Esse arquivo é documentação interna e não é publicado como asset do site.

## Desenvolvimento

```powershell
npm install
npm run dev
```

Configure `.env.local` usando [.env.local.example](./.env.local.example).

## Validação

```powershell
npm run build
npm run lint
npm test
npm audit --omit=dev
```

## Supabase

A aplicação exige a configuração de:

- URL do projeto.
- Chave pública publishable ou anon.
- Migration versionada.
- Edge Function `create-contact-request`.
- Secret `CORS_ALLOW_ORIGIN`.
- Secret `CONTACT_RATE_LIMIT_SECRET`.
- Contas administrativas e vínculos de clientes.

Nunca coloque `service_role`, `sb_secret_*` ou segredos privados em variáveis `VITE_*`.

As regras efetivas de autorização são aplicadas por Row Level Security no PostgreSQL.
