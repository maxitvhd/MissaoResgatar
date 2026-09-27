<?php

namespace App\Http\Controllers;

use App\Models\Caravana;
use App\Http\Resources\CaravanaResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de caravanas (inscricao de igrejas/grupos).
 */
class CaravanaController extends Controller
{

    /**
     * Lista as caravanas (admin).
     */
    public function index()
    {
        LogService::info('1 - listando caravanas');

        $caravanas = Caravana::orderByDesc('created_at')->get();

        LogService::info('2 - caravanas carregadas', ['total' => $caravanas->count()]);

        return CaravanaResource::collection($caravanas);
    }

    /**
     * Cadastra uma nova caravana (publico - formulario).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando inscricao de caravana');

        $dados = $request->validate([
            'igreja'              => ['required', 'string', 'max:255'],
            'pastor'              => ['nullable', 'string', 'max:255'],
            'nome_responsavel'    => ['required', 'string', 'max:255'],
            'telefone'            => ['required', 'string', 'max:30'],
            'quantidade_pessoas'  => ['nullable', 'integer', 'min:0'],
            'cidade'              => ['nullable', 'string', 'max:100'],
        ]);

        $caravana = Caravana::create([
            'igreja'             => $dados['igreja'],
            'pastor'             => $dados['pastor'] ?? null,
            'nome_responsavel'   => $dados['nome_responsavel'],
            'telefone'           => $dados['telefone'],
            'quantidade_pessoas' => $dados['quantidade_pessoas'] ?? 0,
            'cidade'             => $dados['cidade'] ?? 'Itaquaquecetuba',
        ]);

        LogService::info('2 - caravana cadastrada', ['caravana_id' => $caravana->id]);

        return (new CaravanaResource($caravana))->response()->setStatusCode(201);
    }

    /**
     * Atualiza uma caravana (admin).
     */
    public function atualizar(Request $request, Caravana $caravana)
    {
        LogService::info('1 - atualizando caravana', ['caravana_id' => $caravana->id]);

        $dados = $request->validate([
            'igreja'             => ['sometimes', 'string', 'max:255'],
            'pastor'             => ['sometimes', 'nullable', 'string', 'max:255'],
            'nome_responsavel'   => ['sometimes', 'string', 'max:255'],
            'telefone'           => ['sometimes', 'string', 'max:30'],
            'quantidade_pessoas' => ['sometimes', 'integer', 'min:0'],
            'cidade'             => ['sometimes', 'string', 'max:100'],
        ]);

        $caravana->update($dados);

        LogService::info('2 - caravana atualizada', ['caravana_id' => $caravana->id]);

        return new CaravanaResource($caravana);
    }

    /**
     * Remove uma caravana (admin).
     */
    public function excluir(Caravana $caravana)
    {
        LogService::info('1 - excluindo caravana', ['caravana_id' => $caravana->id]);

        $caravana->delete();

        LogService::info('2 - caravana excluida', ['caravana_id' => $caravana->id]);

        return response()->json(['success' => true]);
    }
}
