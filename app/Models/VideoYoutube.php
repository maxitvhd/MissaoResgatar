<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoYoutube extends Model
{
    use HasFactory;

    protected $table = 'videos_youtube';

    protected $fillable = [
        'titulo',
        'url_ou_id',
        'descricao',
        'categoria',
        'destaque',
        'ordem',
    ];

    protected $casts = [
        'destaque' => 'boolean',
        'ordem' => 'integer',
    ];
}
