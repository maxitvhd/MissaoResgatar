<?php

namespace App\Http\Controllers;

use App\Models\AulaFechada;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AulaFechadaController extends Controller
{
    /**
     * Pagina exclusiva de aulas fechadas (Inertia - restrito para logados)
     */
    public function paginaAulas(Request $request)
    {
        $aulas = AulaFechada::where('ativo', true)
            ->orderBy('modulo', 'asc')
            ->orderBy('ordem', 'asc')
            ->get();

        return Inertia::render('Public/Aulas', [
            'aulas' => $aulas->map(fn($a) => $this->formatarAula($a)),
        ]);
    }

    /**
     * API JSON de listagem de aulas
     */
    public function index()
    {
        $aulas = AulaFechada::orderBy('modulo', 'asc')
            ->orderBy('ordem', 'asc')
            ->get();

        return response()->json([
            'data' => $aulas->map(fn($a) => $this->formatarAula($a))
        ]);
    }

    public function criar(Request $request)
    {
        $dados = $request->validate([
            'modulo' => 'required|string|max:255',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'url_video' => 'required|string|max:500',
            'duracao' => 'nullable|string|max:50',
            'material_url' => 'nullable|string|max:500',
            'ordem' => 'integer',
            'ativo' => 'boolean',
        ]);

        $aula = AulaFechada::create($dados);

        return response()->json(['data' => $this->formatarAula($aula)], 201);
    }

    public function atualizar(Request $request, AulaFechada $aula)
    {
        $dados = $request->validate([
            'modulo' => 'sometimes|required|string|max:255',
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'url_video' => 'sometimes|required|string|max:500',
            'duracao' => 'nullable|string|max:50',
            'material_url' => 'nullable|string|max:500',
            'ordem' => 'integer',
            'ativo' => 'boolean',
        ]);

        $aula->update($dados);

        return response()->json(['data' => $this->formatarAula($aula->fresh())]);
    }

    public function excluir(AulaFechada $aula)
    {
        $aula->delete();
        return response()->json(['message' => 'Aula excluída com sucesso']);
    }

    private function formatarAula(AulaFechada $a): array
    {
        return [
            'id' => (string) $a->id,
            'module' => $a->modulo,
            'title' => $a->titulo,
            'description' => $a->descricao ?? '',
            'videoUrl' => $a->url_video,
            'duration' => $a->duracao ?? '',
            'materialUrl' => $a->material_url,
            'order' => (int) $a->ordem,
            'active' => (bool) $a->ativo,
            'createdAt' => $a->created_at?->toISOString(),
        ];
    }
}
