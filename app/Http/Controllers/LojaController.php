<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProduto;
use App\Models\Produto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LojaController extends Controller
{
    /**
     * Renderiza a pagina publica da Loja com Inertia
     */
    public function paginaLoja(Request $request)
    {
        $categorias = CategoriaProduto::withCount('produtos')->get();
        $produtos = Produto::with('categoria')
            ->where('em_estoque', true)
            ->latest()
            ->get();

        return Inertia::render('Public/Loja', [
            'categorias' => $categorias,
            'produtos'   => $produtos->map(fn($p) => $this->formatarProduto($p)),
        ]);
    }

    /**
     * Retorna a lista de produtos em formato JSON para a API
     */
    public function index(Request $request)
    {
        $query = Produto::with('categoria');

        if ($request->has('categoria_id') && !empty($request->categoria_id)) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->has('destaque')) {
            $query->where('destaque', true);
        }

        $produtos = $query->latest()->get();

        return response()->json([
            'data' => $produtos->map(fn($p) => $this->formatarProduto($p))
        ]);
    }

    public function categorias()
    {
        $categorias = CategoriaProduto::withCount('produtos')->get();
        return response()->json(['data' => $categorias]);
    }

    public function criarCategoria(Request $request)
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:100',
            'descricao' => 'nullable|string',
        ]);

        $categoria = CategoriaProduto::create($dados);
        return response()->json(['data' => $categoria], 201);
    }

    public function excluirCategoria(CategoriaProduto $categoria)
    {
        $categoria->delete();
        return response()->json(['message' => 'Categoria excluída com sucesso']);
    }

    public function criarProduto(Request $request)
    {
        $dados = $request->validate([
            'nome' => 'required|string|max:255',
            'categoria_id' => 'nullable|exists:categorias_produtos,id',
            'descricao' => 'nullable|string',
            'detalhes' => 'nullable|string',
            'imagem_url' => 'nullable|string',
            'imagens_galeria' => 'nullable|array',
            'preco' => 'required|numeric|min:0',
            'preco_desconto' => 'nullable|numeric|min:0',
            'informacoes_frete' => 'nullable|string',
            'link_compra' => 'nullable|string|max:1000',
            'em_estoque' => 'boolean',
            'destaque' => 'boolean',
        ]);

        $produto = Produto::create($dados);

        return response()->json(['data' => $this->formatarProduto($produto->load('categoria'))], 201);
    }

    public function atualizarProduto(Request $request, Produto $produto)
    {
        $dados = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'categoria_id' => 'nullable|exists:categorias_produtos,id',
            'descricao' => 'nullable|string',
            'detalhes' => 'nullable|string',
            'imagem_url' => 'nullable|string',
            'imagens_galeria' => 'nullable|array',
            'preco' => 'sometimes|required|numeric|min:0',
            'preco_desconto' => 'nullable|numeric|min:0',
            'informacoes_frete' => 'nullable|string',
            'link_compra' => 'nullable|string|max:1000',
            'em_estoque' => 'boolean',
            'destaque' => 'boolean',
        ]);

        $produto->update($dados);

        return response()->json(['data' => $this->formatarProduto($produto->fresh()->load('categoria'))]);
    }

    public function excluirProduto(Produto $produto)
    {
        $produto->delete();
        return response()->json(['message' => 'Produto excluído com sucesso']);
    }

    private function formatarProduto(Produto $p): array
    {
        $descontoPercent = null;
        if ($p->preco_desconto && $p->preco > 0 && $p->preco_desconto < $p->preco) {
            $descontoPercent = round((($p->preco - $p->preco_desconto) / $p->preco) * 100);
        }

        return [
            'id' => (string) $p->id,
            'name' => $p->nome,
            'slug' => $p->slug,
            'categoryId' => $p->categoria_id ? (string) $p->categoria_id : null,
            'categoryName' => $p->categoria?->nome ?? 'Diversos',
            'description' => $p->descricao ?? '',
            'details' => $p->detalhes ?? '',
            'imageUrl' => $p->imagem_url,
            'galleryImages' => $p->imagens_galeria ?? [],
            'price' => (float) $p->preco,
            'discountPrice' => $p->preco_desconto ? (float) $p->preco_desconto : null,
            'discountPercent' => $descontoPercent,
            'shippingInfo' => $p->informacoes_frete ?? 'Envio para todo o Brasil',
            'purchaseUrl' => $p->link_compra,
            'inStock' => (bool) $p->em_estoque,
            'isFeatured' => (bool) $p->destaque,
            'createdAt' => $p->created_at?->toISOString(),
        ];
    }
}
