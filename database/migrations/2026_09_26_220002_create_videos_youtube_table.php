<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos_youtube', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('url_ou_id');
            $table->text('descricao')->nullable();
            $table->string('categoria')->default('Geral');
            $table->boolean('destaque')->default(false);
            $table->integer('ordem')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos_youtube');
    }
};
