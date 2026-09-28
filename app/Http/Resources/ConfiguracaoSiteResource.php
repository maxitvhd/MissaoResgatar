<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource das configuracoes do site.
 */
class ConfiguracaoSiteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'videoBackgroundUrl'   => $this->url_video_fundo,
            'heroImageUrl'         => $this->url_imagem_hero,
            'backgroundSize'       => $this->fundo_tamanho ?? 'cover',
            'backgroundPosition'   => $this->fundo_posicao ?? 'center',
            'backgroundOpacity'    => (int) ($this->fundo_opacidade ?? 35),
            'backgroundScale'      => (int) ($this->fundo_escala ?? 105),
            'backgroundDarkness'   => (int) ($this->fundo_escurecimento ?? 70),
            'logoUrl'              => $this->logo_url,
            'activeSections'       => $this->secoes_ativas,
            'instagramUrl'               => $this->url_instagram,
            'facebookUrl'                => $this->url_facebook,
            'youtubeUrl'                 => $this->url_youtube,
            'whatsappLoja'               => $this->whatsapp_loja,
            'whatsappFlutuante'          => $this->whatsapp_flutuante,
            'mensagemWhatsappFlutuante'  => $this->mensagem_whatsapp_flutuante,
            'pressEmail'                 => $this->email_imprensa,
            'pressMaterialLink'          => $this->link_material_imprensa,
            'pressCredLink'              => $this->link_credencial_imprensa,

            // SEO (usados no title, description, og:image e JSON-LD)
            'seoTitle'           => $this->titulo_site,
            'seoDescription'     => $this->meta_description,
            'seoKeywords'        => $this->palavras_chave,
            'seoOgImage'         => $this->imagem_og,
            'seoTwitterSite'     => $this->twitter_site,
            'noticiasApiUrl'     => $this->noticias_api_url,
            'noticiasApiKey'     => $this->noticias_api_key,
            'contactPhone'       => $this->telefone,
            'addressStreet'      => $this->endereco_rua,
            'addressNumber'      => $this->endereco_numero,
            'addressNeighborhood'=> $this->endereco_bairro,
            'addressCity'        => $this->endereco_cidade,
            'addressState'       => $this->endereco_estado,
            'addressZip'         => $this->endereco_cep,
        ];
    }
}
