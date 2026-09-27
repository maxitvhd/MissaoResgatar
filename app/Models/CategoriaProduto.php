<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CategoriaProduto extends Model
{
    use HasFactory;

    protected $table = 'categorias_produtos';

    protected $fillable = [
        'nome',
        'slug',
        'descricao',
    ];

    public function produtos()
    {
        return $this->hasMany(Produto::class, 'categoria_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($categoria) {
            if (empty($categoria->slug)) {
                $categoria->slug = Str::slug($categoria->nome) . '-' . rand(100, 999);
            }
        });
    }
}
