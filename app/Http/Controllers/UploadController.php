<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Controlador de upload de imagens.
 * Salva os arquivos em storage/app/public/uploads e retorna a URL publica.
 */
class UploadController extends Controller
{

    /**
     * Faz o upload de uma imagem (base64 ou arquivo multipart).
     */
    public function enviar(Request $request)
    {
        LogService::info('1 - iniciando upload de imagem');

        try {
            $dados = $request->validate([
                'imagem'  => ['sometimes', 'file', 'max:102400'],
                'arquivo' => ['sometimes', 'file', 'max:102400'],
                'base64'  => ['sometimes', 'string'],
                'nome'    => ['sometimes', 'string', 'max:255'],
            ]);

            $uploadDir = storage_path('app/public/uploads');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0777, true);
            }

            // Fluxo 1: upload via arquivo multipart (padrao Laravel)
            $fileKey = $request->hasFile('arquivo') ? 'arquivo' : ($request->hasFile('imagem') ? 'imagem' : null);
            if ($fileKey) {
                $arquivo = $request->file($fileKey);
                $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                    . '-' . Str::random(8)
                    . '.' . ($arquivo->getClientOriginalExtension() ?: 'bin');

                $caminho = $arquivo->storeAs('uploads', $nome, 'public');

                LogService::info('2 - arquivo multipart salvo', ['caminho' => $caminho]);

                return response()->json(['url' => asset('storage/' . $caminho)]);
            }

            // Fluxo 2: upload via base64 (compatibilidade com o frontend antigo)
            if (!empty($dados['base64'])) {
                $base64Data = preg_replace('#^data:(image|video|application)/\w+;base64,#i', '', $dados['base64']);
                $decoded = base64_decode($base64Data);

                if (!$decoded) {
                    LogService::aviso('2 - base64 invalido');
                    return response()->json(['error' => 'Base64 inválido.'], 400);
                }

                $extensao = 'jpg';
                if (preg_match('#^data:(image|video)/(\w+)#i', $request->input('base64'), $matches)) {
                    $extensao = $matches[2] === 'jpeg' ? 'jpg' : $matches[2];
                }

                $nome = Str::slug($dados['nome'] ?? 'midia')
                    . '-' . Str::random(8)
                    . '.' . $extensao;

                $caminho = 'uploads/' . $nome;
                \Storage::disk('public')->put($caminho, $decoded);

                LogService::info('2 - imagem base64 salva', ['caminho' => $caminho]);

                return response()->json(['url' => asset('storage/' . $caminho)]);
            }

            LogService::aviso('2 - nenhum arquivo recebido');
            return response()->json(['error' => 'Nenhum arquivo enviado.'], 400);
        } catch (\Exception $e) {
            LogService::erro('Erro no upload de arquivo: ' . $e->getMessage());
            return response()->json(['error' => 'Falha no envio do arquivo: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Faz o upload de multiplos arquivos em lote.
     */
    public function enviarLote(Request $request)
    {
        LogService::info('1 - iniciando upload em lote de arquivos');

        try {
            $request->validate([
                'arquivos'   => ['required', 'array', 'min:1'],
                'arquivos.*' => ['file', 'max:102400'],
            ]);

            $uploadDir = storage_path('app/public/uploads');
            if (!file_exists($uploadDir)) {
                @mkdir($uploadDir, 0777, true);
            }

            $urls = [];
            if ($request->hasFile('arquivos')) {
                foreach ($request->file('arquivos') as $arquivo) {
                    $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                        . '-' . Str::random(8)
                        . '.' . ($arquivo->getClientOriginalExtension() ?: 'bin');

                    $caminho = $arquivo->storeAs('uploads', $nome, 'public');
                    $urls[] = asset('storage/' . $caminho);
                }
            }

            LogService::info('2 - lote de arquivos salvo com sucesso', ['total' => count($urls)]);

            return response()->json([
                'urls' => $urls,
                'total' => count($urls),
                'message' => count($urls) . ' arquivo(s) enviado(s) com sucesso!'
            ]);
        } catch (\Exception $e) {
            LogService::erro('Erro no upload em lote: ' . $e->getMessage());
            return response()->json(['error' => 'Falha no envio dos arquivos: ' . $e->getMessage()], 500);
        }
    }
}
