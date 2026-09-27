<?php

namespace App\Http\Controllers;

use App\Models\Galeria;
use App\Http\Resources\GaleriaResource;
use App\Services\LogService;
use Illuminate\Http\Request;

/**
 * Controlador da galeria de fotos.
 */
class GaleriaController extends Controller
{

    /**
     * Lista os itens da galeria (publico).
     */
    public function index()
    {
        LogService::info('1 - listando galeria');

        $itens = Galeria::orderByDesc('created_at')->get();

        LogService::info('2 - galeria carregada', ['total' => $itens->count()]);

        return GaleriaResource::collection($itens);
    }

    /**
     * Cria um item de galeria (admin).
     */
    public function criar(Request $request)
    {
        LogService::info('1 - salvando item da galeria');

        $dados = $request->validate([
            'titulo'     => ['required', 'string', 'max:255'],
            'descricao'  => ['nullable', 'string'],
            'url'        => ['required', 'string'],
            'categoria'  => ['nullable', 'string', 'max:100'],
        ]);

        $item = Galeria::create([
            'titulo'    => $dados['titulo'],
            'descricao' => $dados['descricao'] ?? null,
            'url'       => $dados['url'],
            'categoria' => $dados['categoria'] ?? 'Geral',
        ]);

        LogService::info('2 - item criado', ['galeria_id' => $item->id]);

        return (new GaleriaResource($item))->response()->setStatusCode(201);
    }

    /**
     * Atualiza um item da galeria (admin).
     */
    public function atualizar(Request $request, Galeria $item)
    {
        LogService::info('1 - atualizando item da galeria', ['galeria_id' => $item->id]);

        $dados = $request->validate([
            'titulo'    => ['sometimes', 'string', 'max:255'],
            'descricao' => ['sometimes', 'nullable', 'string'],
            'url'       => ['sometimes', 'string'],
            'categoria' => ['sometimes', 'string', 'max:100'],
        ]);

        $item->update($dados);

        LogService::info('2 - item atualizado', ['galeria_id' => $item->id]);

        return new GaleriaResource($item);
    }

    /**
     * Remove um item da galeria (admin).
     */
    public function excluir(Galeria $item)
    {
        LogService::info('1 - excluindo item da galeria', ['galeria_id' => $item->id]);

        $item->delete();

        LogService::info('2 - item excluido', ['galeria_id' => $item->id]);

        return response()->json(['success' => true]);
    }

    /**
     * Cria multiplas fotos na galeria em lote (Album).
     */
    public function criarLote(Request $request)
    {
        LogService::info('1 - salvando lote de fotos da galeria');

        $dados = $request->validate([
            'categoria'        => ['required', 'string', 'max:100'],
            'titulo_padrao'    => ['nullable', 'string', 'max:255'],
            'descricao_padrao' => ['nullable', 'string'],
            'fotos'            => ['required', 'array', 'min:1'],
            'fotos.*.url'      => ['required', 'string'],
            'fotos.*.titulo'   => ['nullable', 'string', 'max:255'],
            'fotos.*.descricao'=> ['nullable', 'string'],
        ]);

        $categoria = $dados['categoria'] ?: 'Cultos';
        $tituloBase = $dados['titulo_padrao'] ?: 'Momento Especial';
        $descBase = $dados['descricao_padrao'] ?? null;
        $total = count($dados['fotos']);

        $criados = [];
        foreach ($dados['fotos'] as $index => $foto) {
            $itemTitulo = !empty($foto['titulo']) 
                ? $foto['titulo'] 
                : ($total > 1 ? "{$tituloBase} #" . ($index + 1) : $tituloBase);

            $item = Galeria::create([
                'titulo'    => $itemTitulo,
                'descricao' => $foto['descricao'] ?? $descBase,
                'url'       => $foto['url'],
                'categoria' => $categoria,
            ]);

            $criados[] = $item;
        }

        LogService::info('2 - lote de fotos criado com sucesso', ['total' => count($criados)]);

        return response()->json([
            'data'    => GaleriaResource::collection($criados),
            'total'   => count($criados),
            'message' => count($criados) . ' foto(s) adicionada(s) à galeria com sucesso!',
        ], 201);
    }
}
