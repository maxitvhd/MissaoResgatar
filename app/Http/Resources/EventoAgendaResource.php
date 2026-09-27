<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do evento da agenda.
 */
class EventoAgendaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->titulo,
            'description'  => $this->descricao,
            'location'     => $this->local,
            'dateTime'     => $this->data_hora?->format('Y-m-d\TH:i'),
            'nextDateTime' => $this->proxima_data_hora?->format('Y-m-d\TH:i'),
            'recurrence'   => $this->recorrencia ?? 'nenhuma',
            'isFeatured'   => (bool) $this->destaque_especial,
            'image'        => $this->imagem,
        ];
    }
}
