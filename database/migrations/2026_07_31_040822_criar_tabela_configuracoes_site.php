<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migracao: cria a tabela "configuracoes_site" com as preferencias globais.
 * Funciona como singleton (sempre id=1) com chaves de redes sociais, midia etc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracoes_site', function (Blueprint $table) {
            $table->id();
            $table->string('url_video_fundo')->nullable();
            $table->string('url_imagem_hero')->nullable();
            $table->string('url_instagram')->nullable();
            $table->string('url_facebook')->nullable();
            $table->string('url_youtube')->nullable();
            $table->string('email_imprensa')->nullable();
            $table->string('link_material_imprensa')->nullable();
            $table->string('link_credencial_imprensa')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracoes_site');
    }
};
