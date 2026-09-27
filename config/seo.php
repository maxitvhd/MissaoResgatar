<?php

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
|
| Padroes do sistema de SEO do portal. O que estiver salvo em
| configuracoes_site (editavel pelo painel em Configuracoes) tem prioridade
| sobre estes valores - aqui ficam so os padroes e as regras tecnicas.
|
*/

return [

    // Identidade exibida nos resultados de busca e ao compartilhar
    'titulo_padrao' => 'Missão Resgatar | Igreja em Itaquaquecetuba - SP',
    'descricao_padrao' => 'Missão Resgatar, uma igreja viva resgatando vidas em Itaquaquecetuba. Notícias, devocionais, agenda de cultos, galeria de fotos, loja e rádio online 24h.',
    'palavras_chave' => [
        'igreja em Itaquaquecetuba',
        'Missão Resgatar',
        'igreja cristã',
        'culto',
        'devocional diário',
        'bíblia online',
        'rádio cristã',
        'encontro de jovens',
    ],

    // Imagem usada quando a pagina nao tem imagem propria (1200x630 e o ideal p/ redes sociais)
    'imagem_padrao' => null,

    // Idiomas
    'idioma' => 'pt-BR',
    'locale_open_graph' => 'pt_BR',

    // Perfis nas redes sociais (usados no JSON-LD e no rodape). Vazio = usa configuracoes_site
    'redes' => [
        'instagram' => null,
        'facebook'  => null,
        'youtube'   => null,
        'whatsapp'  => null,
    ],

    // Contato e localizacao (vazio = nao gera no JSON-LD, evitando dados falsos)
    'contato' => [
        'telefone'  => null,
        'email'     => 'contato@mresgatar.com.br',
        'rua'       => null,
        'numero'    => null,
        'bairro'    => null,
        'cidade'    => 'Itaquaquecetuba',
        'estado'    => 'SP',
        'cep'       => null,
        'pais'      => 'BR',
    ],

    // Horarios de culto (viram JSON-LD e ajudam o Google a exibir rich snippet)
    'cultos' => [
        ['dia' => 'Domingo', 'hora' => '19:00', 'nome' => 'Culto da Família'],
        ['dia' => 'Quarta', 'hora' => '19:30', 'nome' => 'Ensino e Oração'],
        ['dia' => 'Sábado',  'hora' => '19:30', 'nome' => 'Rede de Jovens'],
    ],

    // Perfis de bot bloqueados (true = bloquear, false = liberar)
    'bots_bloqueados' => [
        'GPTBot'            => false,
        'OAI-SearchBot'     => false,
        'ChatGPT-User'      => false,
        'ClaudeBot'         => false,
        'Claude-User'       => false,
        'anthropic-ai'      => false,
        'PerplexityBot'     => false,
        'Perplexity-User'   => false,
        'Google-Extended'   => false,
        'Applebot-Extended' => false,
        'CCBot'             => false,
        'Bingbot'           => false,
        'DuckDuckBot'       => false,
    ],

    // Caminhos que nunca devem ser indexados
    'nao_indexar' => [
        'admin',
        'login',
        'registro',
        'logout',
        'notas',
        'aulas',
        'api',
        'up',
        'storage',
        'build',
    ],

    // Prioridade e frequencia de atualizacao no sitemap
    'sitemap' => [
        'imagens' => true, // inclui <image:image> da galeria
        'ultimas_noticias' => true,
        'produtos_por_pagina' => 1000,
    ],

];
