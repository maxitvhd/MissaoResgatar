<?php

namespace App\Http\Controllers;

use App\Models\Atracao;
use App\Models\ConfiguracaoSite;
use App\Models\Devocional;
use App\Models\EventoAgenda;
use App\Models\Galeria;
use App\Models\Noticia;
use App\Models\Patrocinador;
use App\Models\Regulamento;
use App\Http\Resources\AtracaoResource;
use App\Http\Resources\ConfiguracaoSiteResource;
use App\Http\Resources\DevocionalResource;
use App\Http\Resources\EventoAgendaResource;
use App\Http\Resources\GaleriaResource;
use App\Http\Resources\NoticiaResource;
use App\Http\Resources\PatrocinadorResource;
use App\Http\Resources\RegulamentoResource;
use App\Services\LogService;
use App\Services\NoticiasApiService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador das paginas publicas (frontend Inertia).
 * Renderiza as views React com os dados do banco via Inertia.
 *
 * Cada metodo registra o SEO da pagina (titulo, descricao, Open Graph,
 * Twitter Card e dados estruturados) antes de devolver a view.
 */
class PaginaController extends Controller
{
    /**
     * Home - feed com noticias, devocionais, eventos, atracoes e configs.
     */
    public function home(NoticiasApiService $noticiasApi)
    {
        LogService::info('1 - renderizando pagina home');

        // A home usa o titulo/descricao globais (configuracoes_site ou config/seo.php)
        SeoService::atribuir(SeoService::daPagina()
            ->jsonLd($this->jsonLdWebSite()));

        $apiDados = $noticiasApi->obterNoticias(pagina: 1, limite: 6);
        $noticias = !empty($apiDados['noticias']) 
            ? $apiDados['noticias'] 
            : NoticiaResource::collection(Noticia::with('comentarios')->orderByDesc('created_at')->get());

        return Inertia::render('Home', [
            'noticias'   => $noticias,
            'devocionais'=> DevocionalResource::collection(Devocional::orderByDesc('created_at')->get()),
            'eventos'    => EventoAgendaResource::collection(EventoAgenda::orderBy('data_hora')->get()),
            'atracoes'   => AtracaoResource::collection(Atracao::orderBy('horario')->get()),
            'patrocinadores' => PatrocinadorResource::collection(Patrocinador::orderBy('nome')->get()),
            'regulamentos'   => RegulamentoResource::collection(Regulamento::orderBy('categoria')->get()),
            'configuracoes'  => new ConfiguracaoSiteResource(ConfiguracaoSite::obter()),
        ]);
    }

    /**
     * Secao de noticias alimentadas via API da IA (maximo.tec.br).
     */
    public function noticias(Request $request, NoticiasApiService $noticiasApi)
    {
        LogService::info('1 - renderizando pagina de noticias');

        $pagina = $request->integer('pagina', 1);
        $categoria = $request->input('categoria');
        $busca = $request->input('busca');

        $apiDados = $noticiasApi->obterNoticias(pagina: $pagina, categoria: $categoria, busca: $busca, limite: 12);
        
        $noticias = !empty($apiDados['noticias'])
            ? $apiDados['noticias']
            : NoticiaResource::collection(Noticia::with('comentarios')->orderByDesc('created_at')->get());

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Notícias & Atualidades')
            ->descricao('Acompanhe as notícias e atualidades do reino, igreja e mundo cristão atualizadas diariamente.')
            ->palavrasChave(['notícias', 'atualidades', 'mundo cristão', 'igreja', 'fé']));

