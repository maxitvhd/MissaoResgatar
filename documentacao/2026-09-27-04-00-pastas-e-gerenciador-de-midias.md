# 2026-09-27 04:00 - Pastas de storage por tipo + Gerenciador de Mídias

## O que foi feito

Duas alterações ligadas:

1. **Pastas por tipo de upload** — cada tipo de arquivo do site passou a ter sua
   própria pasta dentro de `storage/app/public` (antes tudo ia para uma pasta única
   `uploads/`).
2. **Gerenciador de Mídias** — nova aba no admin para listar, renomear e excluir
   os arquivos do site, com aviso de onde cada imagem está sendo usada.

---

## 1. Pastas por tipo

### Como funciona

O upload continua nas mesmas rotas (`POST /admin/upload` e `POST /admin/upload/lote`).
A diferença é que agora o frontend manda um campo `pasta` dizendo para qual pasta
o arquivo deve ir. O backend **nunca aceita essa pasta direto**: ela é validada
contra uma lista fixa (whitelist) e, se não estiver na lista, o upload volta 422.

Fallback: se o campo `pasta` não vier, o arquivo cai em `uploads/` (mantém
compatibilidade com a pasta antiga e com uploads já existentes).

### Whitelist (fonte única de verdade)

Definida em `config/midias.php`, na chave `pastas`:

| `pasta` | Onde fica | Quem usa |
|---|---|---|
| `galeria` | `storage/app/public/galeria/` | Fotos de álbuns e fotos avulsas |
| `produtos` | `storage/app/public/produtos/` | `produtos.imagem_url` e `produtos.imagens_galeria` |
| `noticias` | `storage/app/public/noticias/` | `noticias.imagem` |
| `eventos` | `storage/app/public/eventos/` | `eventos_agenda.imagem` |
| `atracoes` | `storage/app/public/atracoes/` | `atracoes.imagem` |
| `patrocinadores` | `storage/app/public/patrocinadores/` | `patrocinadores.url_imagem` |
| `site` | `storage/app/public/site/` | Logo, imagem hero, vídeo de fundo |
| `aulas` | `storage/app/public/aulas/` | Materiais das aulas fechadas |
| `financeiro` | `storage/app/public/financeiro/` | `transacoes_financeiras.comprovante_url` |
| `membros` | `storage/app/public/membros/` | `membros.foto_url` |
| `uploads` | `storage/app/public/uploads/` | Fallback (uploads antigos) |

As URLs públicas continuam as mesmas, só muda o caminho:
`/storage/uploads/x.jpg` → `/storage/galeria/x.jpg`.

Não foi preciso criar symlink, mudar `.env` ou `.gitignore`: o `public/storage`
já aponta para `storage/app/public` e o `storage/app/.gitignore` já ignora tudo
que está ali dentro.

### Arquivos alterados

- `config/midias.php` (novo) — `pastas`, `por_pagina` e `colunas`.
- `app/Http/Controllers/UploadController.php` — método privado `resolverPasta()`;
  os 3 pontos de gravação (multipart, base64 e lote) usam a pasta validada.
  Também foram liberados `webp, pdf, doc, docx, xls, xlsx, ppt, pptx` nos mimes
  (o upload de material de aula estava **quebrado** porque só aceitava imagem e vídeo).
- `resources/js/lib/api.ts` — `uploadImage()`, `uploadFile()` e
  `uploadMultipleFiles()` ganharam o 3º parâmetro opcional `pasta`.
- 12 pontos de chamada passaram a enviar a pasta:

| Arquivo | Input | `pasta` |
|---|---|---|
| `AdminDashboard.tsx` | notícia | `noticias` |
| `AdminDashboard.tsx` | evento | `eventos` |
| `AdminDashboard.tsx` | álbum (lote) | `galeria` |
| `AdminDashboard.tsx` | foto avulsa | `galeria` |
| `AdminDashboard.tsx` | atração | `atracoes` |
| `AdminDashboard.tsx` | patrocinador | `patrocinadores` |
| `Admin/AdminLojaTab.tsx` | produto (capa e lote) | `produtos` |
| `Admin/AdminSettingsTab.tsx` | logo, vídeo, hero | `site` |
| `Admin/AdminAulasTab.tsx` | material da aula | `aulas` |

---

## 2. Gerenciador de Mídias

Nova aba **"Gerenciador de Mídias"** no grupo *Conteúdo & Mídia* do admin.

### Backend — `app/Http/Controllers/MidiaController.php` (novo)

Rotas (dentro do grupo `admin`, que já tem `auth` + `admin`):

```php
Route::get('/midias',          [MidiaController::class, 'index']);
Route::put('/midias/renomear', [MidiaController::class, 'renomear']);
Route::delete('/midias',       [MidiaController::class, 'excluir']);
```

