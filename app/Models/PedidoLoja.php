<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoLoja extends Model
{
    use HasFactory;

    protected $table = 'pedidos_loja';

    protected $fillable = [
        'produto_id',
        'membro_id',
        'nome_cliente',
        'telefone_cliente',
        'email_cliente',
        'origem_checkout',
        'quantidade',
        'valor_unitario',
        'valor_total',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'valor_unitario' => 'decimal:2',
        'valor_total' => 'decimal:2',
        'quantidade' => 'integer',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    public function membro()
    {
        return $this->belongsTo(Membro::class, 'membro_id');
    }

    public function transacaoFinanceira()
    {
        return $this->hasOne(TransacaoFinanceira::class, 'pedido_loja_id');
    }
}
