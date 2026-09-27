<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource da anotacao pessoal.
 */
class AnotacaoPessoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'userId'      => $this->usuario_id,
            'title'       => $this->titulo,
            'content'     => $this->conteudo,
            'category'    => $this->categoria ?? 'Geral',
            'color'       => $this->cor ?? 'amber',
            'isPinned'    => (bool) $this->fixado,
            'lastUpdated' => ($this->ultima_atualizacao ?? $this->updated_at)?->toIso8601String(),
        ];
    }
}
