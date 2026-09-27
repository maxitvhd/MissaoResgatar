<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do devocional.
 */
class DevocionalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'title'     => $this->titulo,
            'content'   => $this->conteudo,
            'scripture' => $this->escritura,
            'date'      => $this->created_at?->format('Y-m-d'),
            'category'  => $this->categoria,
            'reads'     => $this->leituras,
        ];
    }
}
