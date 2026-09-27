<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Comentario.
 * Comentarios publicados pelos usuarios em uma noticia.
 */
class Comentario extends Model
{
    use HasFactory;

    protected $table = 'comentarios';

    protected $fillable = [
        'noticia_id',
        'autor',
        'conteudo',
    ];

    /**
     * Noticia a qual o comentario pertence.
     */
    public function noticia()
    {
        return $this->belongsTo(Noticia::class, 'noticia_id');
    }
}
