<?php

namespace App\Services;

use App\Models\ConfiguracaoSite;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NoticiasApiService
{
    /**
     * Retorna a URL base e a chave de API configuradas.
     * Prioridade: Configuracao no Painel (banco) -> Arquivo .env -> Padrão maximo.tec.br
     */
    public function getCredenciais(): array
    {
        $config = ConfiguracaoSite::obterCacheado();

        $url = !empty($config->noticias_api_url) 
            ? rtrim($config->noticias_api_url, '/') 
            : rtrim(config('services.noticias_api.url', 'https://noticias.maximo.tec.br/api/noticias/v1'), '/');

        $key = !empty($config->noticias_api_key) 
            ? trim($config->noticias_api_key) 
            : trim(config('services.noticias_api.key', ''));

        return [
            'url' => $url,
            'key' => $key,
        ];
    }

    /**
     * Busca lista de noticias paginada e filtrada com cache automatico.
     */
    public function obterNoticias(int $pagina = 1, ?string $categoria = null, ?string $busca = null, int $limite = 12): array
    {
        $credenciais = $this->getCredenciais();
        $cacheKey = "noticias_api_p{$pagina}_l{$limite}_c" . md5($categoria ?? 'todos') . "_q" . md5($busca ?? '');

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($credenciais, $pagina, $categoria, $busca, $limite) {
            try {
                $params = [
                    'pagina' => $pagina,
                    'limite' => $limite,
                ];

                if (!empty($categoria) && $categoria !== 'Todos') {
                    $params['categoria'] = $categoria;
                }

                if (!empty($busca)) {
                    $params['busca'] = $busca;
                }

                if (!empty($credenciais['key'])) {
                    $params['chave'] = $credenciais['key'];
                }

                $request = Http::timeout(8)
                    ->withHeaders([
                        'Accept' => 'application/json',
                        'X-API-KEY' => $credenciais['key'],
                    ]);

                $response = $request->get($credenciais['url'] . '/noticias', $params);

                if ($response->successful()) {
                    $json = $response->json();
                    $noticiasRaw = $json['noticias'] ?? $json['data'] ?? [];

                    $noticiasFormatadas = array_map([$this, 'formatarNoticia'], $noticiasRaw);

                    return [
                        'noticias' => $noticiasFormatadas,
                        'total' => $json['total'] ?? count($noticiasFormatadas),
                        'pagina' => $json['pagina'] ?? $pagina,
                        'por_pagina' => $json['por_pagina'] ?? $limite,
                        'ultima_pagina' => $json['ultima_pagina'] ?? 1,
                        'sucesso' => true,
                    ];
                }

                Log::warning('Resposta nao-sucesso da API de Noticias:', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return $this->resultadoVazio();
            } catch (\Exception $e) {
                Log::error('Erro ao conectar com API de Noticias: ' . $e->getMessage());
                return $this->resultadoVazio();
            }
        });
    }

    /**
     * Busca uma unica noticia pelo slug ou ID.
     */
    public function obterNoticia(string $slugOrId): ?array
    {
        $credenciais = $this->getCredenciais();
        $cacheKey = "noticia_api_item_" . md5($slugOrId);

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($credenciais, $slugOrId) {
            try {
                $params = [];
                if (!empty($credenciais['key'])) {
                    $params['chave'] = $credenciais['key'];
                }

                $response = Http::timeout(8)
                    ->withHeaders([
                        'Accept' => 'application/json',
                        'X-API-KEY' => $credenciais['key'],
                    ])
                    ->get($credenciais['url'] . '/noticias/' . $slugOrId, $params);

                if ($response->successful()) {
                    $json = $response->json();
                    $rawItem = $json['noticia'] ?? $json['data'] ?? $json;
                    if (!empty($rawItem) && is_array($rawItem)) {
                        return $this->formatarNoticia($rawItem);
                    }
                }

                return null;
            } catch (\Exception $e) {
                Log::error('Erro ao buscar detalhe da noticia na API: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Busca categorias disponiveis na API.
     */
    public function obterCategorias(): array
    {
        $credenciais = $this->getCredenciais();

        return Cache::remember('noticias_api_categorias', now()->addMinutes(30), function () use ($credenciais) {
            try {
                $response = Http::timeout(5)
                    ->withHeaders([
                        'Accept' => 'application/json',
                        'X-API-KEY' => $credenciais['key'],
                    ])
                    ->get($credenciais['url'] . '/categorias', [
                        'chave' => $credenciais['key']
                    ]);

                if ($response->successful()) {
                    return $response->json()['categorias'] ?? $response->json()['data'] ?? [];
                }

                return [];
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    /**
     * Testa conexao e validade de uma chave de API.
     */
    public function testarConexao(?string $url = null, ?string $key = null): array
    {
        $credenciais = $this->getCredenciais();
        $targetUrl = !empty($url) ? rtrim($url, '/') : $credenciais['url'];
        $targetKey = trim($key ?? $credenciais['key']);

        if (empty($targetKey)) {
            return [
                'sucesso' => false,
                'mensagem' => 'A Chave de API está vazia. Por favor, insira a sua Chave de API antes de testar a conexão.',
            ];
        }

        try {
            // Tenta o endpoint /status
            $response = Http::timeout(8)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'X-API-KEY' => $targetKey,
                ])
                ->get($targetUrl . '/status', [
                    'chave' => $targetKey
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'sucesso' => true,
                    'mensagem' => $data['mensagem'] ?? $data['message'] ?? 'Conexão estabelecida com sucesso com a API de Notícias!',
                    'dados' => $data,
                ];
            }

            // Tenta fallback com /noticias?limite=1
            $responseFeed = Http::timeout(8)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'X-API-KEY' => $targetKey,
                ])
                ->get($targetUrl . '/noticias', [
                    'limite' => 1,
                    'chave' => $targetKey
                ]);

            if ($responseFeed->successful()) {
                $data = $responseFeed->json();
                $total = $data['total'] ?? count($data['noticias'] ?? []);
                return [
                    'sucesso' => true,
                    'mensagem' => "Conexão com a API confirmada! {$total} notícias encontradas na base remota.",
                    'dados' => $data,
                ];
            }

            $json = $responseFeed->json() ?? $response->json();
            $msg = $json['message'] ?? $json['mensagem'] ?? ('Falha na autenticação (Status HTTP ' . $responseFeed->status() . '). Verifique sua Chave de API.');

            return [
                'sucesso' => false,
                'mensagem' => $msg,
            ];
        } catch (\Exception $e) {
            return [
                'sucesso' => false,
                'mensagem' => 'Erro de comunicação com a API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Formata um item bruto vindo da API para a estrutura padronizada do frontend.
     */
    public function formatarNoticia(array $item): array
    {
        $autorNome = 'IA Notícias';
        if (!empty($item['autor'])) {
            $autorNome = is_array($item['autor']) ? ($item['autor']['nome'] ?? 'IA Notícias') : (string) $item['autor'];
        }

        $categoriaNome = 'Geral';
        $categoriaSlug = 'geral';
        if (!empty($item['categoria'])) {
            if (is_array($item['categoria'])) {
                $categoriaNome = $item['categoria']['nome'] ?? 'Geral';
                $categoriaSlug = $item['categoria']['slug'] ?? 'geral';
            } else {
                $categoriaNome = (string) $item['categoria'];
            }
        }

        $dataBr = $item['data_br'] ?? null;
        if (!$dataBr && !empty($item['data'])) {
            $timestamp = strtotime($item['data']);
            $dataBr = $timestamp ? date('d/m/Y H:i', $timestamp) : date('d/m/Y');
        } elseif (!$dataBr && !empty($item['created_at'])) {
            $timestamp = strtotime($item['created_at']);
            $dataBr = $timestamp ? date('d/m/Y H:i', $timestamp) : date('d/m/Y');
        }

        return [
            'id' => (string) ($item['slug'] ?? $item['id'] ?? rand(1, 99999)),
            'slug' => $item['slug'] ?? (string) ($item['id'] ?? ''),
            'title' => $item['titulo'] ?? $item['title'] ?? 'Sem Título',
            'content' => $item['conteudo'] ?? $item['content'] ?? $item['resumo'] ?? '',
            'summary' => $item['resumo'] ?? $item['summary'] ?? '',
            'author' => $autorNome,
            'image' => !empty($item['imagem']) 
                ? $item['imagem'] 
                : (!empty($item['image']) ? $item['image'] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'),
            'date' => $dataBr ?? date('d/m/Y'),
            'category' => $categoriaNome,
            'categorySlug' => $categoriaSlug,
            'likes' => $item['curtidas'] ?? $item['likes'] ?? 0,
            'views' => $item['visualizacoes'] ?? $item['views'] ?? 0,
            'comments' => $item['comentarios'] ?? $item['comments'] ?? [],
            'tags' => $item['tags'] ?? [],
            'aiVerified' => $item['verificacao_ia'] ?? true,
            'externalUrl' => $item['url'] ?? null,
        ];
    }

    private function resultadoVazio(): array
    {
        return [
            'noticias' => [],
            'total' => 0,
            'pagina' => 1,
            'por_pagina' => 12,
            'ultima_pagina' => 1,
            'sucesso' => false,
        ];
    }
}
