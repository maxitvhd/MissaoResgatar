<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: AnotacaoPessoal.
 * Notas privadas em nuvem para cada usuario autenticado.
 */
class AnotacaoPessoal extends Model
{
    use HasFactory;

    protected $table = 'anotacoes_pessoais';

    protected $fillable = [
        'usuario_id',
        'titulo',
        'conteudo',
        'categoria',
        'cor',
        'fixado',
        'ultima_atualizacao',
    ];

    protected $casts = [
        'fixado' => 'boolean',
        'ultima_atualizacao' => 'datetime',
    ];

    /**
     * Dono da anotacao.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
