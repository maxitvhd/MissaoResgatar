<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AulaFechada extends Model
{
    use HasFactory;

    protected $table = 'aulas_fechadas';

    protected $fillable = [
        'modulo',
        'titulo',
        'descricao',
        'url_video',
        'duracao',
        'material_url',
        'ordem',
        'ativo',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'ativo' => 'boolean',
    ];
}
