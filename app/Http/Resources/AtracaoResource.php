<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource da atracao (show).
 */
class AtracaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->nome,
            'description' => $this->descricao,
            'time'        => $this->horario,
            'image'       => $this->imagem,
        ];
    }
}
