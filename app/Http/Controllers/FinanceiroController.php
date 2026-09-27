<?php

namespace App\Http\Controllers;

use App\Models\Membro;
use App\Models\PedidoLoja;
use App\Models\Produto;
use App\Models\TransacaoFinanceira;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanceiroController extends Controller
{
    /**
     * Retorna o dashboard financeiro consolidado com cruzamento de dados.
     */
    public function dashboard(Request $request)
    {
        LogService::info('1 - gerando dashboard financeiro');

        $periodo = $request->input('periodo', 'ano_atual'); // mes_atual, ano_atual, tudo
        $queryBase = TransacaoFinanceira::query()->where('status', 'confirmado');

        if ($periodo === 'mes_atual') {
            $queryBase->whereMonth('data', Carbon::now()->month)
                      ->whereYear('data', Carbon::now()->year);
        } elseif ($periodo === 'ano_atual') {
            $queryBase->whereYear('data', Carbon::now()->year);
        }

        // Totais gerais
        $totalEntradas = (clone $queryBase)->where('tipo', 'entrada')->sum('valor');
        $totalSaidas = (clone $queryBase)->where('tipo', 'saida')->sum('valor');
        $saldo = $totalEntradas - $totalSaidas;

        // Cruzamento de Entradas por Categoria
        $entradasPorCategoria = (clone $queryBase)
            ->where('tipo', 'entrada')
            ->select('categoria', DB::raw('SUM(valor) as total'), DB::raw('COUNT(*) as quantidade'))
            ->groupBy('categoria')
            ->get()
            ->map(function ($item) use ($totalEntradas) {
                $item->porcentagem = $totalEntradas > 0 ? round(($item->total / $totalEntradas) * 100, 1) : 0;
                return $item;
            });

        // Cruzamento de Saídas por Categoria
        $saidasPorCategoria = (clone $queryBase)
            ->where('tipo', 'saida')
            ->select('categoria', DB::raw('SUM(valor) as total'), DB::raw('COUNT(*) as quantidade'))
            ->groupBy('categoria')
            ->get()
            ->map(function ($item) use ($totalSaidas) {
                $item->porcentagem = $totalSaidas > 0 ? round(($item->total / $totalSaidas) * 100, 1) : 0;
                return $item;
            });

        // Contagem de pedidos pendentes da loja aguardando aprovação
        $pedidosPendentesCount = PedidoLoja::where('status', 'pendente')->count();
        $totalPedidosPendentesValor = PedidoLoja::where('status', 'pendente')->sum('valor_total');

        // Evolução dos últimos 6 meses
        $meses = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = Carbon::now()->subMonths($i);
            $mesNome = $mes->translatedFormat('M/Y');
            $entradasMes = TransacaoFinanceira::where('status', 'confirmado')
                ->where('tipo', 'entrada')
                ->whereMonth('data', $mes->month)
                ->whereYear('data', $mes->year)
                ->sum('valor');
            $saidasMes = TransacaoFinanceira::where('status', 'confirmado')
                ->where('tipo', 'saida')
                ->whereMonth('data', $mes->month)
                ->whereYear('data', $mes->year)
                ->sum('valor');

            $meses[] = [
                'mes' => $mesNome,
                'entradas' => (float) $entradasMes,
                'saidas' => (float) $saidasMes,
                'saldo' => (float) ($entradasMes - $saidasMes),
            ];
        }

        // Ultimas 10 transações
        $ultimasTransacoes = TransacaoFinanceira::with('membro')
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        LogService::info('2 - dashboard financeiro compilado', [
            'entradas' => $totalEntradas,
            'saidas' => $totalSaidas,
            'saldo' => $saldo,
        ]);

        return response()->json([
            'totais' => [
                'entradas' => (float) $totalEntradas,
                'saidas' => (float) $totalSaidas,
                'saldo' => (float) $saldo,
                'pedidos_pendentes_count' => $pedidosPendentesCount,
                'pedidos_pendentes_valor' => (float) $totalPedidosPendentesValor,
            ],
            'entradas_por_categoria' => $entradasPorCategoria,
            'saidas_por_categoria' => $saidasPorCategoria,
            'evolucao_mensal' => $meses,
            'ultimas_transacoes' => $ultimasTransacoes,
        ]);
    }

    /**
     * Lista transações financeiras com filtros avançados.
     */
    public function transacoes(Request $request)
    {
        LogService::info('1 - listando transacoes');

        $query = TransacaoFinanceira::with('membro', 'pedidoLoja.produto');

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->string('tipo'));
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->string('categoria'));
        }

        if ($request->filled('membro_id')) {
            $query->where('membro_id', $request->integer('membro_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('data_inicio')) {
            $query->whereDate('data', '>=', $request->input('data_inicio'));
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('data', '<=', $request->input('data_fim'));
        }

        if ($request->filled('busca')) {
            $busca = $request->string('busca');
            $query->where(function ($q) use ($busca) {
                $q->where('descricao', 'like', "%{$busca}%")
                  ->orWhere('data_culto_evento', 'like', "%{$busca}%")
                  ->orWhereHas('membro', function ($mq) use ($busca) {
                      $mq->where('nome', 'like', "%{$busca}%");
                  });
            });
        }

        $transacoes = $query->orderByDesc('data')->orderByDesc('id')->paginate(30);

        LogService::info('2 - transacoes listadas', ['total' => $transacoes->total()]);

        return response()->json($transacoes);
    }

    /**
     * Cria uma nova transação financeira manual (Entrada ou Saída).
     */
    public function criarTransacao(Request $request)
    {
        LogService::info('1 - criando transacao financeira');

        $dados = $request->validate([
            'tipo' => ['required', 'in:entrada,saida'],
            'categoria' => ['required', 'string', 'max:50'],
            'descricao' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data' => ['required', 'date'],
            'data_culto_evento' => ['nullable', 'string', 'max:150'],
            'metodo_pagamento' => ['nullable', 'string', 'max:50'],
            'membro_id' => ['nullable', 'exists:membros,id'],
            'status' => ['required', 'in:confirmado,pendente,cancelado'],
            'comprovante_url' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $transacao = TransacaoFinanceira::create($dados);

        LogService::info('2 - transacao financeira criada com sucesso', ['id' => $transacao->id]);

        return response()->json($transacao->load('membro'), 201);
    }

    /**
     * Atualiza uma transação financeira.
     */
    public function atualizarTransacao(Request $request, TransacaoFinanceira $transacao)
    {
        LogService::info('1 - atualizando transacao financeira', ['id' => $transacao->id]);

        $dados = $request->validate([
            'tipo' => ['required', 'in:entrada,saida'],
            'categoria' => ['required', 'string', 'max:50'],
            'descricao' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'data' => ['required', 'date'],
            'data_culto_evento' => ['nullable', 'string', 'max:150'],
            'metodo_pagamento' => ['nullable', 'string', 'max:50'],
            'membro_id' => ['nullable', 'exists:membros,id'],
            'status' => ['required', 'in:confirmado,pendente,cancelado'],
            'comprovante_url' => ['nullable', 'string'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $transacao->update($dados);

        LogService::info('2 - transacao financeira atualizada com sucesso', ['id' => $transacao->id]);

        return response()->json($transacao->load('membro'));
    }

    /**
     * Exclui uma transação financeira.
     */
    public function excluirTransacao(TransacaoFinanceira $transacao)
    {
        LogService::info('1 - excluindo transacao financeira', ['id' => $transacao->id]);

        $transacao->delete();

        LogService::info('2 - transacao excluida');

        return response()->json(['message' => 'Transação removida com sucesso.']);
    }

    /**
     * Lista pedidos e intenções de compra originados na loja.
     */
    public function pedidosLoja(Request $request)
    {
        LogService::info('1 - listando pedidos da loja');

        $query = PedidoLoja::with('produto', 'membro', 'transacaoFinanceira');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('busca')) {
            $busca = $request->string('busca');
            $query->where(function ($q) use ($busca) {
                $q->where('nome_cliente', 'like', "%{$busca}%")
                  ->orWhere('telefone_cliente', 'like', "%{$busca}%")
                  ->orWhereHas('produto', function ($pq) use ($busca) {
                      $pq->where('nome', 'like', "%{$busca}%");
                  });
            });
        }

        $pedidos = $query->orderByDesc('id')->paginate(30);

        return response()->json($pedidos);
    }

    /**
     * Atualiza o status do pedido da loja.
     * Quando marcado como 'concluido' (OK), gera automaticamente uma entrada no financeiro!
     */
    public function atualizarStatusPedido(Request $request, PedidoLoja $pedido)
    {
        LogService::info('1 - atualizando status de pedido da loja', ['pedido_id' => $pedido->id]);

        $dados = $request->validate([
            'status' => ['required', 'in:pendente,concluido,cancelado'],
            'membro_id' => ['nullable', 'exists:membros,id'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $pedido->update($dados);

        // Se o status for concluido, criar ou confirmar entrada no financeiro
        if ($pedido->status === 'concluido') {
            $transacao = TransacaoFinanceira::firstOrNew(['pedido_loja_id' => $pedido->id]);
            
            $transacao->tipo = 'entrada';
            $transacao->categoria = 'venda_loja';
            $transacao->descricao = "Venda Loja: " . ($pedido->produto ? $pedido->produto->nome : 'Produto') . " (#{$pedido->id} - {$pedido->nome_cliente})";
            $transacao->valor = $pedido->valor_total;
            $transacao->data = Carbon::now()->toDateString();
            $transacao->metodo_pagamento = $pedido->origem_checkout;
            $transacao->membro_id = $pedido->membro_id;
            $transacao->status = 'confirmado';
            $transacao->observacoes = $pedido->observacoes ?: 'Venda confirmada pela loja online';
            $transacao->save();

            LogService::info('2 - entrada financeira contabilizada automaticamente para o pedido', ['transacao_id' => $transacao->id]);
        } elseif ($pedido->status === 'cancelado') {
            // Se foi cancelado e já tinha transação, marcar como cancelada
            TransacaoFinanceira::where('pedido_loja_id', $pedido->id)->update(['status' => 'cancelado']);
        }

        return response()->json($pedido->fresh(['produto', 'membro', 'transacaoFinanceira']));
    }

    /**
     * Endpoint para registrar o clique de compra da loja pública.
     * Cria o pedido com status 'pendente' aguardando confirmação.
     */
    public function registrarCliqueLoja(Request $request)
    {
        LogService::info('1 - registrando clique/intencao de compra na loja');

        $dados = $request->validate([
            'produto_id' => ['required', 'exists:produtos,id'],
            'nome_cliente' => ['nullable', 'string', 'max:255'],
            'telefone_cliente' => ['nullable', 'string', 'max:50'],
            'origem_checkout' => ['nullable', 'string', 'in:link_externo,whatsapp,direto'],
            'quantidade' => ['nullable', 'integer', 'min:1'],
        ]);

        $produto = Produto::findOrFail($dados['produto_id']);
        $quantidade = $dados['quantidade'] ?? 1;
        $precoUnitario = $produto->preco_desconto && $produto->preco_desconto > 0 
            ? $produto->preco_desconto 
            : $produto->preco;
        $valorTotal = $precoUnitario * $quantidade;

        $pedido = PedidoLoja::create([
            'produto_id' => $produto->id,
            'nome_cliente' => $dados['nome_cliente'] ?: 'Cliente Online (Link/WhatsApp)',
            'telefone_cliente' => $dados['telefone_cliente'] ?? null,
            'origem_checkout' => $dados['origem_checkout'] ?? 'link_externo',
            'quantidade' => $quantidade,
            'valor_unitario' => $precoUnitario,
            'valor_total' => $valorTotal,
            'status' => 'pendente',
            'observacoes' => "Clique registrado em " . Carbon::now()->format('d/m/Y H:i') . " para o produto: {$produto->nome}",
        ]);

        LogService::info('2 - intencao de compra registrada com status pendente', ['pedido_id' => $pedido->id]);

        return response()->json([
            'success' => true,
            'pedido_id' => $pedido->id,
            'status' => 'pendente',
        ], 201);
    }
}
