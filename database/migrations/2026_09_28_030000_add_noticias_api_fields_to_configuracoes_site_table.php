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
            $table->string('noticias_api_url')->nullable()->after('imagem_og');
            $table->string('noticias_api_key')->nullable()->after('noticias_api_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn(['noticias_api_url', 'noticias_api_key']);
        });
    }
};
