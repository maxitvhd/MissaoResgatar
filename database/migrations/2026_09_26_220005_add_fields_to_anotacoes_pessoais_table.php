<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anotacoes_pessoais', function (Blueprint $table) {
            $table->string('categoria')->default('Geral')->nullable();
            $table->string('cor')->default('amber')->nullable();
            $table->boolean('fixado')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('anotacoes_pessoais', function (Blueprint $table) {
            $table->dropColumn(['categoria', 'cor', 'fixado']);
        });
    }
};
