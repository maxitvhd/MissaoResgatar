<?php

namespace App\Http\Middleware;

use App\Services\SeoService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * Template raiz carregado na primeira carga de pagina.
     */
    protected $rootView = 'app';

    /**
     * Determina a versao atual dos assets (para cache-busting via Inertia).
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define os props padrao compartilhados com todas as paginas Inertia.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            /*
                SEO da pagina: definido pelo controller ou o padrao do config/seo.php.
                Precisa ser closure: o Inertia resolve as props DEPOIS do controller
                responder, e ai o SeoService ja foi preenchido. O noindex e automatico
                em /admin, /login, /api e areas privadas.
            */
            'seo' => function () use ($request) {
                $seo = SeoService::pegar();

                if (SeoService::urlPrivada($request->path())) {
                    $seo->noIndex();
                }

                return $seo->toArray();
            },

            // Compartilha o usuario autenticado com o frontend
            'auth' => [
                'user' => $request->user() ? [
                    'id'    => $request->user()->id,
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'role'  => $request->user()->role ?? 'user',
                ] : null,
            ],
            // Flash messages (sucesso/erro) vindas de redirects
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            // Informacoes gerais da aplicacao
            'app' => [
                'name'    => config('app.name'),
                'version' => env('APP_VERSION', '1.0.0'),
                'locale'  => app()->getLocale(),
            ],
        ]);
    }
}
