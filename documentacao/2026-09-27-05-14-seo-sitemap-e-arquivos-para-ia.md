# 2026-09-27 05:14 - Sistema de SEO dinâmico, sitemap completo e arquivos para IA

## O que foi feito

O portal não tinha SEO de verdade: uma única meta description estática para todas as
páginas, nenhum Open Graph, nenhum Twitter Card, nenhum canonical, nenhum dado
estruturado e um sitemap com 7 URLs escritas à mão (nenhuma vinda do banco).

Agora existe um **sistema de SEO dinâmico**: cada página monta o próprio title,
description, canonical, Open Graph, Twitter Card e dados estruturados (JSON-LD), tudo
editável pelo painel. Além disso, o sitemap virou um mapa completo gerado do banco e
foram criados o `robots.txt` dinâmico e o `llms.txt` (usado por ChatGPT, Claude e
Perplexity para entender e citar a igreja).

---

## 1. Por que o SEO é renderizado no Blade (e não no React)

O site é uma SPA: o HTML chega vazio e o conteúdo é montado por JavaScript. Se as metas
fossem só pelo `<Head>` do React, **o Google e o WhatsApp não veriam nada** — eles não
executam JavaScript.

Por isso o pacote de SEO é montado no servidor e impresso direto no
`resources/views/app.blade.php`. O React só atualiza as tags quando o usuário navega
por link (navegação client-side do Inertia não reenvia o blade).

---

## 2. `config/seo.php` — padrões do sistema

Tudo que estiver **vazio no painel** cai aqui:

| Chave | Para que serve |
|---|---|
| `titulo_padrao` / `descricao_padrao` | Title e description quando o painel está vazio |
| `palavras_chave` | Meta keywords (vêm junto das palavras extras de cada página) |
| `imagem_padrao` | Fallback da imagem de compartilhamento |
| `idioma` / `locale_open_graph` | `lang` e `og:locale` |
| `redes` | Perfis sociais usados no JSON-LD |
| `contato` | Telefone, e-mail, endereço (cidade/estado já vêm preenchidos) |
| `cultos` | **Horários de culto** → viram `openingHoursSpecification` no Google |
| `bots_bloqueados` | Quais robôs de IA/indexação liberar ou bloquear |
| `nao_indexar` | Caminhos que nunca entram no índice |
| `sitemap` | Regras do mapa (imagens, limite de notícias/produtos) |

---

## 3. `app/Services/SeoService.php` — o motor

Uma classe só, com API encadeada. O controller chama antes de responder:

```php
SeoService::atribuir(SeoService::daPagina()
    ->titulo($noticia->titulo)      // não duplica o nome se o título já citar a igreja
    ->descricao($noticia->conteudo) // corta em 160 caracteres sem quebrar palavra
    ->imagem($noticia->imagem)      // vira og:image e twitter:image
    ->tipo('article')               // og:type
    ->palavrasChave([$noticia->categoria])
    ->jsonLd([...])                 // dados estruturados
);
```

O `toArray()` devolve o pacote completo: `titulo`, `descricao`, `palavras`,
`canonical`, `imagem`, `robots`, `og`, `twitter` e `json_ld`.

Detalhes importantes:

- **Prioridade:** `configuracoes_site` > `config/seo.php`.
- **Canonical automático:** é a URL acessada, **sem query string** (não indexa
  `?utm_...` nem `?busca=`).
- **Imagem padrão:** `imagem_og` → `logo_url` → imagem hero. É convertida para URL
  absoluta, que é o que o Facebook/WhatsApp exigem.
- **`resumir()`:** corta o texto no limite, respeita o espaço e não deixa pontuação
  solta no fim.
- **`urlPrivada()`:** devolve `true` para `/admin`, `/login`, `/api`, `/notas`, `/aulas`
  etc. — é isso que aplica o `noindex` automático.
- Registro no container (`SeoService::atribuir` / `SeoService::pegar`), sem estado
  estático, então não vaza entre requisições.

---

## 4. Renderização e sincronização

- **`app/Http/Middleware/HandleInertiaRequests.php`** — compartilha `seo` com todas as
  páginas. Precisa ser **closure** (e não array pronto): o Inertia resolve as props
  *depois* do controller responder, e é aí que o controller já registrou o SEO.
  Sem isso, todas as páginas saíam com o SEO padrão.
- **`resources/views/app.blade.php`** — imprime title, description, keywords, author,
  robots, canonical, todo o bloco `og:*`, todo o bloco `twitter:*` e os scripts
  `application/ld+json`. Também `theme-color` e `apple-mobile-web-app-title`.
- **`resources/js/Components/SeoSync.tsx`** (novo, dentro do `MainLayout`) — na
  primeira carga não faz nada (o blade já acertou); nas navegações seguintes atualiza
  title, metas, canonical e JSON-LD. Assim o link copiado para o WhatsApp já sai com a
  imagem e a descrição certainas.

---

## 5. Campos editáveis no painel

Migration `2026_09_27_061000_add_seo_fields_to_configuracoes_site_table.php` (todas
colunas `nullable`): `titulo_site`, `meta_description`, `palavras_chave`, `imagem_og`,
`twitter_site`, `telefone`, `endereco_rua`, `endereco_numero`, `endereco_bairro`,
`endereco_cidade`, `endereco_estado`, `endereco_cep`.

- `ConfiguracaoSite`: campos no `$fillable` + `obterCacheado()` (cache de 10 min,
  invalidado no `saved`).
- `ConfiguracaoSiteResource` e `ConfiguracaoController` (validação com `max`).
- `AdminSettingsTab`: novo item **"SEO & Busca"**, com prévia de como o resultado
  aparece no Google, contador de caracteres, atalhos para `/sitemap.xml`,
  `/robots.txt` e `/llms.txt`, e os campos de contato/endereço.
