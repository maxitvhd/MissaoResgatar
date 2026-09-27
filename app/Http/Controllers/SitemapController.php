<?php

namespace App\Http\Controllers;

use App\Models\Atracao;
use App\Models\CategoriaProduto;
use App\Models\Devocional;
use App\Models\EventoAgenda;
use App\Models\Galeria;
use App\Models\Noticia;
use App\Models\Patrocinador;
use App\Models\Produto;
use App\Models\Regulamento;
use App\Services\LogService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Sitemap XML completo do portal, gerado a partir do banco.
 *
 * Inclui paginas fixas + todo o conteudo publico (noticias, devocionais,
 * agenda, produtos, galeria, regulamentos, atracoes e patrocinadores) com
 * lastmod, prioridade, frequencia e as imagens da galeria.
 */
class SitemapController extends Controller
{
    // Chave do cache do XML (invalidada ao salvar as configuracoes do site)
    public const CACHE_SITEMAP = 'seo_sitemap_xml';
    private const MINUTOS_CACHE = 30;

    /**
     * Gera o sitemap.xml com todas as URLs publicas do site.
     */
    public function index(): Response
    {
        // O XML so muda quando muda conteudo, entao o cache evita consultas a cada robo
        $xml = Cache::remember(self::CACHE_SITEMAP, self::MINUTOS_CACHE * 60, function () {
            return $this->montarXml();
        });

        LogService::info('1 - sitemap.xml gerado', ['bytes' => strlen($xml)]);

        return response($xml, 200, [
            'Content-Type'  => 'application/xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=1800',
        ]);
    }

    /**
     * Monta o XML a partir das paginas fixas e do conteudo do banco.
     */
    private function montarXml(): string
    {
        $base = rtrim(config('app.url'), '/');
        $urls = [];

        // 1 - Paginas fixas (prioridade e frequencia por pagina)
        $paginas = [
            '/'               => ['freq' => 'daily',   'prio' => '1.0',  'ultima' => now()],
            '/noticias'       => ['freq' => 'hourly',  'prio' => '0.9',  'ultima' => Noticia::max('updated_at')],
            '/devocionais'      => ['freq' => 'daily',   'prio' => '0.8',  'ultima' => Devocional::max('updated_at')],
            '/galeria'        => ['freq' => 'weekly',  'prio' => '0.7',  'ultima' => Galeria::max('updated_at')],
            '/loja'           => ['freq' => 'daily',   'prio' => '0.8',  'ultima' => Produto::max('updated_at')],
            '/biblia'         => ['freq' => 'monthly', 'prio' => '0.6',  'ultima' => null],
            '/radio'          => ['freq' => 'weekly',  'prio' => '0.6',  'ultima' => null],
            '/regulamentos'   => ['freq' => 'monthly', 'prio' => '0.5',  'ultima' => Regulamento::max('updated_at')],
            '/transparencia'  => ['freq' => 'monthly', 'prio' => '0.5',  'ultima' => null],
        ];

        foreach ($paginas as $caminho => $meta) {
            $urls[] = [
                'loc'      => $base . $caminho,
                'ultima'   => $meta['ultima'],
                'freq'     => $meta['freq'],
                'prio'     => $meta['prio'],
            ];
        }

        // 2 - Noticias
        if (config('seo.sitemap.ultimas_noticias', true)) {
            Noticia::orderByDesc('updated_at')->limit(2000)->get(['id', 'updated_at'])
                ->each(function ($n) use (&$urls, $base) {
                    $urls[] = [
                        'loc'    => $base . '/noticias/' . $n->id,
                        'ultima' => $n->updated_at,
                        'freq'   => 'weekly',
                        'prio'   => '0.7',
                    ];
                });
        }

        // 3 - Devocionais
        Devocional::orderByDesc('updated_at')->limit(2000)->get(['id', 'updated_at'])
            ->each(function ($d) use (&$urls, $base) {
                $urls[] = [
                    'loc'    => $base . '/devocionais/' . $d->id,
                    'ultima' => $d->updated_at,
                    'freq'   => 'weekly',
                    'prio'   => '0.7',
                ];
            });

        // 4 - Produtos (somente os a venda; slug ja existe e e unico no banco)
        Produto::where('em_estoque', true)->orderByDesc('updated_at')
            ->limit((int) config('seo.sitemap.produtos_por_pagina', 1000))
            ->get(['slug', 'updated_at'])
            ->each(function ($p) use (&$urls, $base) {
                $urls[] = [
                    'loc'    => $base . '/produtos/' . $p->slug,
                    'ultima' => $p->updated_at,
                    'freq'   => 'weekly',
                    'prio'   => '0.8',
                ];
            });

        // 5 - Categorias de produto
        CategoriaProduto::get(['slug', 'updated_at'])
            ->each(function ($c) use (&$urls, $base) {
                $urls[] = [
                    'loc'    => $base . '/loja/categoria/' . $c->slug,
                    'ultima' => $c->updated_at,
                    'freq'   => 'weekly',
                    'prio'   => '0.6',
                ];
            });

        // 6 - Eventos da agenda
        EventoAgenda::orderBy('data_hora')->get(['id', 'updated_at'])
            ->each(function ($e) use (&$urls, $base) {
                $urls[] = [
                    'loc'    => $base . '/agenda/' . $e->id,
                    'ultima' => $e->updated_at,
                    'freq'   => 'daily',
                    'prio'   => '0.6',
                ];
            });

        // 7 - Regulamentos
        Regulamento::get(['id', 'updated_at'])
            ->each(function ($r) use (&$urls, $base) {
                $urls[] = [
                    'loc'    => $base . '/regulamentos/' . $r->id,
                    'ultima' => $r->updated_at,
                    'freq'   => 'yearly',
                    'prio'   => '0.4',
                ];
            });

        // 8 - Atrocoes e patrocinadores ficam na home (paginas ancoradas),
        //     por isso entram como imagens do sitemap
        $imagens = [];
        if (config('seo.sitemap.imagens', true)) {
            $imagens = $this->imagensDoConteudo();
        }

        // 9 - Monta o XML
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"";
        $xml .= " xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= '    <loc>' . $this->escapar($url['loc']) . "</loc>\n";

            if (!empty($url['ultima'])) {
                $xml .= '    <lastmod>' . \Illuminate\Support\Carbon::parse($url['ultima'])->toAtomString() . "</lastmod>\n";
            }
            if (!empty($url['freq'])) {
                $xml .= '    <changefreq>' . $url['freq'] . "</changefreq>\n";
            }
            if (!empty($url['prio'])) {
                $xml .= '    <priority>' . $url['prio'] . "</priority>\n";
            }

            // Imagens relacionadas a pagina (ajuda o Google Imagens)
            foreach ($imagens[$url['loc']] ?? [] as $img) {
                $xml .= "    <image:image>\n";
                $xml .= '      <image:loc>' . $this->escapar($img) . "</image:loc>\n";
                $xml .= "    </image:image>\n";
            }

            $xml .= "  </url>\n";
        }

