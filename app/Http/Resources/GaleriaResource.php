<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do item da galeria.
 */
class GaleriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->titulo,
            'description' => $this->descricao,
            'url'         => $this->url,
            'category'    => $this->categoria,
        ];
    }
}
