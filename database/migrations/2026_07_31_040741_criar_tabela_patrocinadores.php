<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "patrocinadores" com logos e links dos apoiadores.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patrocinadores', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('url_imagem');
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patrocinadores');
    }
};
