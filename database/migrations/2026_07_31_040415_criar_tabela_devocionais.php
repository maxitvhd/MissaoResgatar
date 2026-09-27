<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "devocionais" para reflexoes diarias.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devocionais', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->longText('conteudo');
            $table->string('escritura');
            $table->string('categoria')->default('Edificacao')->index();
            $table->unsignedInteger('leituras')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devocionais');
    }
};
