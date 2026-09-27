<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "atracoes" com shows e bandas do evento.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atracoes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('horario')->nullable();
            $table->string('imagem')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atracoes');
    }
};
