<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aulas_fechadas', function (Blueprint $table) {
            $table->id();
            $table->string('modulo')->default('Módulo 1 - Discipulado & Fundamentos');
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('url_video');
            $table->string('duracao')->nullable();
            $table->string('material_url')->nullable();
            $table->integer('ordem')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aulas_fechadas');
    }
};
