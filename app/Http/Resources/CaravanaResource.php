<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource da caravana.
 */
class CaravanaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'church'       => $this->igreja,
            'pastor'       => $this->pastor,
            'contactName'  => $this->nome_responsavel,
            'phone'        => $this->telefone,
            'peopleCount'  => $this->quantidade_pessoas,
            'city'         => $this->cidade,
            'dateAdded'    => $this->created_at?->format('Y-m-d'),
        ];
    }
}
