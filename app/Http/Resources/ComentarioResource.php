<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do comentario.
 */
class ComentarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'author'  => $this->autor,
            'content' => $this->conteudo,
            'date'    => $this->created_at?->toIso8601String(),
        ];
    }
}
