# MONOLITH — Plataforma institucional

Aplicação React responsiva com Vite, Supabase Auth, PostgreSQL, Row Level Security e uma Supabase Edge Function para solicitações de contato. O site público só mostra trabalhos que um administrador marcou para o portfólio; não há depoimentos ou projetos fictícios.

## Tecnologias

- Node.js e npm.
- React 19, React Router e Vite 6.
- Supabase JS v2, Supabase Auth e PostgreSQL.
- Supabase CLI para migrations e deploy da Edge Function.
- ESLint 9 e testes nativos com `node:test`.

O ambiente de desenvolvimento usado na implementação foi Node.js 20.11.1 e npm 10.2.4.

## Instalação e execução local

1. Instale Node.js 20.11 ou superior e npm.
2. Na pasta do projeto, instale os pacotes:

   ```powershell
   npm install
   ```

3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local` (ou `.env`, que já é aceito pelo Vite). O arquivo `.env` existente foi mantido, não impresso nem incluído no controle de versão. Use [.env.local.example](./.env.local.example) como referência.
4. Inicie o servidor local:

   ```powershell
   npm run dev
   ```

5. Execute build, lint e testes:

   ```powershell
   npm run build
   npm run lint
   npm test
   ```

Se as variáveis públicas do Supabase estiverem ausentes ou inválidas, as páginas informam a configuração pendente e as rotas privadas não concedem acesso.

## Supabase — configuração que depende de você

1. Crie o projeto Supabase e obtenha a URL e a chave **publishable** (ou chave pública `anon` legada). Preencha somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente local e no serviço de build/deploy.
2. **Nunca** inclua `service_role`, `sb_secret_*`, senha do banco ou segredo de Edge Function em variáveis `VITE_*`, no bundle, no repositório ou em mensagens públicas. O cliente rejeita chaves reconhecidas como `service_role`.
3. Instale o Supabase CLI no Windows conforme a documentação oficial e autentique-se:

   ```powershell
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   ```

   O CLI solicitará as informações necessárias para vincular o projeto.
4. Aplique a migration versionada no projeto correto:

   ```powershell
   npm run db:push
   ```

   Revise o project ref antes de confirmar a operação. A migration cria as tabelas, índices, funções auxiliares, políticas RLS e a view restrita de portfólio.
5. Configure os secrets da Edge Function na área **Edge Functions → Secrets** do Supabase:
   - `CORS_ALLOW_ORIGIN`: origem exata do site publicado; para mais de uma origem, separe por vírgula. Durante o desenvolvimento, inclua `http://localhost:5173`.
   - `CONTACT_RATE_LIMIT_SECRET`: segredo aleatório de pelo menos 32 bytes usado para gerar fingerprints HMAC dos IPs. Não reutilize a chave publishable nem a senha do banco.
   - O runtime da Supabase Edge Function fornece `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Confirme esses nomes na configuração do projeto; esse segredo só é usado dentro da Edge Function.
6. Publique a função de contato:

   ```powershell
   npm run functions:deploy
   ```

   O endpoint é público por desenho para receber o formulário, mas confere origem, valida os dados no servidor e limita solicitações a cinco por fingerprint por hora. A tabela de fingerprints só armazena HMAC e contadores; nenhum IP em texto é persistido. Se os cabeçalhos de IP não estiverem disponíveis no provedor, a função falha de forma fechada.

## Primeiro administrador e contas de cliente

O projeto **não oferece cadastro público**. Depois de aplicar as migrations:

1. Crie/invite uma conta Auth confiável em **Authentication → Users** no painel Supabase e confirme o usuário.
2. Copie o UUID desse usuário e, no SQL Editor do projeto correto, execute:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID_DO_USUARIO_AUTH')
   on conflict (user_id) do nothing;
   ```

3. Acesse `/admin` e autentique-se. A lista `admin_users` só pode ser administrada pelo Supabase SQL Editor/ambiente confiável, não pela interface pública.
4. Para vincular um cliente, crie/invite sua conta em Supabase Auth e use **Clientes** no painel administrativo para associar seu UUID ao perfil. Contas Auth sem perfil de cliente não acessam projetos.

Não execute o exemplo com o texto placeholder; substitua-o pelo UUID de um usuário confiável no projeto correto.

## Arquitetura

```text
src/
  components/       componentes de navegação, proteção, feedback e administração
  contexts/         sessão e perfil de acesso
  hooks/            estado assíncrono reutilizável
  lib/              cliente Supabase, erros e validações
  pages/            site público, painel e área do cliente
  services/         autenticação, contato, projetos e operações de dados
  styles/           estilos da aplicação
supabase/
  functions/         envio público e validado de solicitações
  migrations/        schema PostgreSQL, índices e RLS
tests/               testes automatizados de validação
```

### Tabelas e permissões

- `contact_requests`: solicitações privadas; somente administradores leem/alteram. Visitantes enviam pelo endpoint Edge Function, nunca por inserção direta com a chave pública.
- `clients`: administradores gerenciam; cada usuário Auth só lê seu perfil.
- `projects`: administradores gerenciam; clientes só leem projetos associados ao seu próprio perfil Auth.
- `project_updates`: administradores gerenciam; o cliente lê somente atualizações marcadas para compartilhamento nos próprios projetos.
- `admin_users`: vincula IDs Auth confiáveis a administradores; sem políticas de cadastro ou alteração pelo frontend.
- `contact_request_rate_limits`: armazenamento privado de contagem e HMAC para limitar abuso do formulário.
- `public_projects`: view somente de leitura que expõe título e resumo de projetos concluídos e explicitamente publicados; não expõe cliente, informações internas ou atualizações.

O painel oferece resumo, solicitações/mensagens, clientes, projetos/portfólio e atualizações. A área `/cliente` só lista os projetos vinculados à sessão autenticada; a proteção efetiva é feita por RLS no banco, não apenas pelas rotas React.

## Testes e responsividade

- `npm test`: testes unitários de validação do formulário.
- `npm run lint`: análise estática do frontend.
- `npm run build`: build de produção.
- Teste manual sugerido no navegador em 320, 375, 768, 1366 e 1920 px, incluindo menu mobile, formulário, área administrativa e tabelas.
- A validação real de RLS, Edge Functions, Auth e persistência exige aplicar migrations e testar com usuários/credenciais do seu projeto Supabase.

## Build e deploy

1. Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de build do provedor. Elas são públicas por natureza; nunca configure service role no frontend.
2. Execute `npm run build`; publique o conteúdo da pasta `dist`.
3. Configure no host uma regra SPA que encaminhe rotas como `/admin` e `/cliente` para `index.html`, sem interceptar requisições ao projeto Supabase.
4. Configure a origem final em `CORS_ALLOW_ORIGIN` e os redirects/domínios de Auth no Supabase, se necessários ao fluxo de sessão.
5. Publique as migrations e a Edge Function no projeto correto antes de liberar o formulário.

## Etapas externas pendentes

- Revisar/configurar as variáveis no provedor de deploy.
- Instalar e autenticar o Supabase CLI, vincular o projeto correto e aplicar a migration.
- Configurar secrets da Edge Function e publicar a função.
- Criar manualmente a primeira conta administradora e conceder o vínculo via SQL Editor.
- Criar contas Auth e perfis para os clientes que receberão acesso.
- Executar testes de integração contra o projeto Supabase e configurar a regra SPA do host escolhido.
