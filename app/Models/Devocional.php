<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Devocional.
 * Reflexao diaria exibida na secao "Devocionais".
 */
class Devocional extends Model
{
    use HasFactory;

    protected $table = 'devocionais';

    protected $fillable = [
        'titulo',
        'conteudo',
        'escritura',
        'categoria',
        'leituras',
    ];
}
