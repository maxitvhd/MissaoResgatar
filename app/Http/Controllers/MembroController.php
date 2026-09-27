<?php

namespace App\Http\Controllers;

use App\Models\Membro;
use App\Services\LogService;
use Illuminate\Http\Request;

class MembroController extends Controller
{
    /**
     * Lista todos os membros com filtros e contagem de contribuições.
     */
    public function index(Request $request)
    {
        LogService::info('1 - listando membros');

        $query = Membro::query()->withCount(['transacoes', 'dizimos', 'ofertas']);

        if ($request->filled('busca')) {
            $busca = $request->string('busca');
            $query->where(function ($q) use ($busca) {
                $q->where('nome', 'like', "%{$busca}%")
                  ->orWhere('email', 'like', "%{$busca}%")
                  ->orWhere('telefone', 'like', "%{$busca}%")
                  ->orWhere('cargo_ministerio', 'like', "%{$busca}%");
            });
        }

        if ($request->filled('cargo')) {
            $query->where('cargo_ministerio', $request->string('cargo'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $membros = $query->orderBy('nome')->get();

        LogService::info('2 - membros listados', ['total' => $membros->count()]);

        return response()->json($membros);
    }

    /**
     * Retorna os detalhes de um membro específico com seu histórico financeiro.
     */
    public function detalhes(Membro $membro)
    {
        LogService::info('1 - detalhando membro', ['membro_id' => $membro->id]);

        $membro->load([
            'transacoes' => function ($q) {
                $q->orderByDesc('data')->orderByDesc('id');
            },
            'pedidos.produto'
        ]);

        $totalDizimos = $membro->transacoes->where('categoria', 'dizimo')->where('status', 'confirmado')->sum('valor');
        $totalOfertas = $membro->transacoes->where('categoria', 'oferta')->where('status', 'confirmado')->sum('valor');
        $totalGeral = $membro->transacoes->where('tipo', 'entrada')->where('status', 'confirmado')->sum('valor');

        return response()->json([
            'membro' => $membro,
            'totais' => [
                'dizimos' => $totalDizimos,
                'ofertas' => $totalOfertas,
                'geral' => $totalGeral,
            ],
        ]);
    }

    /**
     * Cria um novo membro.
     */
    public function criar(Request $request)
    {
        LogService::info('1 - criando novo membro');

        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'cpf' => ['nullable', 'string', 'max:20'],
            'data_nascimento' => ['nullable', 'date'],
            'data_membro' => ['nullable', 'date'],
            'cargo_ministerio' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:ativo,inativo,transferido'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'string', 'max:50'],
            'foto_url' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $membro = Membro::create($dados);

        LogService::info('2 - membro criado com sucesso', ['membro_id' => $membro->id]);

        return response()->json($membro, 201);
    }

    /**
     * Atualiza os dados de um membro.
     */
    public function atualizar(Request $request, Membro $membro)
    {
        LogService::info('1 - atualizando membro', ['membro_id' => $membro->id]);

        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'cpf' => ['nullable', 'string', 'max:20'],
            'data_nascimento' => ['nullable', 'date'],
            'data_membro' => ['nullable', 'date'],
            'cargo_ministerio' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:ativo,inativo,transferido'],
            'endereco' => ['nullable', 'string', 'max:255'],
            'cidade' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'string', 'max:50'],
            'foto_url' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $membro->update($dados);

        LogService::info('2 - membro atualizado com sucesso', ['membro_id' => $membro->id]);

        return response()->json($membro);
    }

    /**
     * Remove um membro.
     */
    public function excluir(Membro $membro)
    {
        LogService::info('1 - excluindo membro', ['membro_id' => $membro->id]);

        $membro->delete();

        LogService::info('2 - membro excluido com sucesso');

        return response()->json(['message' => 'Membro removido com sucesso']);
    }
}
