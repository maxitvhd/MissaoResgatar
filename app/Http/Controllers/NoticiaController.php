<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use App\Models\Noticia;
use App\Http\Resources\NoticiaResource;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Controlador de noticias (blog e feed da home).
 */
class NoticiaController extends Controller
{

    /**
     * Lista todas as noticias (publico).
     */
    public function index()
    {
        LogService::info('1 - listando noticias publicas');

        $noticias = Noticia::with('comentarios')
            ->orderByDesc('created_at')
            ->get();

        return NoticiaResource::collection($noticias);

        LogService::info('2 - noticias carregadas', ['total' => $noticias->count()]);
    }

    /**
     * Exibe uma noticia especifica e incrementa visualizacoes.
     */
    public function mostrar(Noticia $noticia)
    {
        LogService::info('1 - exibindo noticia', ['noticia_id' => $noticia->id]);

        $noticia->increment('visualizacoes');
        $noticia->load('comentarios');

        return new NoticiaResource($noticia);
    }

    /**
     * Cria uma nova noticia (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando noticia');

        $dados = $request->validate([
            'titulo'    => ['required', 'string', 'max:255'],
            'conteudo'  => ['required', 'string'],
            'autor'     => ['nullable', 'string', 'max:255'],
            'imagem'    => ['nullable', 'string'],
            'categoria' => ['nullable', 'string', 'max:100'],
        ]);

        $noticia = Noticia::create([
            'titulo'       => $dados['titulo'],
            'conteudo'     => $dados['conteudo'],
            'autor'        => $dados['autor'] ?? 'HolyHub Editorial',
            'imagem'       => $dados['imagem'] ?? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            'categoria'    => $dados['categoria'] ?? 'Geral',
            'curtidas'     => 0,
            'visualizacoes'=> 1,
        ]);

        LogService::info('2 - noticia criada', ['noticia_id' => $noticia->id]);

        return (new NoticiaResource($noticia))->response()->setStatusCode(201);
    }

    /**
     * Atualiza uma noticia existente (admin).
     */
    public function atualizar(Request $request, Noticia $noticia)
    {
        LogService::info('1 - atualizando noticia', ['noticia_id' => $noticia->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'conteudo'  => ['sometimes', 'string'],
            'imagem'    => ['sometimes', 'nullable', 'string'],
            'categoria' => ['sometimes', 'string', 'max:100'],
        ]);

        $noticia->update($dados);

        LogService::info('2 - noticia atualizada', ['noticia_id' => $noticia->id]);

        return new NoticiaResource($noticia);
    }

    /**
     * Remove uma noticia (admin).
     */
    public function excluir(Noticia $noticia)
    {
        LogService::info('1 - excluindo noticia', ['noticia_id' => $noticia->id]);

        $noticia->delete();

        LogService::info('2 - noticia excluida', ['noticia_id' => $noticia->id]);

        return response()->json(['success' => true]);
    }

    /**
     * Incrementa curtidas de uma noticia (publico).
     */
    public function curtir(Noticia $noticia)
    {
        LogService::info('1 - registrando curtida', ['noticia_id' => $noticia->id]);

        $noticia->increment('curtidas');

        return response()->json(['curtidas' => $noticia->fresh()->curtidas]);
    }

    /**
     * Adiciona um comentario a noticia (publico).
     */
    public function comentar(Request $request, Noticia $noticia)
    {
        LogService::info('1 - salvando comentario', ['noticia_id' => $noticia->id]);

        $dados = $request->validate([
            'autor'   => ['required', 'string', 'max:255'],
            'conteudo'=> ['required', 'string', 'max:1000'],
        ]);

        $comentario = Comentario::create([
            'noticia_id' => $noticia->id,
            'autor'      => $dados['autor'],
            'conteudo'   => $dados['conteudo'],
        ]);

        LogService::info('2 - comentario criado', ['comentario_id' => $comentario->id]);

        return response()->json($comentario, 201);
    }
}
