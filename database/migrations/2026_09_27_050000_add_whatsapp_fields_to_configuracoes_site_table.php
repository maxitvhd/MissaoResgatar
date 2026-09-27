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
            if (!Schema::hasColumn('configuracoes_site', 'whatsapp_loja')) {
                $table->string('whatsapp_loja')->nullable()->after('url_youtube');
            }
            if (!Schema::hasColumn('configuracoes_site', 'whatsapp_flutuante')) {
                $table->string('whatsapp_flutuante')->nullable()->after('whatsapp_loja');
            }
            if (!Schema::hasColumn('configuracoes_site', 'mensagem_whatsapp_flutuante')) {
                $table->string('mensagem_whatsapp_flutuante')->nullable()->after('whatsapp_flutuante');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuracoes_site', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_loja', 'whatsapp_flutuante', 'mensagem_whatsapp_flutuante']);
        });
    }
};
