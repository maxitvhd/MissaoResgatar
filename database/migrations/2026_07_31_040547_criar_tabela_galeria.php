<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "galeria" para fotos do evento.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galeria', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('url');
            $table->string('categoria')->default('Geral')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galeria');
    }
};
