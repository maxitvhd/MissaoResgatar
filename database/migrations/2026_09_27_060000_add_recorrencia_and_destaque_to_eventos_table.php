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
        Schema::table('eventos_agenda', function (Blueprint $table) {
            if (!Schema::hasColumn('eventos_agenda', 'recorrencia')) {
                $table->string('recorrencia')->default('nenhuma')->after('data_hora');
            }
            if (!Schema::hasColumn('eventos_agenda', 'destaque_especial')) {
                $table->boolean('destaque_especial')->default(false)->after('recorrencia');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eventos_agenda', function (Blueprint $table) {
            $table->dropColumn(['recorrencia', 'destaque_especial']);
        });
    }
};
