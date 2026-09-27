<?php

/*
|--------------------------------------------------------------------------
| Midias
|--------------------------------------------------------------------------
|
| Fonte unica de verdade do gerenciamento de midias do site:
|
| - pastas: pastas liberadas dentro de storage/app/public (whitelist).
|   Usada no upload (UploadController) e no gerenciador (MidiaController).
|   "uploads" e o fallback para uploads antigos sem o parametro pasta.
|
| - colunas: tabelas e colunas que guardam a URL de uma midia.
|   Usada no gerenciador para avisar onde a imagem esta sendo usada,
|   corrigir as referencias ao renomear e limpar ao excluir.
|
*/

return [

    // Pastas liberadas para upload (nunca aceitar caminho fora desta lista)
    'pastas' => [
        'galeria',
        'produtos',
        'noticias',
        'eventos',
        'atracoes',
        'patrocinadores',
        'site',
        'aulas',
        'financeiro',
        'membros',
        'uploads',
    ],

    // Quantidade de arquivos por pagina no gerenciador de midias
    'por_pagina' => 24,

    // Colunas que guardam URL de midia (tabela => [coluna => rotulo do registro])
    'colunas' => [
        'galeria' => [
            'url' => 'Galeria de Fotos',
        ],
        'noticias' => [
            'imagem' => 'Notícias & Blog',
        ],
        'eventos_agenda' => [
            'imagem' => 'Agenda de Eventos',
        ],
        'atracoes' => [
            'imagem' => 'Atrações & Preletores',
        ],
        'patrocinadores' => [
            'url_imagem' => 'Patrocinadores',
        ],
        'configuracoes_site' => [
            'url_imagem_hero' => 'Imagem hero do site',
            'logo_url' => 'Logo do site',
            'url_video_fundo' => 'Vídeo de fundo',
        ],
        'produtos' => [
            'imagem_url' => 'Imagem do produto',
            'imagens_galeria' => 'Galeria do produto',
        ],
        'membros' => [
            'foto_url' => 'Membros',
        ],
        'transacoes_financeiras' => [
            'comprovante_url' => 'Comprovantes financeiros',
        ],
    ],

];
