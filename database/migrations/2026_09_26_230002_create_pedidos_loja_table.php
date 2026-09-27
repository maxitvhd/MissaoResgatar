<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos_loja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->nullable()->constrained('produtos')->nullOnDelete();
            $table->foreignId('membro_id')->nullable()->constrained('membros')->nullOnDelete();
            $table->string('nome_cliente')->default('Visitante');
            $table->string('telefone_cliente')->nullable();
            $table->string('email_cliente')->nullable();
            $table->string('origem_checkout')->default('link_externo'); // link_externo, whatsapp, manual
            $table->integer('quantidade')->default(1);
            $table->decimal('valor_unitario', 10, 2);
            $table->decimal('valor_total', 10, 2);
            $table->string('status')->default('pendente'); // pendente, concluido, cancelado
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos_loja');
    }
};
