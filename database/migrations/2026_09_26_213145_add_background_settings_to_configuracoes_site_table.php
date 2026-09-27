<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->string('fundo_tamanho')->default('cover')->nullable();
            $table->string('fundo_posicao')->default('center')->nullable();
            $table->integer('fundo_opacidade')->default(35)->nullable();
            $table->integer('fundo_escala')->default(105)->nullable();
            $table->integer('fundo_escurecimento')->default(70)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn([
                'fundo_tamanho',
                'fundo_posicao',
                'fundo_opacidade',
                'fundo_escala',
                'fundo_escurecimento',
            ]);
        });
    }
};
