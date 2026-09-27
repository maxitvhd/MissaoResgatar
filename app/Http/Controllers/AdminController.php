<?php

namespace App\Http\Controllers;

use App\Models\Atracao;
use App\Models\Caravana;
use App\Models\Devocional;
use App\Models\EventoAgenda;
use App\Models\Galeria;
use App\Models\Noticia;
use App\Models\Patrocinador;
use App\Models\Regulamento;
use App\Models\User;
use App\Http\Resources\UsuarioResource;
use App\Services\LogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador do painel administrativo.
 * Acesso restrito a usuarios com perfil admin.
 */
class AdminController extends Controller
{

    /**
     * Exibe o dashboard do admin com estatisticas gerais.
     */
    public function dashboard()
    {
        LogService::info('1 - carregando dashboard do admin');

        $estatisticas = [
            'noticias'      => Noticia::count(),
            'devocionais'   => Devocional::count(),
            'eventos'       => EventoAgenda::count(),
            'galeria'       => Galeria::count(),
            'regulamentos'  => Regulamento::count(),
            'caravanas'     => Caravana::count(),
            'patrocinadores'=> Patrocinador::count(),
            'atracoes'      => Atracao::count(),
            'usuarios'      => User::count(),
        ];

        LogService::info('2 - estatisticas carregadas', $estatisticas);

        return Inertia::render('Admin/Dashboard', [
            'estatisticas' => $estatisticas,
        ]);
    }

    /**
     * Lista todos os usuarios cadastrados.
     */
    public function usuarios()
    {
        LogService::info('1 - listando usuarios');

        $usuarios = User::orderByDesc('id')->get();

        LogService::info('2 - usuarios listados', ['total' => $usuarios->count()]);

        return UsuarioResource::collection($usuarios);
    }

    /**
     * Atualiza o perfil (role) de um usuario.
     */
    public function atualizarUsuario(Request $request, User $usuario)
    {
        LogService::info('1 - atualizando perfil do usuario', ['usuario_id' => $usuario->id]);

        $dados = $request->validate([
            'role' => ['required', 'in:admin,user'],
        ]);

        $usuario->update($dados);

        LogService::info('2 - perfil atualizado', ['usuario_id' => $usuario->id, 'role' => $dados['role']]);

        return back()->with('success', 'Perfil do usuário atualizado.');
    }
}
