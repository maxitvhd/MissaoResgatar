<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConfiguracaoSiteResource;
use App\Models\ConfiguracaoSite;
use App\Services\LogService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

/**
 * Controlador de configuracoes do site (singleton).
 */
class ConfiguracaoController extends Controller
{

    /**
     * Retorna as configuracoes atuais (publico - usadas no layout).
     */
    public function index()
    {
        LogService::info('1 - carregando configuracoes do site');

        return new ConfiguracaoSiteResource(ConfiguracaoSite::obter());
    }

    /**
     * Atualiza as configuracoes do site (admin).
     */
    public function atualizar(Request $request)
    {
        LogService::info('1 - atualizando configuracoes do site');

        $dados = $request->validate([
            'url_video_fundo'       => ['sometimes', 'nullable'],
            'url_imagem_hero'       => ['sometimes', 'nullable'],
            'fundo_tamanho'         => ['sometimes', 'nullable'],
            'fundo_posicao'         => ['sometimes', 'nullable'],
            'fundo_opacidade'       => ['sometimes', 'nullable'],
            'fundo_escala'          => ['sometimes', 'nullable'],
            'fundo_escurecimento'   => ['sometimes', 'nullable'],
            'logo_url'              => ['sometimes', 'nullable'],
            'secoes_ativas'         => ['sometimes', 'nullable', 'array'],
            'url_instagram'               => ['sometimes', 'nullable'],
            'url_facebook'                => ['sometimes', 'nullable'],
            'url_youtube'                 => ['sometimes', 'nullable'],
            'whatsapp_loja'               => ['sometimes', 'nullable'],
            'whatsapp_flutuante'          => ['sometimes', 'nullable'],
            'mensagem_whatsapp_flutuante' => ['sometimes', 'nullable'],
            'email_imprensa'              => ['sometimes', 'nullable'],
            'link_material_imprensa'      => ['sometimes', 'nullable'],
            'link_credencial_imprensa'    => ['sometimes', 'nullable'],

            // SEO
            'titulo_site'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'meta_description'   => ['sometimes', 'nullable', 'string', 'max:500'],
            'palavras_chave'     => ['sometimes', 'nullable', 'string', 'max:500'],
            'imagem_og'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'twitter_site'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'noticias_api_url'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'noticias_api_key'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'telefone'           => ['sometimes', 'nullable', 'string', 'max:50'],
            'endereco_rua'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'endereco_numero'    => ['sometimes', 'nullable', 'string', 'max:20'],
            'endereco_bairro'    => ['sometimes', 'nullable', 'string', 'max:120'],
            'endereco_cidade'    => ['sometimes', 'nullable', 'string', 'max:120'],
            'endereco_estado'    => ['sometimes', 'nullable', 'string', 'max:2'],
            'endereco_cep'       => ['sometimes', 'nullable', 'string', 'max:10'],
        ]);

        $configuracao = ConfiguracaoSite::obter();
        $configuracao->update($dados);

        // SEO e sitemap sao cacheados: precisa invalidar
        ConfiguracaoSite::limparCache();
        Cache::forget('noticias_api_categorias');
        Cache::forget(SitemapController::CACHE_SITEMAP);
        Cache::forget(SeoController::CACHE_LLMS);

        LogService::info('2 - configuracoes atualizadas');

        return new ConfiguracaoSiteResource($configuracao->fresh());
    }

    /**
     * Testa conexao com a API de Noticias (admin).
     */
    public function testarNoticiasApi(Request $request, \App\Services\NoticiasApiService $service)
    {
        $url = $request->input('url');
        $key = $request->input('key');

        $resultado = $service->testarConexao($url, $key);
        return response()->json($resultado);
    }
}