**`index`** — `GET /admin/midias?pasta=&busca=&pagina=`
Lê os arquivos do disco com `Storage::disk('public')->allFiles()`, ignora arquivos
ocultos (`.gitignore`), filtra por busca no nome, ordena do mais novo para o mais
antigo e pagina 24 por página. Traz também a contagem de cada pasta para o menu.

O aviso de uso ("EM USO") é calculado **só nos 24 arquivos da página atual**, com
uma consulta por tabela — por isso a tela continua rápida mesmo com milhares de arquivos.

**`renomear`** — `PUT /admin/midias/renomear`
O banco guarda a **URL absoluta** da imagem (ex.: `http://.../storage/galeria/culto.jpg`).
Então, só renomear o arquivo quebraria todas as imagens já publicadas. Por isso o
rename faz duas coisas:

1. `Storage::move()` do arquivo (mantém a pasta e a extensão, sanitiza o nome com `Str::slug`);
2. troca a URL antiga pela nova em **todas as colunas de midia** listadas em
   `config/midias.colunas`, inclusive as que são JSON
   (ex.: `produtos.imagens_galeria` — a URL é trocada dentro do array e os outros
   itens do array são preservados).

A troca é feita em PHP (linha a linha), sem `REPLACE` em SQL: só as linhas que
realmente contêm o nome do arquivo são tocadas.

**`excluir`** — `DELETE /admin/midias`
Se a mídia está em uso, responde **409** com a lista de onde ela é usada
(ex.: "Galeria de Fotos: Culto Domingo") e o botão de apagar fica bloqueado até
marcar *Apagar mesmo assim*. Confirmando, o arquivo é apagado **e as referências são
limpas**, para não sobrar registro apontando para arquivo morto.

Ressalva importante: colunas **NOT NULL** (ex.: `galeria.url`) não aceitam `null`.
Nesses casos o valor vira string vazia e o registro aparece na lista `sem_imagem`
da resposta, que o frontend mostra num alerta para você corrigir manualmente.
Isso evitou mexer no schema do banco.

### Segurança

- `validarCaminho()` recusa `..`, caminho absoluto, byte nulo e qualquer pasta fora
  da whitelist — o mesmo método protege renomear e excluir (sem path traversal).
- O novo nome não aceita `/`, `..` nem barra invertida; a extensão é sempre a do
  arquivo original.
- Todas as rotas dentro do grupo `admin` (`auth` + middleware `admin`).
- Logs numerados via `LogService` (respeita `APP_LOGS_ENABLED` do `.env`).

### Frontend

- `resources/js/Components/Admin/AdminMidiasTab.tsx` (novo) — menu de pastas com
  contador, busca com debounce de 400ms, grid com preview, e por arquivo:
  copiar URL, abrir, renomear e excluir. Paginação no rodapé.
- `resources/js/lib/api.ts` — `fetchMedias()`, `renameMedia()`, `deleteMedia()`.
- `resources/js/types/index.ts` — interfaces `MediaFile`, `MediaUsage`, `MediaList`.
- `AdminDashboard.tsx` — novo id de sub-tab `midias` e o item no grupo
  *Conteúdo & Mídia* (ícone `Images`).

---

## 3. Testes

`tests/Feature/MidiaTest.php` (novo, 11 testes) cobre:

- upload cria a pasta correta e, sem `pasta`, cai em `uploads/`;
- pasta fora da whitelist é recusada (422);
- listagem mostra onde a mídia está sendo usada;
- renomear move o arquivo e corrige a URL no banco;
- renomear corrige o array JSON de `produtos.imagens_galeria` sem quebrar os outros itens;
- excluir bloqueia mídia em uso (409) e só apaga com confirmação;
- path traversal (`../../.env`) é bloqueado;
- rota exige usuário admin.

Rodar: `php artisan test --filter=MidiaTest`

> O `tests/Feature/ExampleTest.php` continua falhando, mas já falhava antes desta
> alteração (o sqlite em memória do PHPUnit não tem as tabelas do banco MySQL).

---

## Pendente / não feito

- As 4 mídias antigas em `storage/app/public/uploads/` **não** foram movidas para as
  pastas novas (mover exigiria atualizar as URLs no banco). Seguem funcionando em `uploads/`.
- Apagar um registro (ex.: um produto) ainda **não** apaga o arquivo do disco:
  os dois pontos estão em `LojaController::excluirProduto` e `GaleriaController::excluir`.
  Agora dá para usar o Gerenciador de Mídias para limpar esses arquivos órfãos.
- `intervention/image` está instalada no projeto mas continua sem uso (sem thumbnails).
