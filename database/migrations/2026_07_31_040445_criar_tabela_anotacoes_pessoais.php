<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "anotacoes_pessoais" para notas em nuvem por usuario.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anotacoes_pessoais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->longText('conteudo');
            $table->timestamp('ultima_atualizacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anotacoes_pessoais');
    }
};
