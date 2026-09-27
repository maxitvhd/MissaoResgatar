<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: ConfiguracaoSite.
 * Singleton (sempre id=1) com preferencias globais (redes sociais, midia etc).
 */
class ConfiguracaoSite extends Model
{
    use HasFactory;

    protected $table = 'configuracoes_site';

    protected $fillable = [
        'url_video_fundo',
        'url_imagem_hero',
        'fundo_tamanho',
        'fundo_posicao',
        'fundo_opacidade',
        'fundo_escala',
        'fundo_escurecimento',
        'logo_url',
        'secoes_ativas',
        'url_instagram',
        'url_facebook',
        'url_youtube',
        'whatsapp_loja',
        'whatsapp_flutuante',
        'mensagem_whatsapp_flutuante',
        'email_imprensa',
        'link_material_imprensa',
        'link_credencial_imprensa',
    ];

    protected $casts = [
        'secoes_ativas' => 'array',
    ];

    public function getSecoesAtivasAttribute($value): array
    {
        $padrao = [
            'hero'           => true,
            'agenda'         => true,
            'atracoes'       => true,
            'rota'           => true,
            'galeria'        => true,
            'caravanas'      => true,
            'regulamentos'   => true,
            'patrocinadores' => true,
            'imprensa'       => true,
            'videos'         => true,
            'loja'           => true,
            'transparencia'  => true,
        ];

        if (empty($value)) {
            return $padrao;
        }

        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return array_merge($padrao, is_array($decoded) ? $decoded : []);
    }

    /**
     * Retorna o registro singleton criando-o caso ainda nao exista.
     */
    public static function obter(): self
    {
        return self::firstOrCreate(['id' => 1]);
    }
}
