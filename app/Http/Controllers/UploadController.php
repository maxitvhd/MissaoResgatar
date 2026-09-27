<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Controlador de upload de imagens.
 * Salva os arquivos em storage/app/public/<pasta> e retorna a URL publica.
 *
 * A pasta e validada pela whitelist em config/midias.php, assim o usuario
 * escolhe apenas entre as pastas liberadas (ex: galeria, produtos, site).
 */
class UploadController extends Controller
{

    /**
     * Descobre a pasta de destino validada contra a whitelist.
     * Se nao vier pasta ou for invalida, cai na pasta padrao "uploads".
     */
    private function resolverPasta(?string $pasta): string
    {
        $liberadas = config('midias.pastas');
        $pasta = trim((string) $pasta);

        return in_array($pasta, $liberadas, true) ? $pasta : 'uploads';
    }

    /**
     * Faz o upload de uma imagem (base64 ou arquivo multipart).
     */
    public function enviar(Request $request)
    {
        LogService::info('1 - iniciando upload de imagem');

        $dados = $request->validate([
            'imagem'  => ['sometimes', 'file', 'mimes:jpeg,png,jpg,gif,svg,mp4,webm,webp,pdf,doc,docx,xls,xlsx,ppt,pptx', 'max:51200'],
            'arquivo' => ['sometimes', 'file', 'mimes:jpeg,png,jpg,gif,svg,mp4,webm,webp,pdf,doc,docx,xls,xlsx,ppt,pptx', 'max:51200'],
            'base64'  => ['sometimes', 'string'],
            'nome'    => ['sometimes', 'string', 'max:255'],
            'pasta'   => ['sometimes', 'string', Rule::in(config('midias.pastas'))],
        ]);

        // Pasta de destino liberada (padrao: uploads)
        $pasta = $this->resolverPasta($dados['pasta'] ?? null);

        // Fluxo 1: upload via arquivo multipart (padrao Laravel)
        $fileKey = $request->hasFile('arquivo') ? 'arquivo' : ($request->hasFile('imagem') ? 'imagem' : null);
        if ($fileKey) {
            $arquivo = $request->file($fileKey);
            $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                . '-' . Str::random(8)
                . '.' . $arquivo->getClientOriginalExtension();

            $caminho = $arquivo->storeAs($pasta, $nome, 'public');

            LogService::info('2 - arquivo multipart salvo', ['pasta' => $pasta, 'caminho' => $caminho]);

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

            $caminho = $pasta . '/' . $nome;
            Storage::disk('public')->put($caminho, $base64);

            LogService::info('2 - imagem base64 salva', ['pasta' => $pasta, 'caminho' => $caminho]);

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

        $dados = $request->validate([
            'arquivos'   => ['required', 'array', 'min:1'],
            'arquivos.*' => ['file', 'mimes:jpeg,png,jpg,gif,svg,webp,mp4,pdf,doc,docx,xls,xlsx,ppt,pptx', 'max:51200'],
            'pasta'      => ['sometimes', 'string', Rule::in(config('midias.pastas'))],
        ]);

        // Pasta de destino liberada (padrao: uploads)
        $pasta = $this->resolverPasta($dados['pasta'] ?? null);

        $urls = [];
        if ($request->hasFile('arquivos')) {
            foreach ($request->file('arquivos') as $arquivo) {
                $nome = Str::slug(pathinfo($arquivo->getClientOriginalName(), PATHINFO_FILENAME))
                    . '-' . Str::random(8)
                    . '.' . $arquivo->getClientOriginalExtension();

                $caminho = $arquivo->storeAs($pasta, $nome, 'public');
                $urls[] = asset('storage/' . $caminho);
            }
        }

        LogService::info('2 - lote de arquivos salvo com sucesso', [
            'pasta' => $pasta,
            'total' => count($urls),
        ]);

        return response()->json([
            'urls' => $urls,
            'total' => count($urls),
            'message' => count($urls) . ' arquivo(s) enviado(s) com sucesso!'
        ]);
    }
}
