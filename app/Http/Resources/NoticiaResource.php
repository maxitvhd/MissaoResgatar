<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource da noticia.
 * Mantem os nomes dos campos iguais ao frontend React original (ingles).
 */
class NoticiaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->titulo,
            'content'    => $this->conteudo,
            'author'     => $this->autor,
            'image'      => $this->imagem,
            'date'       => $this->created_at?->format('Y-m-d'),
            'category'   => $this->categoria,
            'likes'      => $this->curtidas,
            'views'      => $this->visualizacoes,
            'comments'   => ComentarioResource::collection($this->whenLoaded('comentarios')),
        ];
    }
}