        return Inertia::render('Public/Noticias', [
            'noticias' => $noticias,
            'meta' => [
                'total' => $apiDados['total'] ?? count($noticias),
                'pagina' => $apiDados['pagina'] ?? 1,
                'ultima_pagina' => $apiDados['ultima_pagina'] ?? 1,
            ],
            'categorias' => $noticiasApi->obterCategorias(),
        ]);
    }

    /**
     * Detalhe de uma noticia (indexavel - via API da IA ou banco local).
     */
    public function noticiaDetalhe(string $slugOrId, NoticiasApiService $noticiasApi)
    {
        LogService::info('1 - renderizando noticia', ['slug_ou_id' => $slugOrId]);

        $itemNoticia = $noticiasApi->obterNoticia($slugOrId);

        if (!$itemNoticia) {
            // Fallback para o banco local
            $local = Noticia::where('id', $slugOrId)->first();
            if ($local) {
                $local->load('comentarios');
                $itemNoticia = (new NoticiaResource($local))->resolve();
            }
        }

        if (!$itemNoticia) {
            abort(404, 'Notícia não encontrada');
        }

        SeoService::atribuir(SeoService::daPagina()
            ->titulo($itemNoticia['title'] ?? $itemNoticia['titulo'] ?? 'Notícia')
            ->descricao($itemNoticia['summary'] ?? $itemNoticia['content'] ?? '')
            ->imagem($itemNoticia['image'] ?? null)
            ->tipo('article')
            ->palavrasChave([$itemNoticia['category'] ?? 'Geral'])
            ->jsonLd(array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'NewsArticle',
                'headline' => $itemNoticia['title'] ?? '',
                'description' => SeoService::daPagina()->resumir($itemNoticia['summary'] ?? $itemNoticia['content'] ?? '', 200),
                'image' => $itemNoticia['image'] ?? null,
                'datePublished' => $itemNoticia['date'] ?? null,
                'author' => [
                    '@type' => 'Organization',
                    'name' => $itemNoticia['author'] ?? 'IA Notícias',
                ],
                'articleSection' => $itemNoticia['category'] ?? 'Geral',
            ])));

        return Inertia::render('Public/NoticiaDetalhe', [
            'noticia' => $itemNoticia,
        ]);
    }

    /**
     * Secao de devocionais.
     */
    public function devocionais()
    {
        LogService::info('1 - renderizando pagina de devocionais');

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Devocionais Diários')
            ->descricao('Mensagens bíblicas diárias para fortalecer a sua fé. Reflexão, escritura e oração todos os dias.')
            ->palavrasChave(['devocional diário', 'reflexão bíblica', 'oração diaria']));

        return Inertia::render('Public/Devocionais', [
            'devocionais' => DevocionalResource::collection(Devocional::orderByDesc('created_at')->get()),
        ]);
    }

    /**
     * Detalhe de um devocional (URL propria, indexavel).
     */
    public function devocionalDetalhe(Devocional $devocional)
    {
        LogService::info('1 - renderizando devocional', ['id' => $devocional->id]);

        SeoService::atribuir(SeoService::daPagina()
            ->titulo($devocional->titulo)
            ->descricao($devocional->conteudo)
            ->palavrasChave([$devocional->categoria])
            ->jsonLd(array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => $devocional->titulo,
                'description' => SeoService::daPagina()->resumir($devocional->conteudo, 200),
                'datePublished' => $devocional->created_at?->toAtomString(),
                'articleSection' => $devocional->categoria,
                'publisher' => ['@id' => rtrim(config('app.url'), '/') . '/#igreja'],
                'mainEntityOfPage' => route('devocionais.detalhe', $devocional->id),
            ])));

        return Inertia::render('Public/DevocionalDetalhe', [
            'devocional' => new DevocionalResource($devocional),
        ]);
    }

    /**
     * Secao da Biblia.
     */
    public function biblia()
    {
        LogService::info('1 - renderizando pagina da biblia');

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Bíblia Online')
            ->descricao('Leia a Bíblia online com versículos do dia e cartões de oração. Leitura gratuită para todos os dias.')
            ->palavrasChave(['bíblia online', 'versículo do dia', 'leitura bíblica']));

        return Inertia::render('Public/Biblia');
    }

    /**
     * Secao da Radio ao vivo.
     */
    public function radio()
    {
        LogService::info('1 - renderizando pagina da radio');

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Rádio Online')
            ->descricao('Ouça a Rádio Resgatar 24 horas por dia. Música cristã, louvor e palavra de Deus ao vivo.')
            ->palavrasChave(['rádio cristã', 'rádio online', 'música gospel']));

        return Inertia::render('Public/Radio');
    }

    /**
     * Secao de anotacoes pessoais (requer login, nunca indexada).
     */
    public function notas(Request $request)
    {
        LogService::info('1 - renderizando pagina de anotacoes', ['usuario_id' => $request->user()?->id]);

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Minhas Anotações')
            ->noIndex());

        return Inertia::render('Public/Notas');
    }

    /**
     * Secao da galeria de fotos.
     */
    public function galeria()
    {
        LogService::info('1 - renderizando pagina da galeria');

        $fotos = Galeria::orderByDesc('created_at')->get();

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Galeria de Fotos')
            ->descricao('Fotos dos cultos, louvor, adoração, batismos, comunhão e ação social da Missão Resgatar.')
            ->imagem($fotos->first()?->url)
            ->palavrasChave(['fotos da igreja', 'galeria de cultos'])
            ->jsonLd(array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'ImageGallery',
                'name' => 'Galeria de Fotos - ' . config('app.name'),
                'url' => route('galeria'),
                'numberOfItems' => $fotos->count(),
                'image' => $fotos->take(30)->map(fn($foto) => [
                    '@type' => 'ImageObject',
                    'contentUrl' => $foto->url,
                    'caption' => $foto->titulo,
                ])->all(),
            ])));

        return Inertia::render('Public/Galeria', [
            'galeria' => GaleriaResource::collection($fotos),
        ]);
    }

    /**
     * Secao de regulamentos.
     */
    public function regulamentos()
    {
        LogService::info('1 - renderizando pagina de regulamentos');

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Regulamentos')
            ->descricao('Normas de participação, termos e regras dos eventos e encontros da Missão Resgatar.')
            ->palavrasChave(['regulamentos da igreja', 'participação de eventos']));

        return Inertia::render('Public/Regulamentos', [
            'regulamentos' => RegulamentoResource::collection(Regulamento::orderBy('categoria')->get()),
        ]);
    }

    /**
     * Detalhe de um regulamento (URL propria, indexavel).
     */
    public function regulamentoDetalhe(Regulamento $regulamento)
    {
        LogService::info('1 - renderizando regulamento', ['id' => $regulamento->id]);

        SeoService::atribuir(SeoService::daPagina()
            ->titulo($regulamento->titulo)
            ->descricao($regulamento->descricao)
            ->palavrasChave([$regulamento->categoria]));

        return Inertia::render('Public/RegulamentoDetalhe', [
            'regulamento' => new RegulamentoResource($regulamento),
        ]);
    }

    /**
     * Detalhe de um evento da agenda (URL propria, indexavel).
     */
    public function eventoDetalhe(EventoAgenda $evento)
    {
        LogService::info('1 - renderizando evento da agenda', ['id' => $evento->id]);

        SeoService::atribuir(SeoService::daPagina()
            ->titulo($evento->titulo)
            ->descricao($evento->descricao ?: 'Participe do ' . $evento->titulo . ' na Missão Resgatar.')
            ->imagem($evento->imagem)
            ->palavrasChave(['agenda da igreja', $evento->local ? 'eventos em ' . $evento->local : null])
            ->jsonLd($this->jsonLdEvento($evento)));

        return Inertia::render('Public/EventoDetalhe', [
            'evento' => new EventoAgendaResource($evento),
        ]);
    }

    /**
     * Dados estruturados de um evento (aparece no Google com data e local).
     */
    private function jsonLdEvento(EventoAgenda $evento): array
    {
        $dados = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'name' => $evento->titulo,
            'description' => $evento->descricao,
            'image' => $evento->imagem,
            'startDate' => $evento->data_hora?->toAtomString(),
            'eventStatus' => 'https://schema.org/EventScheduled',
            'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
            'organizer' => [
                '@id' => rtrim(config('app.url'), '/') . '/#igreja',
            ],
            'url' => route('agenda.detalhe', $evento->id),
        ];

        if ($evento->local) {
            $dados['location'] = [
                '@type' => 'Place',
                'name' => $evento->local,
                'address' => array_filter([
                    '@type' => 'PostalAddress',
                    'addressLocality' => $evento->local,
                ]),
            ];
        }

        return array_filter($dados);
    }

    /**
     * Dados estruturados do site (com area de busca, p/ autoridade no Google).
     */
    private function jsonLdWebSite(): array
    {
        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => config('app.name'),
            'url' => rtrim(config('app.url'), '/') . '/',
            'inLanguage' => config('seo.idioma'),
            'publisher' => ['@id' => rtrim(config('app.url'), '/') . '/#igreja'],
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => rtrim(config('app.url'), '/') . '/noticias?busca={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ]);
    }
}
