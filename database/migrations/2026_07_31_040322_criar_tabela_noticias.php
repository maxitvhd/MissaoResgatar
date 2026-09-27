<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "noticias" usada no blog e feed principal.
 */
return new class extends Migration
{
    /**
     * Executa a migracao criando a tabela de noticias.
     */
    public function up(): void
    {
        Schema::create('noticias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->longText('conteudo');
            $table->string('autor');
            $table->string('imagem')->nullable();
            $table->string('categoria')->default('Geral')->index();
            $table->unsignedInteger('curtidas')->default(0);
            $table->unsignedInteger('visualizacoes')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverte a migracao removendo a tabela de noticias.
     */
    public function down(): void
    {
        Schema::dropIfExists('noticias');
    }
};
