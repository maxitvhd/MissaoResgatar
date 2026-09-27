<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: EventoAgenda.
 * Item da programacao/agenda oficial da Marcha.
 */
class EventoAgenda extends Model
{
    use HasFactory;

    protected $table = 'eventos_agenda';

    protected $fillable = [
        'titulo',
        'descricao',
        'local',
        'data_hora',
        'imagem',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
    ];
}
