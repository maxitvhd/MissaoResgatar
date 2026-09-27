<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transacoes_financeiras', function (Blueprint $table) {
            $table->id();
            $table->string('tipo'); // entrada, saida
            $table->string('categoria'); 
            // Entradas: dizimo, oferta, venda_loja, evento_servico, doacao, outra_entrada
            // Saídas: acao_social, manutencao_templo, equipamentos_som, contas_consumo, ajuda_custo, evangelismo, outra_saida
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->date('data');
            $table->string('data_culto_evento')->nullable(); // Ex: Culto de Domingo, Conferência Missionária
            $table->string('metodo_pagamento')->nullable(); // pix, dinheiro, cartao, transferencia, boleto, link
            $table->foreignId('membro_id')->nullable()->constrained('membros')->nullOnDelete();
            $table->foreignId('pedido_loja_id')->nullable()->constrained('pedidos_loja')->nullOnDelete();
            $table->string('status')->default('confirmado'); // confirmado, pendente, cancelado
            $table->string('comprovante_url')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transacoes_financeiras');
    }
};
