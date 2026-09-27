<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que restringe o acesso apenas a usuarios admin.
 */
class Admin
{
    /**
     * Bloqueia o acesso de usuarios que nao possuem perfil admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user() && $request->user()->isAdmin(), 403, 'Acesso restrito a administradores.');

        return $next($request);
    }
}
