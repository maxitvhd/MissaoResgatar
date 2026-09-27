<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model: Noticia.
 * Representa uma publicacao do blog/news exibida na home e secao de noticias.
 */
class Noticia extends Model
{
    use HasFactory;

    protected $table = 'noticias';

    protected $fillable = [
        'titulo',
        'conteudo',
        'autor',
        'imagem',
        'categoria',
        'curtidas',
        'visualizacoes',
    ];

    /**
     * Comentarios associados a esta noticia.
     */
    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'noticia_id');
    }
}
