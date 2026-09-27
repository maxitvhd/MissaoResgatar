<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middleware Inertia para respostas otimizadas
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Alias do middleware de admin para uso nas rotas
        $middleware->alias([
            'admin' => \App\Http\Middleware\Admin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handler de erros amigavel para Inertia
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            if ($request->header('X-Inertia') && in_array($response->getStatusCode(), [500, 503, 404, 403, 419])) {
                return inertia('Errors/' . $response->getStatusCode())
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }
            return $response;
        });
    })->create();
