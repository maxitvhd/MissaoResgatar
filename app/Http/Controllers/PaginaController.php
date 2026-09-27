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
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador das paginas publicas (frontend Inertia).
 * Renderiza as views React com os dados do banco via Inertia.
 */
class PaginaController extends Controller
{
    /**
     * Home - feed com noticias, devocionais, eventos, atracoes e configs.
     */
    public function home()
    {
        LogService::info('1 - renderizando pagina home');

        return Inertia::render('Home', [
            'noticias'   => NoticiaResource::collection(Noticia::with('comentarios')->orderByDesc('created_at')->get()),
            'devocionais'=> DevocionalResource::collection(Devocional::orderByDesc('created_at')->get()),
            'eventos'    => EventoAgendaResource::collection(EventoAgenda::orderBy('data_hora')->get()),
            'atracoes'   => AtracaoResource::collection(Atracao::orderBy('horario')->get()),
            'patrocinadores' => PatrocinadorResource::collection(Patrocinador::orderBy('nome')->get()),
            'regulamentos'   => RegulamentoResource::collection(Regulamento::orderBy('categoria')->get()),
            'configuracoes'  => new ConfiguracaoSiteResource(ConfiguracaoSite::obter()),
        ]);
    }

    /**
     * Secao de noticias e blog.
     */
    public function noticias()
    {
        LogService::info('1 - renderizando pagina de noticias');

        return Inertia::render('Public/Noticias', [
            'noticias' => NoticiaResource::collection(Noticia::with('comentarios')->orderByDesc('created_at')->get()),
        ]);
    }

    /**
     * Secao de devocionais.
     */
    public function devocionais()
    {
        LogService::info('1 - renderizando pagina de devocionais');

        return Inertia::render('Public/Devocionais', [
            'devocionais' => DevocionalResource::collection(Devocional::orderByDesc('created_at')->get()),
        ]);
    }

    /**
     * Secao da Biblia.
     */
    public function biblia()
    {
        LogService::info('1 - renderizando pagina da biblia');

        return Inertia::render('Public/Biblia');
    }

    /**
     * Secao da Radio ao vivo.
     */
    public function radio()
    {
        LogService::info('1 - renderizando pagina da radio');

        return Inertia::render('Public/Radio');
    }

    /**
     * Secao de anotacoes pessoais (requer login).
     */
    public function notas(Request $request)
    {
        LogService::info('1 - renderizando pagina de anotacoes', ['usuario_id' => $request->user()?->id]);

        return Inertia::render('Public/Notas');
    }

    /**
     * Secao da galeria de fotos.
     */
    public function galeria()
    {
        LogService::info('1 - renderizando pagina da galeria');

        return Inertia::render('Public/Galeria', [
            'galeria' => GaleriaResource::collection(Galeria::orderByDesc('created_at')->get()),
        ]);
    }

    /**
     * Secao de regulamentos.
     */
    public function regulamentos()
    {
        LogService::info('1 - renderizando pagina de regulamentos');

        return Inertia::render('Public/Regulamentos', [
            'regulamentos' => RegulamentoResource::collection(Regulamento::orderBy('categoria')->get()),
        ]);
    }
}
