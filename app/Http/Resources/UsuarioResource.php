<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource do usuario.
 */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'email' => $this->email,
            'name'  => $this->name,
            'role'  => $this->role,
        ];
    }
}