        $xml .= "</urlset>\n";

        return $xml;
    }

    /**
     * Mapa de pagina -> imagens do banco (galeria, agenda, atracoes, patrocinadores).
     */
    private function imagensDoConteudo(): array
    {
        $mapa = [];

        $adicionar = function (string $pagina, ?string $imagem) use (&$mapa) {
            if (!empty($imagem)) {
                $mapa[$pagina][] = $imagem;
            }
        };

        // Imagens da galeria vao na pagina /galeria
        foreach (Galeria::get(['url']) as $foto) {
            $adicionar(rtrim(config('app.url'), '/') . '/galeria', $foto->url);
        }

        // Imagens da agenda
        foreach (EventoAgenda::whereNotNull('imagem')->get(['id', 'imagem']) as $evento) {
            $adicionar(rtrim(config('app.url'), '/') . '/agenda/' . $evento->id, $evento->imagem);
        }

        // Imagens das atracoes
        foreach (Atracao::whereNotNull('imagem')->get(['imagem']) as $atracao) {
            $adicionar(rtrim(config('app.url'), '/') . '/', $atracao->imagem);
        }

        // Logos dos patrocinadores
        foreach (Patrocinador::whereNotNull('url_imagem')->get(['url_imagem']) as $patrocinador) {
            $adicionar(rtrim(config('app.url'), '/') . '/', $patrocinador->url_imagem);
        }

        // Imagem principal dos produtos
        foreach (Produto::where('em_estoque', true)->whereNotNull('imagem_url')->get(['slug', 'imagem_url']) as $produto) {
            $adicionar(rtrim(config('app.url'), '/') . '/produtos/' . $produto->slug, $produto->imagem_url);
        }

        return $mapa;
    }

    /**
     * Escapa caracteres especiais do XML.
     */
    private function escapar(?string $valor): string
    {
        return htmlspecialchars((string) $valor, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
