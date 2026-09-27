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
            'url_video_fundo'       => ['sometimes', 'nullable', 'string'],
            'url_imagem_hero'       => ['sometimes', 'nullable', 'string'],
            'fundo_tamanho'         => ['sometimes', 'nullable', 'string', 'in:cover,contain,fill,scale-down,none'],
            'fundo_posicao'         => ['sometimes', 'nullable', 'string'],
            'fundo_opacidade'       => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'fundo_escala'          => ['sometimes', 'nullable', 'integer', 'min:50', 'max:200'],
            'fundo_escurecimento'   => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'logo_url'              => ['sometimes', 'nullable', 'string'],
            'secoes_ativas'         => ['sometimes', 'nullable', 'array'],
            'url_instagram'         => ['sometimes', 'nullable', 'string'],
            'url_facebook'          => ['sometimes', 'nullable', 'string'],
            'url_youtube'           => ['sometimes', 'nullable', 'string'],
            'email_imprensa'        => ['sometimes', 'nullable', 'email'],
            'link_material_imprensa'=> ['sometimes', 'nullable', 'string'],
            'link_credencial_imprensa' => ['sometimes', 'nullable', 'string'],
        ]);

        $configuracao = ConfiguracaoSite::obter();
        $configuracao->update($dados);

        LogService::info('2 - configuracoes atualizadas');

        return new ConfiguracaoSiteResource($configuracao->fresh());
    }
}
