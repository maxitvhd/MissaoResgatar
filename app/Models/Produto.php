<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Produto extends Model
{
    use HasFactory;

    protected $table = 'produtos';

    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'descricao',
        'detalhes',
        'imagem_url',
        'imagens_galeria',
        'preco',
        'preco_desconto',
        'informacoes_frete',
        'link_compra',
        'em_estoque',
        'destaque',
    ];

    protected $casts = [
        'imagens_galeria' => 'array',
        'preco' => 'float',
        'preco_desconto' => 'float',
        'em_estoque' => 'boolean',
        'destaque' => 'boolean',
    ];

    public function categoria()
    {
        return $this->belongsTo(CategoriaProduto::class, 'categoria_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($produto) {
            if (empty($produto->slug)) {
                $produto->slug = Str::slug($produto->nome) . '-' . rand(1000, 9999);
            }
        });
    }
}
