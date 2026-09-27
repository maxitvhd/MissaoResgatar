<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Caravana.
 * Inscricao de igrejas/grupos para participar da Marcha.
 */
class Caravana extends Model
{
    use HasFactory;

    protected $table = 'caravanas';

    protected $fillable = [
        'igreja',
        'pastor',
        'nome_responsavel',
        'telefone',
        'quantidade_pessoas',
        'cidade',
    ];
}
