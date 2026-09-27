<?php

namespace App\Http\Controllers;

use App\Models\VideoYoutube;
use Illuminate\Http\Request;

class VideoYoutubeController extends Controller
{
    public function index()
    {
        $videos = VideoYoutube::orderBy('destaque', 'desc')
            ->orderBy('ordem', 'asc')
            ->latest()
            ->get();

        return response()->json([
            'data' => $videos->map(function ($v) {
                return [
                    'id' => (string) $v->id,
                    'title' => $v->titulo,
                    'urlOrId' => $v->url_ou_id,
                    'description' => $v->descricao,
                    'category' => $v->categoria,
                    'isFeatured' => (bool) $v->destaque,
                    'order' => (int) $v->ordem,
                    'createdAt' => $v->created_at?->toISOString(),
                ];
            })
        ]);
    }

    public function criar(Request $request)
    {
        $dados = $request->validate([
            'titulo' => 'required|string|max:255',
            'url_ou_id' => 'required|string|max:500',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'destaque' => 'boolean',
            'ordem' => 'integer',
        ]);

        $video = VideoYoutube::create([
            'titulo' => $dados['titulo'],
            'url_ou_id' => $dados['url_ou_id'],
            'descricao' => $dados['descricao'] ?? null,
            'categoria' => $dados['categoria'] ?? 'Geral',
            'destaque' => $dados['destaque'] ?? false,
            'ordem' => $dados['ordem'] ?? 0,
        ]);

        return response()->json([
            'data' => [
                'id' => (string) $video->id,
                'title' => $video->titulo,
                'urlOrId' => $video->url_ou_id,
                'description' => $video->descricao,
                'category' => $video->categoria,
                'isFeatured' => (bool) $video->destaque,
                'order' => (int) $video->ordem,
            ]
        ], 201);
    }

    public function atualizar(Request $request, VideoYoutube $video)
    {
        $dados = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'url_ou_id' => 'sometimes|required|string|max:500',
            'descricao' => 'nullable|string',
            'categoria' => 'nullable|string|max:100',
            'destaque' => 'boolean',
            'ordem' => 'integer',
        ]);

        $video->update($dados);

        return response()->json([
            'data' => [
                'id' => (string) $video->id,
                'title' => $video->titulo,
                'urlOrId' => $video->url_ou_id,
                'description' => $video->descricao,
                'category' => $video->categoria,
                'isFeatured' => (bool) $video->destaque,
                'order' => (int) $video->ordem,
            ]
        ]);
    }

    public function excluir(VideoYoutube $video)
    {
        $video->delete();
        return response()->json(['message' => 'Vídeo excluído com sucesso']);
    }

    /**
     * Obtém metadados de um vídeo do YouTube (título, descrição, thumbnail, canal).
     */
    public function obterDadosYoutube(Request $request)
    {
        $url = $request->input('url') ?? $request->input('url_ou_id');
        if (empty($url)) {
            return response()->json(['error' => 'A URL ou ID do YouTube é obrigatória.'], 400);
        }

        $videoId = null;
        $urlTrimmed = trim($url);

        // Se já for o ID puro (11 caracteres alfanuméricos)
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $urlTrimmed)) {
            $videoId = $urlTrimmed;
        } elseif (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i', $urlTrimmed, $matches)) {
            $videoId = $matches[1];
        }

        if (!$videoId) {
            return response()->json(['error' => 'Não foi possível identificar o ID do vídeo do YouTube.'], 422);
        }

        try {
            // 1. Busca metadados via oEmbed oficial do YouTube
            $oembedRes = \Illuminate\Support\Facades\Http::timeout(6)
                ->get("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={$videoId}&format=json");

            $titulo = '';
            $autor = '';
            $thumbnail = "https://i.ytimg.com/vi/{$videoId}/hqdefault.jpg";

            if ($oembedRes->successful()) {
                $data = $oembedRes->json();
                $titulo = $data['title'] ?? '';
                $autor = $data['author_name'] ?? '';
                $thumbnail = $data['thumbnail_url'] ?? $thumbnail;
            }

            // 2. Busca descrição completa via meta tags da página do vídeo
            $descricao = '';
            try {
                $htmlRes = \Illuminate\Support\Facades\Http::timeout(6)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'])
                    ->get("https://www.youtube.com/watch?v={$videoId}");

                if ($htmlRes->successful()) {
                    $html = $htmlRes->body();
                    if (preg_match('/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/is', $html, $matches)) {
                        $descricao = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    } elseif (preg_match('/<meta\s+property=["\']og:description["\']\s+content=["\'](.*?)["\']/is', $html, $matches)) {
                        $descricao = html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    }
                }
            } catch (\Exception $e) {
                // Silencioso se a página não responder a tempo
            }

            return response()->json([
                'success' => true,
                'videoId' => $videoId,
                'title' => $titulo,
                'description' => $descricao,
                'author' => $autor,
                'thumbnail' => $thumbnail,
                'canonicalUrl' => "https://www.youtube.com/watch?v={$videoId}",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao consultar YouTube: ' . $e->getMessage(),
                'videoId' => $videoId,
            ], 500);
        }
    }
}