- `ConfiguracaoController::atualizar` invalida também o cache do sitemap e do
  `llms.txt`.

> Bug corrigido de passagem: `updateSettings` no `api.ts` **não enviava os campos do
> WhatsApp** (a tela existia mas o valor nunca era salvo).

---

## 6. Sitemap completo (`/sitemap.xml`)

`SitemapController` foi reescrito. Antes: 7 URLs fixas. Agora, do banco:

- 9 páginas fixas (home, notícias, devocionais, galeria, loja, bíblia, rádio,
  regulamentos, transparência) — inclui `/loja` e `/transparencia`, que faltavam;
- notícias, devocionais, produtos (só em estoque), categorias de produto, eventos da
  agenda e regulamentos;
- `lastmod` real (do `updated_at` de cada registro), `changefreq` e `priority` por tipo;
- `xmlns:image` com as imagens da galeria, agenda, atrações, patrocinadores e produtos
  (ajuda o Google Imagens);
- escape XML com `htmlspecialchars` e `Cache-Control` de 30 min.

## 7. `robots.txt` dinâmico e `llms.txt`

**Importante:** o arquivo estático `public/robots.txt` **foi removido**. No Apache, um
arquivo existente em `public/` vence a rota do Laravel — ou seja, a rota
`GET /robots.txt` existia desde sempre e **nunca executava**, e o Google nunca recebia
a diretiva `Sitemap:`. Com o arquivo apagado, a rota passa a responder.

O `robots.txt` agora bloqueia as áreas listadas em `seo.nao_indexar`, descarta URLs com
parâmetros, tem regra por robô e aponta para o sitemap e o `llms.txt`.

O `/llms.txt` (novo, padrão llmstxt.org) responde o que a igreja é, onde fica e quais são
as páginas principais, e traz com resumo: as 15 notícias mais recentes, os 10 devocionais
mais recentes, os 10 próximos eventos da agenda (com data, hora e local) e os 20 produtos
em estoque com preço. É o formato que os buscadores de IA leem para citar a igreja com
contexto.

Observação: a agenda **não tem URL própria** — ela é uma seção da home. Por isso o
`llms.txt` aponta para `/`, e as URLs individuais são `/agenda/{id}` (que existem).

---

## 8. Páginas de detalhe (URLs próprias)

Antes, notícia/devocional/produto só existiam dentro de `/noticias`, `/devocionais` e
`/loja` — não tinham URL própria, o que deixava o sitemap raso e fazia o link de
compartilhamento dar 404 (`NewsSection.tsx:49` gerava `/noticias/{id}`, rota
inexistente).

| Rota | Página React | Dados estruturados |
|---|---|---|
| `/noticias/{noticia}` | `Public/NoticiaDetalhe.tsx` | `NewsArticle` |
| `/devocionais/{devocional}` | `Public/DevocionalDetalhe.tsx` | `Article` |
| `/agenda/{evento}` | `Public/EventoDetalhe.tsx` | `Event` (data, hora e local) |
| `/regulamentos/{regulamento}` | `Public/RegulamentoDetalhe.tsx` | — |
| `/produtos/{produto:slug}` | `Public/ProdutoDetalhe.tsx` | `Product` + `Offer` (preço e estoque) |
| `/loja/categoria/{categoria:slug}` | reaproveita `Public/Loja.tsx` | `ItemList` |

O binding de produto é **explícito por slug** (`{produto:slug}`) para não quebrar as
rotas do admin, que usam `id`. Produto fora de estoque sai com `noindex`.

Dados estruturados globais: `Church` + `LocalBusiness` (com `sameAs` das redes, endereço,
telefone e horários de culto) em todas as páginas, `WebSite` com `SearchAction` na
home, e `ImageGallery` na galeria.

---

## 9. Testes

`tests/Feature/SeoTest.php` — 11 testes: title/description/canonical/OG por página,
canonical ignorando query string, `noindex` em `/login` e `/registro`, robots com
`Disallow` e `Sitemap:`, sitemap com conteúdo do banco + `lastmod` + imagens e
produto esgotado fora, `llms.txt` listando conteúdo, `NewsArticle` com canonical
próprio, `Offer` com preço/moeda/estoque, `noindex` em produto esgotado, prioridade do
painel sobre o padrão e título sem duplicar o nome da igreja.

Rodar: `php artisan test --filter=SeoTest`

> O `tests/Feature/ExampleTest.php` continua falhando, mas já falhava antes (o sqlite
> em memória do PHPUnit não tem as tabelas do MySQL).

---

## 10. Bug encontrado durante os testes

`SitemapController` usava `->each(fn($n) => $urls[] = [...])`. **Arrow functions capturam
variáveis por valor**, então todas as URLs do conteúdo eram montadas numa cópia local e
o sitemap saía só com as páginas fixas. Trocado por closure com `use (&$urls)`.

---

## Pendente / não feito

- **Coluna `status`/rascunho** não existe em nenhuma tabela de conteúdo: tudo que o
  admin publica já entra no índice. Para ter rascunho, precisaria de migration.
- **Hreflang** (pt/en/es): o i18n é 100% client-side e não existem URLs por idioma, então
  não dá para declarar `hreflang` sem antes criar rotas `/en/...`.
- **Imagem de compartilhamento ideal (1200x630)**: o `imagem_og` aceita qualquer URL. Um
  gerador automático de thumbnail seria o próximo passo (`intervention/image` já está
  instalada e sem uso).
- **Endpoints JSON sem tag de noindex**: `/api/*` está bloqueado no robots, mas as
  respostas em si não trazem `<meta name="robots">`.
- **Sitemap não dividido**: se passar de 50.000 URLs, precisará de um sitemap index.
