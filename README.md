# PRUMO — CRM para pequenos negócios

PRUMO é um CRM simples (Next.js + Supabase): contatos, funil, origem, WhatsApp 1-click e webhook de captura.

Modelo: **1 instalação compartilhada** — vários usuários usam o mesmo CRM, mas o
Supabase isola contatos, anotações, funil e indicadores por usuário com RLS.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PietroNozella/CRM-MVP)

## Instalação (checklist)

1. **Supabase:** no SQL Editor, rode `supabase/schema.sql` inteiro.
2. **Auth:** crie os usuários em Authentication → Add user e mantenha o cadastro público desativado.
3. **Chaves:** copie a URL pública do Supabase, a chave `anon` e a chave `service_role`.
4. **Deploy:** configure as envs abaixo e suba a aplicação.
5. **Webhook:** gere um token para cada usuário com o command de provisionamento.
6. **LP do usuário (server-side, nunca no JS público):** envie `POST /api/webhooks/leads` com `Authorization: Bearer <token-do-usuario>` e body `{ "name", "phone", "email?", "source?" }`.
7. **Teste:** valide com duas contas que nenhuma delas lê ou altera os contatos da outra.

Bancos existentes usam o command de release descrito abaixo. Cada alteração deve
ser um novo arquivo `supabase/migrations/<versão-numérica>_<nome>.sql`.

## Envs

| Var | Onde | Obs |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | deploy + local | URL pública do Supabase; precisa ser acessível pelo navegador |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | deploy + local | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | deploy + local (server-only) | service_role; nunca com prefixo `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_APP_NAME` | deploy (opcional) | nome no menu/título, padrão `PRUMO` |
| `NEXT_PUBLIC_WHATSAPP_TEMPLATE` | deploy (opcional) | mensagem do botão Chamar, use `{nome}` |

`NEXT_PUBLIC_*` entram no build — após mudar, faça redeploy.

## Usuários e isolamento

- `leads.owner_id` identifica o proprietário do contato.
- O banco preenche `owner_id` com `auth.uid()` em cadastros autenticados.
- As políticas RLS bloqueiam leitura, criação, alteração e exclusão de dados de outro usuário.
- As anotações são autorizadas pelo proprietário do contato relacionado.
- O webhook usa `service_role`, então resolve o proprietário pelo token antes de inserir o contato.

Não apague um usuário do Auth sem antes decidir o destino dos contatos dele. A
chave estrangeira usa `ON DELETE RESTRICT` para impedir perda acidental dos dados.

## Token de webhook por usuário

No checkout local, usando as variáveis de `.env.local`:

```bash
npm run webhook:provision -- --email usuario@exemplo.com
```

Ou, dentro da imagem Docker:

```bash
docker compose --env-file .env.local run --rm app node scripts/provision-webhook-token.mjs --user-id UUID_DO_USUARIO
```

O command mostra o token uma única vez. Executá-lo novamente com o mesmo usuário
e `label` substitui o token anterior. Para manter mais de uma origem ativa para o
mesmo usuário, informe `--label outra-origem`.

Para revogar uma origem:

```bash
npm run webhook:provision -- --email usuario@exemplo.com --label default --revoke
```

## Migração da instalação existente

Antes de cadastrar o segundo usuário:

1. Faça backup do banco e construa a nova imagem.
2. Confirme que existe somente o usuário atual no Auth.
3. Pause temporariamente a captura das landing pages.
4. Rode `supabase/migrations/202609280001_multi_user_isolation.sql`.
5. Provisione um token para o usuário atual.
6. Atualize o token na landing page e suba a nova imagem.
7. Retome a captura e só então crie os demais usuários.

Se já existirem vários usuários e houver contatos sem proprietário, a migration
interrompe a transação. Nesse caso, atribua `owner_id` explicitamente antes de
executá-la novamente.

## Release automatizado da VPS

Configuração única:

```bash
cp .release.local.example .release.local
npm run migrations:baseline
```

Preencha `.release.local` com os dados do EasyPanel, a URL pública do Supabase
self-hosted e a `service_role`. O arquivo é ignorado pelo Git. O baseline registra
as migrations que já estavam aplicadas antes da automação; não o execute em uma
instalação vazia.

Para cada alteração futura:

1. Crie uma migration com versão numérica única e maior que as anteriores.
2. Faça o commit do código; não edite migrations já aplicadas.
3. No EasyPanel, gere e copie uma API key temporária.
4. Execute:

```bash
npm run release:vps
```

O command exige Git limpo, roda lint e build, cria backup lógico das tabelas
`public`, aplica somente migrations pendentes em transação, envia a branch,
acompanha o deploy e executa smoke tests. No Windows, a chave copiada é lida do
clipboard e revogada automaticamente ao final.

Para apenas inspecionar o plano, sem alterar banco, Git ou VPS:

```bash
npm run release:vps:dry
```

Os backups ficam em schemas `migration_backup_<timestamp>`. A limpeza deles é
manual para evitar exclusão automática de dados recuperáveis.

## Customização da instalação (sem espalhar código)

- Marca/WhatsApp: `src/lib/site.ts` ou envs acima.
- Tipografia: Geist local na interface e nos títulos, Geist Mono nos dados técnicos; configuração em `src/app/layout.tsx` e `tailwind.config.ts`.
- Etapas do funil: `src/lib/pipeline.ts` (siga os 3 passos comentados no arquivo: tipo, lista+schema, SQL).

## Dev local

```bash
npm install
cp .env.example .env.local  # preencha as chaves
npm run dev
```

## Deploy em VPS com Docker

Na VPS, instale Docker + Docker Compose, clone o repositório e crie o `.env.local`
com base no `.env.example`. Preencha todas as variáveis obrigatórias e execute:

```bash
docker compose --env-file .env.local up -d --build
```

A aplicação ficará disponível na porta `3000`. Use Nginx, Caddy ou o proxy já
existente na VPS para publicar o domínio com HTTPS apontando para `localhost:3000`.

Para atualizar:

```bash
git pull
docker compose --env-file .env.local up -d --build
```

As variáveis `NEXT_PUBLIC_*` são incorporadas durante o build. Por isso, qualquer
alteração nelas exige reconstruir a imagem.
