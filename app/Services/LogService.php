<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * Servico central de logs da aplicacao.
 * Permite ativar/desativar todos os logs pelo .env (APP_LOGS_ENABLED).
 * Padrao dos logs: "LOG: {numero} - {descricao da etapa}"
 */
class LogService
{
    /**
     * Verifica se os logs estao habilitados pelo .env.
     */
    private static function habilitado(): bool
    {
        return (bool) env('APP_LOGS_ENABLED', true);
    }

    /**
     * Registra um log informativo numerado.
     */
    public static function info(string $mensagem, array $contexto = []): void
    {
        if (!self::habilitado()) {
            return;
        }
        Log::info("LOG: {$mensagem}", $contexto);
    }

    /**
     * Registra um log de erro numerado.
     */
    public static function erro(string $mensagem, array $contexto = []): void
    {
        if (!self::habilitado()) {
            return;
        }
        Log::error("LOG: {$mensagem}", $contexto);
    }

    /**
     * Registra um log de aviso numerado.
     */
    public static function aviso(string $mensagem, array $contexto = []): void
    {
        if (!self::habilitado()) {
            return;
        }
        Log::warning("LOG: {$mensagem}", $contexto);
    }
}
