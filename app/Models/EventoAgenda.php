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
        'recorrencia',
        'destaque_especial',
        'imagem',
    ];

    protected $casts = [
        'data_hora'         => 'datetime',
        'destaque_especial' => 'boolean',
    ];

    /**
     * Calcula a proxima data/hora do evento considerando a recorrencia.
     */
    public function getProximaDataHoraAttribute()
    {
        if (!$this->data_hora) return null;

        $now = now();
        $date = $this->data_hora->copy();

        if ($date->gt($now)) {
            return $date;
        }

        switch ($this->recorrencia) {
            case 'semanal':
                while ($date->lte($now)) {
                    $date->addWeek();
                }
                return $date;
            case 'quinzenal':
                while ($date->lte($now)) {
                    $date->addWeeks(2);
                }
                return $date;
            case 'mensal':
                while ($date->lte($now)) {
                    $date->addMonth();
                }
                return $date;
            default:
                return $this->data_hora;
        }
    }
}
