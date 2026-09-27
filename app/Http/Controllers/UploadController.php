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

        $dados = $request->validate([
            'imagem'  => ['sometimes', 'file', 'mimes:jpeg,png,jpg,gif,svg,mp4,webm', 'max:51200'],
            'arquivo' => ['sometimes', 'file', 'mimes:jpeg,png,jpg,gif,svg,mp4,webm', 'max:51200'],
            'base64'  => ['sometimes', 'string'],
            'nome'    => ['sometimes', 'string', 'max:255'],
        ]);

        // Fluxo 1: upload via arquivo multipart (padrao Laravel)
        $fileKey = $request->hasFile('arquivo') ? 'arquivo' : ($request->hasFile('imagem') ? 'imagem' : null);
        if ($fileKey) {
            $arquivo = $request->file($fileKey);
            $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                . '-' . Str::random(8)
                . '.' . $arquivo->getClientOriginalExtension();

            $caminho = $arquivo->storeAs('uploads', $nome, 'public');

            LogService::info('2 - arquivo multipart salvo', ['caminho' => $caminho]);

            return response()->json(['url' => asset('storage/' . $caminho)]);
        }

        // Fluxo 2: upload via base64 (compatibilidade com o frontend antigo)
        if (!empty($dados['base64'])) {
            $base64 = preg_replace('#^data:image/\w+;base64,#i', '', $dados['base64']);
            $base64 = base64_decode($base64);

            if (!$base64) {
                LogService::aviso('2 - base64 invalido');
                return response()->json(['error' => 'Base64 inválido.'], 400);
            }

            $extensao = 'jpg';
            if (preg_match('#^data:image/(\w+)#i', $request->input('base64'), $matches)) {
                $extensao = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            }

            $nome = Str::slug($dados['nome'] ?? 'imagem')
                . '-' . Str::random(8)
                . '.' . $extensao;

            $caminho = 'uploads/' . $nome;
            \Storage::disk('public')->put($caminho, $base64);

            LogService::info('2 - imagem base64 salva', ['caminho' => $caminho]);

            return response()->json(['url' => asset('storage/' . $caminho)]);
        }

        LogService::aviso('2 - nenhum arquivo recebido');
        return response()->json(['error' => 'Nenhuma imagem enviada.'], 400);
    }

    /**
     * Faz o upload de multiplos arquivos em lote.
     */
    public function enviarLote(Request $request)
    {
        LogService::info('1 - iniciando upload em lote de arquivos');

        $request->validate([
            'arquivos'   => ['required', 'array', 'min:1'],
            'arquivos.*' => ['file', 'mimes:jpeg,png,jpg,gif,svg,webp,mp4', 'max:51200'],
        ]);

        $urls = [];
        if ($request->hasFile('arquivos')) {
            foreach ($request->file('arquivos') as $arquivo) {
                $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                    . '-' . Str::random(8)
                    . '.' . $arquivo->getClientOriginalExtension();

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
    }
}
