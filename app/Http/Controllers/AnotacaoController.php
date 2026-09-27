<?php

namespace App\Http\Controllers;

use App\Models\AnotacaoPessoal;
use App\Http\Resources\AnotacaoPessoalResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de anotacoes pessoais (notas em nuvem por usuario).
 * Somente o proprio usuario acessa suas anotacoes.
 */
class AnotacaoController extends Controller
{

    /**
     * Lista as anotacoes do usuario logado.
     */
    public function index(Request $request)
    {
        LogService::info('1 - listando anotacoes', ['usuario_id' => $request->user()->id]);

        $anotacoes = AnotacaoPessoal::where('usuario_id', $request->user()->id)
            ->orderByDesc('fixado')
            ->orderByDesc('updated_at')
            ->get();

        LogService::info('2 - anotacoes carregadas', ['total' => $anotacoes->count()]);

        return AnotacaoPessoalResource::collection($anotacoes);
    }

    /**
     * Cria uma nova anotacao para o usuario logado.
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando anotacao', ['usuario_id' => $request->user()->id]);

        $dados = $request->validate([
            'titulo'    => ['required', 'string', 'max:255'],
            'conteudo'  => ['required', 'string'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'cor'       => ['nullable', 'string', 'max:50'],
            'fixado'    => ['boolean'],
        ]);

        $anotacao = AnotacaoPessoal::create([
            'usuario_id'        => $request->user()->id,
            'titulo'            => $dados['titulo'],
            'conteudo'          => $dados['conteudo'],
            'categoria'         => $dados['categoria'] ?? 'Geral',
            'cor'               => $dados['cor'] ?? 'amber',
            'fixado'            => $dados['fixado'] ?? false,
            'ultima_atualizacao'=> now(),
        ]);

        LogService::info('2 - anotacao criada', ['anotacao_id' => $anotacao->id]);

        return (new AnotacaoPessoalResource($anotacao))->response()->setStatusCode(201);
    }

    /**
     * Atualiza uma anotacao (somente do proprio usuario).
     */
    public function atualizar(Request $request, AnotacaoPessoal $anotacao)
    {
        $this->autorizar($request, $anotacao);

        LogService::info('1 - atualizando anotacao', ['anotacao_id' => $anotacao->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'conteudo'  => ['sometimes', 'string'],
            'categoria' => ['nullable', 'string', 'max:100'],
            'cor'       => ['nullable', 'string', 'max:50'],
            'fixado'    => ['boolean'],
        ]);

        $anotacao->update(array_merge($dados, ['ultima_atualizacao' => now()]));

        LogService::info('2 - anotacao atualizada', ['anotacao_id' => $anotacao->id]);

        return new AnotacaoPessoalResource($anotacao);
    }

    /**
     * Remove uma anotacao (somente do proprio usuario).
     */
    public function excluir(Request $request, AnotacaoPessoal $anotacao)
    {
        $this->autorizar($request, $anotacao);

        LogService::info('1 - excluindo anotacao', ['anotacao_id' => $anotacao->id]);

        $anotacao->delete();

        LogService::info('2 - anotacao excluida', ['anotacao_id' => $anotacao->id]);

        return response()->json(['success' => true]);
    }

    /**
     * Seguranca: garante que a anotacao pertence ao usuario logado.
     */
    private function autorizar(Request $request, AnotacaoPessoal $anotacao): void
    {
        abort_if($anotacao->usuario_id !== $request->user()->id, 403, 'Anotação não pertence a este usuário.');
    }
}
