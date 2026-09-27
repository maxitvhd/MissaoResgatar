<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Galeria.
 * Itens (fotos/videos) exibidos na galeria publica.
 */
class Galeria extends Model
{
    use HasFactory;

    protected $table = 'galeria';

    protected $fillable = [
        'titulo',
        'descricao',
        'url',
        'categoria',
    ];
}
