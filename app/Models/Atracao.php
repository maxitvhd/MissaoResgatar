<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Atracao.
 * Shows, bandas e artistas confirmados no evento.
 */
class Atracao extends Model
{
    use HasFactory;

    protected $table = 'atracoes';

    protected $fillable = [
        'nome',
        'descricao',
        'horario',
        'imagem',
    ];
}
