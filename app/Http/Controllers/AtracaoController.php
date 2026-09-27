<?php

namespace App\Http\Controllers;

use App\Models\Atracao;
use App\Http\Resources\AtracaoResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de atracoes (shows/bandas do evento).
 */
class AtracaoController extends Controller
{

    /**
     * Lista as atracoes (publico).
     */
    public function index()
    {
        LogService::info('1 - listando atracoes');

        $atracoes = Atracao::orderBy('horario')->get();

        LogService::info('2 - atracoes carregadas', ['total' => $atracoes->count()]);

        return AtracaoResource::collection($atracoes);
    }

    /**
     * Cria uma atracao (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando atracao');

        $dados = $request->validate([
            'nome'       => ['required', 'string', 'max:255'],
            'descricao'  => ['nullable', 'string'],
            'horario'    => ['nullable', 'string', 'max:10'],
            'imagem'     => ['nullable', 'string'],
        ]);

        $atracao = Atracao::create([
            'nome'      => $dados['nome'],
            'descricao' => $dados['descricao'] ?? null,
            'horario'   => $dados['horario'] ?? null,
            'imagem'    => $dados['imagem'] ?? null,
        ]);

        LogService::info('2 - atracao criada', ['atracao_id' => $atracao->id]);

        return (new AtracaoResource($atracao))->response()->setStatusCode(201);
    }

    /**
     * Atualiza uma atracao (admin).
     */
    public function atualizar(Request $request, Atracao $atracao)
    {
        LogService::info('1 - atualizando atracao', ['atracao_id' => $atracao->id]);

        $dados = $request->validate([
            'nome'      => ['sometimes', 'string', 'max:255'],
            'descricao' => ['sometimes', 'nullable', 'string'],
            'horario'   => ['sometimes', 'nullable', 'string', 'max:10'],
            'imagem'    => ['sometimes', 'nullable', 'string'],
        ]);

        $atracao->update($dados);

        LogService::info('2 - atracao atualizada', ['atracao_id' => $atracao->id]);

        return new AtracaoResource($atracao);
    }

    /**
     * Remove uma atracao (admin).
     */
    public function excluir(Atracao $atracao)
    {
        LogService::info('1 - excluindo atracao', ['atracao_id' => $atracao->id]);

        $atracao->delete();

        LogService::info('2 - atracao excluida', ['atracao_id' => $atracao->id]);

        return response()->json(['success' => true]);
    }
}
