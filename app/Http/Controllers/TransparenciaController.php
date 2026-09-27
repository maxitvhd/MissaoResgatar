<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracaoSite;
use App\Models\TransacaoFinanceira;
use App\Services\LogService;
use App\Services\SeoService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransparenciaController extends Controller
{
    /**
     * Renderiza a página pública de Transparência da Igreja.
     */
    public function paginaTransparencia()
    {
        LogService::info('1 - acessando portal publico de transparencia');

        $configuracoes = ConfiguracaoSite::obter();
        $secoesAtivas = $configuracoes->secoes_ativas;

        // Se a seção de transparência estiver desativada, redireciona ou avisa
        $ativa = $secoesAtivas['transparencia'] ?? true;
        if (!$ativa) {
            return redirect()->route('home')->with('info', 'O portal público de transparência está temporariamente desativado pela administração.');
        }

        $dados = $this->compilarDadosPublicos();

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Transparência e Prestação de Contas')
            ->descricao('Acompanhe a prestação de contas, dízimos, ofertas e gastos da Missão Resgatar de forma aberta e transparente.')
            ->palavrasChave(['transparência da igreja', 'prestação de contas', 'dízimos'])
            ->jsonLd(array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'WebPage',
                'name' => 'Transparência e Prestação de Contas',
                'url' => route('transparencia'),
                'isPartOf' => ['@id' => rtrim(config('app.url'), '/') . '/#igreja'],
            ])));

        return Inertia::render('Public/Transparencia', [
            'transparencia' => $dados,
            'configuracoes' => $configuracoes,
        ]);
    }

    /**
     * Retorna os dados públicos da transparência em JSON.
     */
    public function apiDados()
    {
        return response()->json($this->compilarDadosPublicos());
    }

    /**
     * Compila os totais, categorias de destinação e projetos sociais para o público.
     * Não expõe dados confidenciais de membros individuais (respeito à privacidade).
     */
    private function compilarDadosPublicos(): array
    {
        $anoAtual = Carbon::now()->year;

        // Transações confirmadas do ano atual
        $transacoesAno = TransacaoFinanceira::where('status', 'confirmado')
            ->whereYear('data', $anoAtual);

        $totalEntradas = (clone $transacoesAno)->where('tipo', 'entrada')->sum('valor');
        $totalSaidas = (clone $transacoesAno)->where('tipo', 'saida')->sum('valor');

        // Destinações públicas (onde os recursos foram aplicados)
        $destinacoes = (clone $transacoesAno)
            ->where('tipo', 'saida')
            ->select('categoria', DB::raw('SUM(valor) as total'), DB::raw('COUNT(*) as quantidade'))
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) use ($totalSaidas) {
                $nomesLegiveis = [
                    'acao_social'        => 'Ação Social & Alimentos',
                    'manutencao_templo'  => 'Manutenção do Templo & Estrutura',
                    'equipamentos_som'   => 'Equipamentos de Som & Mídia',
                    'contas_consumo'     => 'Custos Operacionais (Luz/Água/Net)',
                    'ajuda_custo'        => 'Missões & Ajuda Ministerial',
                    'evangelismo'        => 'Evangelismo & Eventos Comunitários',
                    'outra_saida'        => 'Outras Aplicações no Reino',
                ];

                $item->titulo = $nomesLegiveis[$item->categoria] ?? ucfirst(str_replace('_', ' ', $item->categoria));
                $item->porcentagem = $totalSaidas > 0 ? round(($item->total / $totalSaidas) * 100, 1) : 0;
                return $item;
            });

        // Fontes de arrecadação consolidada
        $fontes = (clone $transacoesAno)
            ->where('tipo', 'entrada')
            ->select('categoria', DB::raw('SUM(valor) as total'))
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) use ($totalEntradas) {
                $nomesLegiveis = [
                    'dizimo'         => 'Dízimos Fidelidade',
                    'oferta'         => 'Ofertas Voluntárias dos Cultos',
                    'venda_loja'     => 'Loja Oficial da Missão',
                    'evento_servico' => 'Eventos & Inscrições',
                    'doacao'         => 'Doações Especiais',
                    'outra_entrada'  => 'Outras Contribuições',
                ];
                $item->titulo = $nomesLegiveis[$item->categoria] ?? ucfirst(str_replace('_', ' ', $item->categoria));
                $item->porcentagem = $totalEntradas > 0 ? round(($item->total / $totalEntradas) * 100, 1) : 0;
                return $item;
            });

        // Histórico recente público (descrições gerais de saídas/investimentos no reino)
        $investimentosRecentes = TransacaoFinanceira::where('status', 'confirmado')
            ->where('tipo', 'saida')
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->limit(8)
            ->get(['id', 'categoria', 'descricao', 'valor', 'data']);

        return [
            'ano' => $anoAtual,
            'total_arrecadado' => (float) $totalEntradas,
            'total_investido' => (float) $totalSaidas,
            'saldo_reserva' => (float) ($totalEntradas - $totalSaidas),
            'destinacoes' => $destinacoes,
            'fontes' => $fontes,
            'investimentos_recentes' => $investimentosRecentes,
        ];
    }
}
