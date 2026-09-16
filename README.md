# Alexandre Music Blog

Blog editorial em React + Vite, com artigos publicados pelo Supabase e painel administrativo protegido.

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows, copie `.env.example` para `.env.local` manualmente se `cp` não estiver disponível.

## Supabase

1. Crie um projeto Supabase.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env.local`.
3. Execute `supabase/admin-schema.sql` no SQL Editor. O script cria as tabelas, funções, políticas RLS e o bucket `site-media`.
4. Crie um usuário em Authentication > Users.
5. No usuário, defina `app_metadata.role` como `admin` para permitir acesso ao `/admin`.
6. Em Authentication > URL Configuration, adicione a URL local e a URL de produção em `Site URL`/`Redirect URLs`.

## Deploy na Vercel

O projeto já possui `vercel.json` com build `npm run build`, saída `dist` e fallback para o React Router.

1. Suba o projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Na Vercel, clique em **Add New Project**, importe o repositório e mantenha o framework **Vite**.
3. Em **Settings > Environment Variables**, adicione estas variáveis para **Production**, **Preview** e **Development**:
	- `VITE_SUPABASE_URL`: URL do projeto Supabase.
	- `VITE_SUPABASE_ANON_KEY`: chave pública `anon`/publishable do Supabase.
	- `VITE_SITE_URL`: URL canônica do site, sem barra final.
4. Faça o primeiro deploy. A Vercel executará `npm run build` e publicará `dist`.
5. Depois de definir o domínio final, atualize `VITE_SITE_URL` e as URLs do Supabase para esse domínio e faça um novo deploy.

### Verificação pós-deploy

- Abra `/blog`, `/blog/<slug>`, `/admin/login` e recarregue cada página diretamente.
- Faça login com o usuário `admin` e teste upload no bucket `site-media`.
- Teste um comentário público e confirme a aprovação no painel administrativo.

Não coloque a `service_role` key no frontend, no `.env.example` ou nas variáveis `VITE_*`. Tudo com prefixo `VITE_` fica exposto no navegador; use somente a chave pública anon/publishable.

Rotas principais:

- `/blog`: lista de artigos
- `/blog/:slug`: artigo individual
- `/admin/login`: login editorial
- `/admin`: painel para autores e artigos

## Build

`npx vite build` valida a aplicação sem depender das credenciais do Supabase. O script `npm run build` também gera snapshots e HTML estático; com credenciais configuradas, ele atualiza o conteúdo publicado no momento do deploy. Sem credenciais, usa os snapshots existentes quando disponíveis.
