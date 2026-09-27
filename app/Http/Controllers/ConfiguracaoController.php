<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracaoSite;
use App\Http\Resources\ConfiguracaoSiteResource;
use App\Services\LogService;
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
        ]);

        $configuracao = ConfiguracaoSite::obter();
        $configuracao->update($dados);

        LogService::info('2 - configuracoes atualizadas');

        return new ConfiguracaoSiteResource($configuracao->fresh());
    }
}
