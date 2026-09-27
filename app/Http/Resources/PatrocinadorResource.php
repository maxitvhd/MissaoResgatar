<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do patrocinador.
 */
class PatrocinadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->nome,
            'imageUrl' => $this->url_imagem,
            'link'     => $this->link,
        ];
    }
}
