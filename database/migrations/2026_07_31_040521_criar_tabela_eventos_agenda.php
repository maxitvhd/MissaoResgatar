<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "eventos_agenda" com a programacao da Marcha.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos_agenda', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descricao');
            $table->string('local');
            $table->dateTime('data_hora');
            $table->string('imagem')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_agenda');
    }
};
