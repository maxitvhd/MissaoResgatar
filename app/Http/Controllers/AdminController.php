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
     * Atualiza o perfil, nome, e-mail ou senha de um usuario (admin).
     */
    public function atualizarUsuario(Request $request, User $usuario)
    {
        LogService::info('1 - atualizando usuario', ['usuario_id' => $usuario->id]);

        $dados = $request->validate([
            'role'     => ['sometimes', 'required', 'in:admin,user'],
            'name'     => ['sometimes', 'required', 'string', 'max:255'],
            'email'    => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $usuario->id],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
        ]);

        if (!empty($dados['password'])) {
            $dados['password'] = \Illuminate\Support\Facades\Hash::make($dados['password']);
        } else {
            unset($dados['password']);
        }

        $usuario->update($dados);

        LogService::info('2 - usuario atualizado', ['usuario_id' => $usuario->id]);

        if ($request->wantsJson()) {
            return new UsuarioResource($usuario->fresh());
        }

        return back()->with('success', 'Usuário atualizado com sucesso.');
    }

    /**
     * Exclui um usuario do sistema (admin).
     */
    public function excluirUsuario(User $usuario)
    {
        LogService::info('1 - excluindo usuario', ['usuario_id' => $usuario->id]);

        $usuario->delete();

        LogService::info('2 - usuario excluido', ['usuario_id' => $usuario->id]);

        return response()->json(['success' => true]);
    }
}
