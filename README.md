# CRM — pequenos negócios

CRM simples (Next.js + Supabase): contatos, funil, origem, WhatsApp 1-click, webhook de captura.

Modelo: **1 instalação por cliente** — cada cliente tem seu projeto Supabase + seu deploy Vercel. Sem multi-tenant.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PietroNozella/CRM-MVP)

## Instalação por cliente (checklist)

1. **Supabase:** crie um projeto novo → SQL Editor → rode `supabase/schema.sql` inteiro.
2. **Chaves:** no Supabase, Settings → API → copie URL, `anon` e `service_role`.
3. **Deploy:** use o botão acima ou `vercel` na pasta → cadastre as envs abaixo (Production + Preview).
4. **Segredo webhook:** gere um hex de 32 bytes e cadastre como `LEADS_WEBHOOK_SECRET` (Vercel + `.env.local`).
5. **LP do cliente:** o formulário deve mandar `POST /api/webhooks/leads` com header `Authorization: Bearer <segredo>` e body `{ "name", "phone", "email?", "source?" }`.
6. **Teste:** crie 1 contato manual + 1 via webhook, confira WhatsApp e filtro por status.

Bancos existentes (atualização, não instalação): rode os arquivos de `supabase/migrations/` na ordem de data no SQL Editor.

## Envs

| Var | Onde | Obs |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | URL do projeto Supabase do cliente |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local (server-only) | service_role; nunca com prefixo `NEXT_PUBLIC_` |
| `LEADS_WEBHOOK_SECRET` | Vercel + local + LP | segredo do webhook |
| `NEXT_PUBLIC_APP_NAME` | Vercel (opcional) | nome no menu/título, padrão `CRM` |
| `NEXT_PUBLIC_WHATSAPP_TEMPLATE` | Vercel (opcional) | mensagem do botão Chamar, use `{nome}` |

`NEXT_PUBLIC_*` entram no build — após mudar, faça redeploy.

## Customização por cliente (sem espalhar código)

- Marca/WhatsApp: `src/lib/site.ts` ou envs acima.
- Etapas do funil: `src/lib/pipeline.ts` (siga os 3 passos comentados no arquivo: tipo, lista+schema, SQL).
- Rota `/imoveis` é legado imobiliário fora do menu — remover quando nenhum cliente usar.

## Dev local

```bash
npm install
cp .env.example .env.local  # preencha as chaves
npm run dev
```
