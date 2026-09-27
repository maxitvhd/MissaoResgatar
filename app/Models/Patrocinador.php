<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Patrocinador.
 * Apoiadores e parceiros do evento (com logo e link).
 */
class Patrocinador extends Model
{
    use HasFactory;

    protected $table = 'patrocinadores';

    protected $fillable = [
        'nome',
        'url_imagem',
        'link',
    ];
}
