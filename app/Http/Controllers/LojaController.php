<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProduto;
use App\Models\Produto;
use App\Services\LogService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LojaController extends Controller
{
    /**
     * Renderiza a pagina publica da Loja com Inertia
     */
    public function paginaLoja(Request $request)
    {
        LogService::info('1 - renderizando pagina da loja');

        $categorias = CategoriaProduto::withCount('produtos')->get();
        $produtos = Produto::with('categoria')
            ->where('em_estoque', true)
            ->latest()
            ->get();

        SeoService::atribuir(SeoService::daPagina()
            ->titulo('Loja Oficial')
            ->descricao('Compre produtos e materiais da Missão Resgatar. Livros, camisas, presentes e itens para a sua jornada de fé.')
            ->palavrasChave(['loja da igreja', 'produtos cristãos', 'camiseta igreja'])
            ->jsonLd($this->jsonLdListaProdutos($produtos)));

        return Inertia::render('Public/Loja', [
            'categorias' => $categorias,
            'produtos'   => $produtos->map(fn($p) => $this->formatarProduto($p)),
        ]);
    }

    /**
     * Pagina de um produto (URL propria e indexavel).
     */
    public function paginaProduto(Produto $produto)
    {
        LogService::info('1 - renderizando produto', ['slug' => $produto->slug]);

        $produto->load('categoria');

        // Produto fora de estoque sai do indice de busca
        $seo = SeoService::daPagina()
            ->titulo($produto->nome)
            ->descricao($produto->descricao ?: $produto->detalhes)
            ->imagem($produto->imagem_url)
            ->tipo('product')
            ->palavrasChave([$produto->categoria?->nome])
            ->jsonLd($this->jsonLdProduto($produto));

        if (!$produto->em_estoque) {
            $seo->noIndex();
        }

        SeoService::atribuir($seo);

        return Inertia::render('Public/ProdutoDetalhe', [
            'produto' => $this->formatarProduto($produto),
        ]);
    }

    /**
     * Pagina de uma categoria de produtos (URL propria e indexavel).
     */
    public function paginaCategoria(CategoriaProduto $categoria)
    {
        LogService::info('1 - renderizando categoria da loja', ['slug' => $categoria->slug]);

        $produtos = Produto::where('categoria_id', $categoria->id)
            ->where('em_estoque', true)
            ->latest()
            ->get();

        SeoService::atribuir(SeoService::daPagina()
            ->titulo($categoria->nome)
            ->descricao($categoria->descricao ?: "Produtos da categoria {$categoria->nome} na loja da Missão Resgatar.")
            ->palavrasChave([$categoria->nome, 'loja da igreja'])
            ->jsonLd($this->jsonLdListaProdutos($produtos)));

        return Inertia::render('Public/Loja', [
            'categorias' => CategoriaProduto::withCount('produtos')->get(),
            'produtos'   => $produtos->map(fn($p) => $this->formatarProduto($p)),
            'categoriaAtiva' => [
                'id'   => (string) $categoria->id,
                'nome' => $categoria->nome,
                'slug' => $categoria->slug,
            ],
        ]);
    }

    /**
     * Dados estruturados de um produto (preco e disponibilidade no Google).
     */
    private function jsonLdProduto(Produto $produto): array
    {
        $preco = $produto->preco_desconto ?: $produto->preco;

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $produto->nome,
            'description' => SeoService::daPagina()->resumir($produto->descricao ?: $produto->detalhes, 300),
            'image' => $produto->imagem_url ?: ($produto->imagens_galeria[0] ?? null),
            'category' => $produto->categoria?->nome,
            'sku' => (string) $produto->id,
            'url' => route('produtos.detalhe', $produto->slug),
            'offers' => array_filter([
                '@type' => 'Offer',
                'price' => number_format((float) $preco, 2, '.', ''),
                'priceCurrency' => 'BRL',
                'availability' => $produto->em_estoque
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'url' => route('produtos.detalhe', $produto->slug),
                'seller' => ['@id' => rtrim(config('app.url'), '/') . '/#igreja'],
            ]),
        ]);
    }

    /**
     * Dados estruturados da lista de produtos (ItemList).
     */
    private function jsonLdListaProdutos($produtos): array
    {
        if ($produtos->isEmpty()) {
            return [];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'name' => 'Loja ' . config('app.name'),
            'url' => route('loja'),
            'numberOfItems' => $produtos->count(),
            'itemListElement' => $produtos->take(30)->values()->map(fn($p, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'url' => route('produtos.detalhe', $p->slug),
                'name' => $p->nome,
            ])->all(),
        ];
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
