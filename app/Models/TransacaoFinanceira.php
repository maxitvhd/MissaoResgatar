<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransacaoFinanceira extends Model
{
    use HasFactory;

    protected $table = 'transacoes_financeiras';

    protected $fillable = [
        'tipo',
        'categoria',
        'descricao',
        'valor',
        'data',
        'data_culto_evento',
        'metodo_pagamento',
        'membro_id',
        'pedido_loja_id',
        'status',
        'comprovante_url',
        'observacoes',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data' => 'date',
    ];

    public function membro()
    {
        return $this->belongsTo(Membro::class, 'membro_id');
    }

    public function pedidoLoja()
    {
        return $this->belongsTo(PedidoLoja::class, 'pedido_loja_id');
    }
}
