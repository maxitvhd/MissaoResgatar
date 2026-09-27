<?php

namespace Tests\Feature;

use App\Models\CategoriaProduto;
use App\Models\ConfiguracaoSite;
use App\Models\Devocional;
use App\Models\Noticia;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    /** URL base do site nos testes (vem do APP_URL) */
    private function base(): string
    {
        return rtrim(config('app.url'), '/');
    }

    public function test_pagina_publica_tem_titulo_descricao_canonical_e_open_graph(): void
    {
        // Sem imagem no banco cairiamos no padrao, entao garantimos uma
        ConfiguracaoSite::obter()->update(['url_imagem_hero' => 'https://exemplo.com/hero.jpg']);

        $html = $this->get('/noticias')->getContent();

        $this->assertStringContainsString('property="og:image" content="https://exemplo.com/hero.jpg"', $html);

        $this->assertStringContainsString('<title inertia>Notícias e Blog | Missão Resgatar</title>', $html);
        $this->assertStringContainsString('<meta name="description"', $html);
        $this->assertStringContainsString('<link rel="canonical"', $html);
        $this->assertStringContainsString('property="og:title"', $html);
        $this->assertStringContainsString('property="og:image"', $html);
        $this->assertStringContainsString('name="twitter:card"', $html);
        $this->assertStringContainsString('application/ld+json', $html);
    }

    public function test_canonical_ignora_query_string(): void
    {
        $html = $this->get('/noticias?utm_source=facebook&busca= Culto')->getContent();

        // Canonical não pode carregar parâmetros de busca/utm
        $this->assertStringContainsString('<link rel="canonical" href="' . $this->base() . '/noticias">', $html);
        $this->assertStringNotContainsString('canonical" href="' . $this->base() . '/noticias?utm', $html);
    }

    public function test_areas_privadas_sao_noindex(): void
    {
        foreach (['/login', '/registro'] as $url) {
            $html = $this->get($url)->getContent();
            $this->assertStringContainsString('content="noindex, nofollow"', $html, "Falhou em {$url}");
        }
    }

    public function test_api_nao_e_indexavel_no_robots(): void
    {
        $robots = $this->get('/robots.txt')->getContent();

        $this->assertStringContainsString('User-agent: *', $robots);
        $this->assertStringContainsString('Disallow: /admin', $robots);
        $this->assertStringContainsString('Disallow: /api', $robots);
        $this->assertStringContainsString('Sitemap: ' . $this->base() . '/sitemap.xml', $robots);
        $this->assertStringContainsString('Sitemap: ' . $this->base() . '/llms.txt', $robots);
    }

    public function test_sitemap_traz_conteudo_do_banco_com_lastmod(): void
    {
        $noticia = Noticia::create([
            'titulo'    => 'Notícia de Teste',
            'conteudo'  => 'Conteúdo da notícia.',
            'autor'     => 'Equipe Missão Resgatar',
            'categoria' => 'Geral',
        ]);
        $devocional = Devocional::create([
            'titulo'    => 'Devocional de Teste',
            'conteudo'  => 'Mensagem do devocional.',
            'escritura' => 'João 3:16',
            'categoria' => 'Edificacao',
        ]);
        $produto = Produto::create([
            'nome'       => 'Camiseta Teste',
            'descricao'  => 'Uma camiseta da igreja.',
            'preco'      => 59.90,
            'slug'       => 'camiseta-teste-1234',
            'em_estoque' => true,
        ]);
        $categoria = CategoriaProduto::create([
            'nome' => 'Camisetas',
            'slug' => 'camisetas-1234',
        ]);

        $xml = $this->get('/sitemap.xml')->getContent();

        $base = $this->base();
        $this->assertStringContainsString('<loc>' . $base . '/noticias/' . $noticia->id . '</loc>', $xml);
        $this->assertStringContainsString('<loc>' . $base . '/devocionais/' . $devocional->id . '</loc>', $xml);
        $this->assertStringContainsString('<loc>' . $base . '/produtos/camiseta-teste-1234</loc>', $xml);
        $this->assertStringContainsString('<loc>' . $base . '/loja/categoria/camisetas-1234</loc>', $xml);
        $this->assertStringContainsString('<lastmod>', $xml);
        $this->assertStringContainsString('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"', $xml);

        // Produto sem estoque não entra no sitemap
        $produto->update(['em_estoque' => false, 'slug' => 'fora-de-estoque-9999']);
        \Illuminate\Support\Facades\Cache::forget(\App\Http\Controllers\SitemapController::CACHE_SITEMAP);
        $this->assertStringNotContainsString(
            'fora-de-estoque-9999',
            $this->get('/sitemap.xml')->getContent()
        );
    }

    public function test_llms_txt_lista_paginas_e_conteudo(): void
    {
        Noticia::create([
            'titulo'    => 'Aviso Importante',
            'conteudo'  => 'Conteúdo do aviso para a IA entender o site.',
            'autor'     => 'Equipe Missão Resgatar',
            'categoria' => 'Geral',
        ]);

        $llms = $this->get('/llms.txt')->getContent();

        $this->assertStringContainsString('# Missão Resgatar', $llms);
        $this->assertStringContainsString('## Páginas principais', $llms);
        $this->assertStringContainsString('## Conteúdo recente', $llms);
        $this->assertStringContainsString('Aviso Importante', $llms);
        $this->assertStringContainsString('Itaquaquecetuba', $llms);
    }

    public function test_noticia_tem_article_json_ld_e_canonical_proprio(): void
    {
        $noticia = Noticia::create([
            'titulo'    => 'Culto Especial',
            'conteudo'  => 'Vamos celebrar juntos neste domingo.',
            'autor'     => 'Equipe Missão Resgatar',
            'categoria' => 'Cultos',
        ]);

        $html = $this->get('/noticias/' . $noticia->id)->getContent();

        $this->assertStringContainsString('<title inertia>Culto Especial | Missão Resgatar</title>', $html);
        $this->assertStringContainsString('property="og:type" content="article"', $html);
        $this->assertStringContainsString('"@type":"NewsArticle"', $html);
        $this->assertStringContainsString('"headline":"Culto Especial"', $html);
        $this->assertStringContainsString(
            '<link rel="canonical" href="' . $this->base() . '/noticias/' . $noticia->id . '">',
            $html
        );
    }

    public function test_produto_tem_offer_json_ld(): void
    {
        $produto = Produto::create([
            'nome'      => 'Moleton Premium',
            'descricao' => 'Moleton quente da igreja.',
            'preco'     => 120.00,
            'slug'      => 'moleton-premium-7777',
            'em_estoque'=> true,
        ]);

        $html = $this->get('/produtos/' . $produto->slug)->getContent();

        $this->assertStringContainsString('property="og:type" content="product"', $html);
        $this->assertStringContainsString('"@type":"Product"', $html);
        $this->assertStringContainsString('"priceCurrency":"BRL"', $html);
        $this->assertStringContainsString('schema.org/InStock', $html);
    }

    public function test_produto_fora_de_estoque_e_noindex(): void
    {
        $produto = Produto::create([
            'nome'       => 'Item Esgotado',
            'preco'      => 10.00,
            'slug'       => 'item-esgotado-8888',
            'em_estoque' => false,
        ]);

        $html = $this->get('/produtos/' . $produto->slug)->getContent();

        $this->assertStringContainsString('content="noindex, nofollow"', $html);
    }

    public function test_configuracao_do_painel_tem_precedencia_sobre_o_padrao(): void
    {
        ConfiguracaoSite::obter()->update([
            'titulo_site'      => 'Título Customizado',
            'meta_description' => 'Descrição customizada do site da igreja.',
            'palavras_chave'   => 'igreja, culto, itaquaquecetuba',
        ]);

        $html = $this->get('/')->getContent();

        // Titulo do painel e usado exatamente como digitado (sem sufixar a marca)
        $this->assertStringContainsString('<title inertia>Título Customizado</title>', $html);
        $this->assertStringContainsString('Descrição customizada do site da igreja.', $html);
        $this->assertStringContainsString('igreja, culto, itaquaquecetuba', $html);
    }

    public function test_titulo_nao_duplica_o_nome_da_igreja(): void
    {
        $noticia = Noticia::create([
            'titulo'   => 'Missão Resgatar celebra aniversário',
            'conteudo' => 'Conteúdo.',
            'autor'    => 'Equipe Missão Resgatar',
        ]);

        $html = $this->get('/noticias/' . $noticia->id)->getContent();

        $this->assertStringContainsString('<title inertia>Missão Resgatar celebra aniversário</title>', $html);
        $this->assertStringNotContainsString('Missão Resgatar | Missão Resgatar', $html);
    }
}
