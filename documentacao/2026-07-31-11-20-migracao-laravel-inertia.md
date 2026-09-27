# Migração para Laravel 12 + Inertia + React

Data: 2026-07-31 11:20

## Objetivo

Migrar o site original em `/site` (React + Express + Gemini) para Laravel 12 + Inertia + React na raiz do projeto, mantendo aparência e lógica, com SQLite e painel admin. O `/site` foi preservado para validação e `REGRAS.MD` foi mantido intacto.

## Decisões de arquitetura

- Páginas Inertia separadas (SPA de abas do original adaptado para navegação por rotas).
- Rotas e endpoints em PT-BR; API Resources serializam PT-BR para inglês (o frontend usa campos em inglês).
- Middlewares `auth` e `admin` aplicados nos grupos de rota (não mais nos construtores dos controllers — o Laravel 12 não expõe `$this->middleware()` no Controller base).

## O que foi feito

1. Instalação/configuração: Laravel 12.64.0, Inertia + React 19, Tailwind 4, motion, lucide-react, TypeScript, Vite 7.
2. `.env`: `APP_NAME`, `APP_LOCALE=pt_BR`, `APP_LOGS_ENABLED=true`, `APP_VERSION`, `FILESYSTEM_DISK=public`, `SESSION_DRIVER=database`, `GEMINI_API_KEY=dummy-key-for-build`.
3. 17 migrations + seeders executados (users, notícias, devocionais, eventos, galeria, regulamentos, patrocinadores, atrações, comentários).
4. 14 controllers, middlewares `Admin` e `HandleInertiaRequests`, alias `admin`, 65 rotas em `routes/web.php`.
5. 11 API Resources mapeando PT-BR → inglês (ex.: `title`←`titulo`, `dateTime`←`data_hora`, `contactName`←`nome_responsavel`).
6. Frontend reescrito: `api.ts` com endpoints Laravel e payloads mapeados; `Navbar`, `Footer`, `MainLayout` para Inertia; páginas `Home`, `Public/*`, `Auth/*`, `Admin/Dashboard`, `Errors/*`.
7. `app.blade.php` com `@inertia` e meta CSRF; `app.tsx` usa `resolvePageComponent` de `laravel-vite-plugin/inertia-helpers`.
8. `php artisan storage:link` executado.

## Correções aplicadas

- **Erro 500 em `/api/*`**: controllers chamavam `$this->middleware()` (método inexistente no Laravel 12). Removidos os construtores de 12 controllers — o middleware já é aplicado nos grupos de rota (`/admin/*` com `auth`+`admin`, `/api/notas` com `auth`).
- **Build**: `resolvePageComponent` importado de `laravel-vite-plugin/inertia-helpers` no `app.tsx`.
- `bootstrap/app.php`: closure de `$exceptions->respond` com assinatura `(Response $response, \Throwable $exception, Request $request)`.

## Internacionalização (i18n)

- **Biblioteca**: `react-i18next` v17 + `i18next` v26.
- **Idiomas**: `pt` (padrão), `en`, `es`.
- **Arquivo de dicionários**: `resources/js/i18n/index.ts` — traduz toda a interface (nav, footer, home, news, devocionais, bíblia, rádio, notas, galeria, auth, errors, admin).
- **Persistência**: idioma salvo em `localStorage("marcha_lang")` com fallback para `pt`.
- **Seletor de idioma**: Navbar tem dropdown pt/en/es que chama `i18n.changeLanguage()` e persiste a escolha.
- **Escopo**: só textos da interface são traduzidos; conteúdo do banco (títulos de notícias, descrições de eventos, etc.) permanece em PT.
- **HTML em traduções**: chaves como `home.routeP1` contêm `<strong>` e são renderizadas com `dangerouslySetInnerHTML={{ __html: t("key") }}`.
- **Interpolations**: usadas para conteúdo dinâmico (ex: `t("news.comments", { count })`).
- **Nota**: `interpolation.escapeValue: false` no i18n config para permitir tags HTML nas traduções.

## Validação realizada

- `npm run build` passa (2.3s).
- `php artisan serve --port=8010`:
  - `/`, `/noticias`, `/devocionais`, `/biblia`, `/radio`, `/galeria`, `/regulamentos`, `/login` → 200.
  - `/notas`, `/admin` → 302 para login (sem sessão); 200 após login.
  - `/api/noticias`, `/api/eventos`, `/api/devocionais`, `/api/galeria`, `/api/regulamentos`, `/api/patrocinadores`, `/api/atracoes`, `/api/configuracoes` → 200 com JSON em inglês.
  - Login admin (email/senha) → 302; `/notas` e `/admin` 200 com cookie de sessão.
  - `/admin/usuarios` → 200 com Resource.

## Credenciais de seed

- Admin: `maximoemsolucoes@gmail.com` / `admin123`
- Usuário: `user@holyhub.com` / `user123`

## Pendências / próximos passos

- Validar troca de idioma no navegador (PT/EN/ES) — o seletor na Navbar deve persistir em localStorage e atualizar toda a interface.
- Testar fluxos de escrita autenticados no painel admin (CRUD de notícias, upload, caravanas) via interface.
- Validar páginas no navegador (console/erros visuais) e comparar com `/site`.
- Substituir `GEMINI_API_KEY` dummy pela chave real e revalidar recursos Gemini.
- Deploy via SSH (ver `REGRAS.MD`): `maxos@maxos.com.br`, `REMOTE_PATH=/home/maxos/public_html`.
