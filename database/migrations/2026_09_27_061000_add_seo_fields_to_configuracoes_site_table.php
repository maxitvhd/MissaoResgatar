<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos de SEO e dados estruturados em configuracoes_site.
 * Tudo opcional: campo vazio cai no padrao do config/seo.php.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('configuracoes_site')) {
            Schema::table('configuracoes_site', function (Blueprint $table) {
                // Identidade exibida nos resultados de busca
                if (!Schema::hasColumn('configuracoes_site', 'titulo_site')) {
                    $table->string('titulo_site')->nullable()->after('id');
                }
                if (!Schema::hasColumn('configuracoes_site', 'meta_description')) {
                    $table->string('meta_description', 500)->nullable()->after('titulo_site');
                }
                if (!Schema::hasColumn('configuracoes_site', 'palavras_chave')) {
                    $table->string('palavras_chave', 500)->nullable()->after('meta_description');
                }
                if (!Schema::hasColumn('configuracoes_site', 'imagem_og')) {
                    $table->string('imagem_og')->nullable()->after('palavras_chave');
                }
                if (!Schema::hasColumn('configuracoes_site', 'twitter_site')) {
                    $table->string('twitter_site')->nullable()->after('imagem_og');
                }

                // Contato e localizacao (usados no JSON-LD de LocalBusiness)
                if (!Schema::hasColumn('configuracoes_site', 'telefone')) {
                    $table->string('telefone')->nullable()->after('twitter_site');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_rua')) {
                    $table->string('endereco_rua')->nullable()->after('telefone');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_numero')) {
                    $table->string('endereco_numero')->nullable()->after('endereco_rua');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_bairro')) {
                    $table->string('endereco_bairro')->nullable()->after('endereco_numero');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_cidade')) {
                    $table->string('endereco_cidade')->nullable()->after('endereco_bairro');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_estado')) {
                    $table->string('endereco_estado', 2)->nullable()->after('endereco_cidade');
                }
                if (!Schema::hasColumn('configuracoes_site', 'endereco_cep')) {
                    $table->string('endereco_cep', 10)->nullable()->after('endereco_estado');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('configuracoes_site')) {
            Schema::table('configuracoes_site', function (Blueprint $table) {
                foreach ([
                    'titulo_site', 'meta_description', 'palavras_chave', 'imagem_og', 'twitter_site',
                    'telefone', 'endereco_rua', 'endereco_numero', 'endereco_bairro',
                    'endereco_cidade', 'endereco_estado', 'endereco_cep',
                ] as $coluna) {
                    if (Schema::hasColumn('configuracoes_site', $coluna)) {
                        $table->dropColumn($coluna);
                    }
                }
            });
        }
    }
};
