<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Regulamento.
 * Regras, normas e PDFs de credenciamento do evento.
 */
class Regulamento extends Model
{
    use HasFactory;

    protected $table = 'regulamentos';

    protected $fillable = [
        'titulo',
        'descricao',
        'categoria',
        'link',
    ];
}
