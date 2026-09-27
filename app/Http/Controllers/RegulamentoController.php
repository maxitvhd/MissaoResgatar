<?php

namespace App\Http\Controllers;

use App\Models\Regulamento;
use App\Http\Resources\RegulamentoResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de regulamentos e normas do evento.
 */
class RegulamentoController extends Controller
{

    /**
     * Lista os regulamentos (publico).
     */
    public function index()
    {
        LogService::info('1 - listando regulamentos');

        $regulamentos = Regulamento::orderBy('categoria')->get();

        LogService::info('2 - regulamentos carregados', ['total' => $regulamentos->count()]);

        return RegulamentoResource::collection($regulamentos);
    }

    /**
     * Cria um regulamento (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando regulamento');

        $dados = $request->validate([
            'titulo'     => ['required', 'string', 'max:255'],
            'descricao'  => ['required', 'string'],
            'categoria'  => ['nullable', 'string', 'max:100'],
            'link'       => ['nullable', 'string'],
        ]);

        $regulamento = Regulamento::create([
            'titulo'    => $dados['titulo'],
            'descricao' => $dados['descricao'],
            'categoria' => $dados['categoria'] ?? 'Geral',
            'link'      => $dados['link'] ?? null,
        ]);

        LogService::info('2 - regulamento criado', ['regulamento_id' => $regulamento->id]);

        return (new RegulamentoResource($regulamento))->response()->setStatusCode(201);
    }

    /**
     * Atualiza um regulamento (admin).
     */
    public function atualizar(Request $request, Regulamento $regulamento)
    {
        LogService::info('1 - atualizando regulamento', ['regulamento_id' => $regulamento->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'descricao' => ['sometimes', 'string'],
            'categoria' => ['sometimes', 'string', 'max:100'],
            'link'      => ['sometimes', 'nullable', 'string'],
        ]);

        $regulamento->update($dados);

        LogService::info('2 - regulamento atualizado', ['regulamento_id' => $regulamento->id]);

        return new RegulamentoResource($regulamento);
    }

    /**
     * Remove um regulamento (admin).
     */
    public function excluir(Regulamento $regulamento)
    {
        LogService::info('1 - excluindo regulamento', ['regulamento_id' => $regulamento->id]);

        $regulamento->delete();

        LogService::info('2 - regulamento excluido', ['regulamento_id' => $regulamento->id]);

        return response()->json(['success' => true]);
    }
}
