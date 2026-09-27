<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Membro extends Model
{
    use HasFactory;

    protected $table = 'membros';

    protected $fillable = [
        'user_id',
        'nome',
        'email',
        'telefone',
        'cpf',
        'data_nascimento',
        'data_membro',
        'cargo_ministerio',
        'status',
        'endereco',
        'cidade',
        'estado',
        'foto_url',
        'observacoes',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_membro' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transacoes()
    {
        return $this->hasMany(TransacaoFinanceira::class, 'membro_id');
    }

    public function dizimos()
    {
        return $this->hasMany(TransacaoFinanceira::class, 'membro_id')->where('categoria', 'dizimo');
    }

    public function ofertas()
    {
        return $this->hasMany(TransacaoFinanceira::class, 'membro_id')->where('categoria', 'oferta');
    }

    public function pedidos()
    {
        return $this->hasMany(PedidoLoja::class, 'membro_id');
    }
}
