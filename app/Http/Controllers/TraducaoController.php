<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Traducao de textos via Gemini (com fallback offline).
 * Espelha o endpoint /api/translate do server.ts original.
 */
class TraducaoController extends Controller
{
    public function traduzir(Request $request): JsonResponse
    {
        LogService::info('1 - traduzindo texto', ['idioma' => $request->input('targetLanguage')]);

        $texto = trim((string) $request->input('text'));
        $idioma = strtolower(trim((string) $request->input('targetLanguage')));

        if ($texto === '' || $idioma === '') {
            return response()->json(['error' => 'Text and targetLanguage are required'], 400);
        }

        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey || $apiKey === 'dummy-key-for-build') {
            return response()->json(['translatedText' => $this->fallbackOffline($texto, $idioma)]);
        }

        try {
            $resposta = Http::timeout(20)
                ->withHeader('x-goog-api-key', $apiKey)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => "Translate the following Portuguese text to {$idioma}. Return ONLY the direct translation text with no comments, introductory notes, or surrounding quotes. Keep Christian terminology appropriate for that language.\nText: \"{$texto}\"",
                                ],
                            ],
                        ],
                    ],
                ]);

            $dados = $resposta->json();

            $traduzido = $dados['candidates'][0]['content']['parts'][0]['text']
                ?? ($dados['error']['message'] ?? '');

            return response()->json(['translatedText' => trim($traduzido) !== '' ? trim($traduzido) : $texto]);
        } catch (\Throwable $e) {
            LogService::error('falha na traducao Gemini', ['erro' => $e->getMessage()]);
            return response()->json(['translatedText' => $this->fallbackOffline($texto, $idioma)]);
        }
    }

    /**
     * Versiculo diario baseado no dia do mes (mesma logica do server.ts original).
     */
    public function versiculoDiario(): JsonResponse
    {
        LogService::info('1 - retornando versiculo diario');

        $versiculos = [
            [
                'verse' => 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.',
                'reference' => 'Salmo 119:105',
                'reflection' => 'A Palavra de Deus não apenas ilumina o nosso destino final, mas nos dá clareza para cada pequeno passo diário, evitando que tropecemos nas pedras do caminho.',
            ],
            [
                'verse' => 'Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore, nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.',
                'reference' => 'Josué 1:9',
                'reflection' => 'A coragem do cristão não reside na ausência de perigo, mas na presença constante do Deus Todo-Poderoso, que caminha ao nosso lado em qualquer percurso.',
            ],
            [
                'verse' => 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
                'reference' => 'João 3:16',
                'reflection' => 'O maior ato de amor e entrega da história. A nossa fé está ancorada nesse sacrifício perfeito que nos concede reconciliação e vida abundante.',
            ],
        ];

        $dia = (int) date('j');
        $indice = $dia % count($versiculos);

        return response()->json($versiculos[$indice]);
    }

    /**
     * Traducoes offline quando a chave Gemini nao esta disponivel.
     */
    private function fallbackOffline(string $texto, string $idioma): string
    {
        if ($idioma === 'en') {
            if (mb_strpos($texto, 'Lâmpada para os meus pés') !== false) {
                return 'Your word is a lamp for my feet, a light on my path. (Psalm 119:105)';
            }
            return "[EN Translation Fallback] {$texto}";
        }

        if ($idioma === 'es') {
            if (mb_strpos($texto, 'Lâmpada para os meus pés') !== false) {
                return 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino. (Salmo 119:105)';
            }
            return "[ES Translation Fallback] {$texto}";
        }

        return $texto;
    }
}
