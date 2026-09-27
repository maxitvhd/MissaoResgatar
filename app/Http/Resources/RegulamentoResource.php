<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do regulamento.
 */
class RegulamentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->titulo,
            'description' => $this->descricao,
            'category'    => $this->categoria,
            'link'        => $this->link,
        ];
    }
}
