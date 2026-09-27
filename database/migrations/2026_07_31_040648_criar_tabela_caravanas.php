<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "caravanas" para inscricao de igrejas/grupos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caravanas', function (Blueprint $table) {
            $table->id();
            $table->string('igreja');
            $table->string('pastor')->nullable();
            $table->string('nome_responsavel');
            $table->string('telefone');
            $table->unsignedInteger('quantidade_pessoas')->default(0);
            $table->string('cidade')->default('Itaquaquecetuba');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caravanas');
    }
};
