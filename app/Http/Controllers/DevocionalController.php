<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Http\Resources\DevocionalResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador de devocionais (reflexoes diarias).
 */
class DevocionalController extends Controller
{

    /**
     * Lista todos os devocionais (publico).
     */
    public function index()
    {
        LogService::info('1 - listando devocionais');

        $devocionais = Devocional::orderByDesc('created_at')->get();

        LogService::info('2 - devocionais carregados', ['total' => $devocionais->count()]);

        return DevocionalResource::collection($devocionais);
    }

    /**
     * Exibe um devocional e incrementa leituras.
     */
    public function mostrar(Devocional $devocional)
    {
        LogService::info('1 - exibindo devocional', ['devocional_id' => $devocional->id]);

        $devocional->increment('leituras');

        return new DevocionalResource($devocional->fresh());
    }

    /**
     * Cria um novo devocional (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando devocional');

        $dados = $request->validate([
            'titulo'     => ['required', 'string', 'max:255'],
            'conteudo'   => ['required', 'string'],
            'escritura'  => ['required', 'string', 'max:255'],
            'categoria'  => ['nullable', 'string', 'max:100'],
        ]);

        $devocional = Devocional::create([
            'titulo'    => $dados['titulo'],
            'conteudo'  => $dados['conteudo'],
            'escritura' => $dados['escritura'],
            'categoria' => $dados['categoria'] ?? 'Edificação',
            'leituras'  => 0,
        ]);

        LogService::info('2 - devocional criado', ['devocional_id' => $devocional->id]);

        return (new DevocionalResource($devocional))->response()->setStatusCode(201);
    }

    /**
     * Atualiza um devocional (admin).
     */
    public function atualizar(Request $request, Devocional $devocional)
    {
        LogService::info('1 - atualizando devocional', ['devocional_id' => $devocional->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'conteudo'  => ['sometimes', 'string'],
            'escritura' => ['sometimes', 'string', 'max:255'],
            'categoria' => ['sometimes', 'string', 'max:100'],
        ]);

        $devocional->update($dados);

        LogService::info('2 - devocional atualizado', ['devocional_id' => $devocional->id]);

        return new DevocionalResource($devocional);
    }

    /**
     * Remove um devocional (admin).
     */
    public function excluir(Devocional $devocional)
    {
        LogService::info('1 - excluindo devocional', ['devocional_id' => $devocional->id]);

        $devocional->delete();

        LogService::info('2 - devocional excluido', ['devocional_id' => $devocional->id]);

        return response()->json(['success' => true]);
    }
}
