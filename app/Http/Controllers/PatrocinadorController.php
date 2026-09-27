<?php

namespace App\Http\Controllers;

use App\Models\Patrocinador;
use App\Http\Resources\PatrocinadorResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de patrocinadores e apoiadores.
 */
class PatrocinadorController extends Controller
{

    /**
     * Lista os patrocinadores (publico).
     */
    public function index()
    {
        LogService::info('1 - listando patrocinadores');

        $patrocinadores = Patrocinador::orderBy('nome')->get();

        LogService::info('2 - patrocinadores carregados', ['total' => $patrocinadores->count()]);

        return PatrocinadorResource::collection($patrocinadores);
    }

    /**
     * Cria um patrocinador (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando patrocinador');

        $dados = $request->validate([
            'nome'       => ['required', 'string', 'max:255'],
            'url_imagem' => ['required', 'string'],
            'link'       => ['nullable', 'string'],
        ]);

        $patrocinador = Patrocinador::create([
            'nome'       => $dados['nome'],
            'url_imagem' => $dados['url_imagem'],
            'link'       => $dados['link'] ?? null,
        ]);

        LogService::info('2 - patrocinador criado', ['patrocinador_id' => $patrocinador->id]);

        return (new PatrocinadorResource($patrocinador))->response()->setStatusCode(201);
    }

    /**
     * Atualiza um patrocinador (admin).
     */
    public function atualizar(Request $request, Patrocinador $patrocinador)
    {
        LogService::info('1 - atualizando patrocinador', ['patrocinador_id' => $patrocinador->id]);

        $dados = $request->validate([
            'nome'       => ['sometimes', 'string', 'max:255'],
            'url_imagem' => ['sometimes', 'string'],
            'link'       => ['sometimes', 'nullable', 'string'],
        ]);

        $patrocinador->update($dados);

        LogService::info('2 - patrocinador atualizado', ['patrocinador_id' => $patrocinador->id]);

        return new PatrocinadorResource($patrocinador);
    }

    /**
     * Remove um patrocinador (admin).
     */
    public function excluir(Patrocinador $patrocinador)
    {
        LogService::info('1 - excluindo patrocinador', ['patrocinador_id' => $patrocinador->id]);

        $patrocinador->delete();

        LogService::info('2 - patrocinador excluido', ['patrocinador_id' => $patrocinador->id]);

        return response()->json(['success' => true]);
    }
}
