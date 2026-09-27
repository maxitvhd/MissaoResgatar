<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorias_produtos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('slug')->unique();
            $table->text('descricao')->nullable();
            $table->timestamps();
        });

        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->nullable()->constrained('categorias_produtos')->nullOnDelete();
            $table->string('nome');
            $table->string('slug')->unique();
            $table->text('descricao')->nullable();
            $table->text('detalhes')->nullable();
            $table->string('imagem_url')->nullable();
            $table->json('imagens_galeria')->nullable();
            $table->decimal('preco', 10, 2);
            $table->decimal('preco_desconto', 10, 2)->nullable();
            $table->string('informacoes_frete')->nullable();
            $table->boolean('em_estoque')->default(true);
            $table->boolean('destaque')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produtos');
        Schema::dropIfExists('categorias_produtos');
    }
};
