<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Gerenciador de midias do site.
 *
 * Lista os arquivos de storage/app/public por pasta, permite renomear
 * (corrigindo as URLs ja gravadas no banco) e apagar (avisando onde a
 * midia esta sendo usada).
 */
class MidiaController extends Controller
{
    // Cache em memoria das tabelas/colunas que existem no banco
    private static array $cacheColunas = [];

    /**
     * Valida o caminho da midia dentro do disco publico.
     * Seguranca: bloqueia "..", caminho absoluto e pasta fora da whitelist.
     */
    private function validarCaminho(string $caminho): string
    {
        $caminho = str_replace('\\', '/', trim($caminho));
        $caminho = ltrim($caminho, '/');

        if ($caminho === '' || str_contains($caminho, '..') || str_contains($caminho, "\0")) {
            throw ValidationException::withMessages(['caminho' => 'Caminho de midia invalido.']);
        }

        $partes = explode('/', $caminho);
        if (!in_array($partes[0], config('midias.pastas'), true)) {
            throw ValidationException::withMessages(['caminho' => 'Pasta de midia nao liberada.']);
        }

        return $caminho;
    }

    /**
     * Devolve as colunas de midia que existem no banco, marcando quais
     * podem ficar vazias (nullable) e quais sao obrigatorias.
     */
    private function colunasValidas(string $tabela): array
    {
        if (isset(self::$cacheColunas[$tabela])) {
            return self::$cacheColunas[$tabela];
        }

        $validas = [];
        try {
            if (Schema::hasTable($tabela)) {
                $permitidas = array_keys(config("midias.colunas.$tabela", []));
                foreach (Schema::getColumns($tabela) as $coluna) {
                    if (in_array($coluna['name'], $permitidas, true)) {
                        $validas[$coluna['name']] = (bool) ($coluna['nullable'] ?? false);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Se a tabela nao existir no banco atual, seguimos sem ela
            LogService::aviso('1 - tabela ignorada no gerenciamento de midias', [
                'tabela' => $tabela,
                'erro'   => $e->getMessage(),
            ]);
            $validas = [];
        }

        return self::$cacheColunas[$tabela] = $validas;
    }

    /**
     * Monta um rotulo legivel do registro que usa a midia.
     */
    private function rotuloRegistro(object $linha, string $tabela): string
    {
        foreach (['titulo', 'nome', 'name', 'label', 'categoria', 'descricao'] as $campo) {
            if (isset($linha->$campo) && is_string($linha->$campo) && $linha->$campo !== '') {
                $valor = $linha->$campo;
                return Str::limit($valor, 40);
            }
        }

        return $tabela . ' #' . ($linha->id ?? '?');
    }

    /**
     * Procura em quais registros a midia esta sendo usada.
     * Busca pelo nome do arquivo (funciona com URL absoluta ou relativa).
     * Retorna: [nome_do_arquivo => [ ['tabela','coluna','rotulo','id','titulo'], ... ]]
     */
    private function mapearUso(array $nomesArquivos): array
    {
        $resultado = [];

        if (empty($nomesArquivos)) {
            return $resultado;
        }

        // Escapa % e _ do LIKE para o nome do arquivo ser literal
        $likes = [];
        foreach ($nomesArquivos as $nome) {
            $likes[$nome] = '%' . addcslashes($nome, '%_\\') . '%';
        }

        foreach (config('midias.colunas') as $tabela => $colunas) {
            $validas = $this->colunasValidas($tabela);
            if (empty($validas)) {
                continue;
            }

            // Uma consulta por tabela (OR dos nomes da pagina em qualquer coluna de midia)
            $linhas = DB::table($tabela)->where(function ($query) use ($likes, $validas) {
                foreach (array_keys($validas) as $coluna) {
                    $query->orWhere(function ($interno) use ($likes, $coluna) {
                        foreach ($likes as $like) {
                            $interno->orWhere($coluna, 'like', $like);
                        }
                    });
                }
            })->get();

            foreach ($linhas as $linha) {
                foreach (array_keys($validas) as $coluna) {
                    $valor = $linha->$coluna ?? null;
                    if ($valor === null || $valor === '') {
                        continue;
                    }

                    // Colunas JSON (ex: produtos.imagens_galeria) guardam varias URLs
                    $textos = is_array($valor)
                        ? $valor
                        : (is_string($valor) && (str_starts_with($valor, '[') || str_starts_with($valor, '{'))
                            ? (array) json_decode($valor, true)
                            : [$valor]);

                    foreach ($textos as $texto) {
                        if (!is_string($texto) || $texto === '') {
                            continue;
                        }

                        $nomeArquivo = basename(parse_url($texto, PHP_URL_PATH) ?: $texto);
                        if (!isset($likes[$nomeArquivo])) {
                            continue;
                        }

                        $resultado[$nomeArquivo][] = [
                            'tabela' => $tabela,
                            'coluna' => $coluna,
                            'rotulo' => config("midias.colunas.$tabela.$coluna"),
                            'id'     => $linha->id ?? null,
                            'titulo' => $this->rotuloRegistro($linha, $tabela),
                        ];
                    }
                }
            }
        }

        return $resultado;
    }

    /**
     * Troca a URL antiga pela nova em todas as colunas de midia do banco.
     * Usado no renomear, para as imagens continuarem aparecendo no site.
     */
    private function substituirUrl(string $urlAntiga, string $urlNova): int
    {
        $nomeArquivo = basename(parse_url($urlAntiga, PHP_URL_PATH) ?: $urlAntiga);
        $likes = ['%' . addcslashes($nomeArquivo, '%_\\') . '%'];
        $total = 0;

        // Endereco completo e endereco relativo (storage/galeria/foto.jpg)
        $trocas = [
            [$urlAntiga, $urlNova],
            ['storage/' . $nomeArquivo, 'storage/' . basename(parse_url($urlNova, PHP_URL_PATH) ?: $urlNova)],
        ];

        foreach (config('midias.colunas') as $tabela => $colunas) {
            $validas = $this->colunasValidas($tabela);
            if (empty($validas)) {
                continue;
            }

            $linhas = DB::table($tabela)->where(function ($query) use ($likes, $validas) {
                foreach (array_keys($validas) as $coluna) {
                    $query->orWhere(function ($interno) use ($likes, $coluna) {
                        foreach ($likes as $like) {
                            $interno->orWhere($coluna, 'like', $like);
                        }
                    });
                }
            })->get();

            foreach ($linhas as $linha) {
                if (!isset($linha->id)) {
                    continue;
                }

                foreach (array_keys($validas) as $coluna) {
                    [$mudou, $novoValor] = $this->transformarValor($linha->$coluna ?? null, $trocas, true);
                    if ($mudou) {
                        DB::table($tabela)->where('id', $linha->id)->update([$coluna => $novoValor]);
                        $total++;
                    }
                }
            }
        }

        return $total;
    }

    /**
     * Limpa a referencia da midia (coluna vira null, sai do array JSON ou
     * fica vazia quando a coluna e obrigatoria no banco).
     * Usado no excluir com confirmacao, para nao sobrar URL quebrada.
     */
    private function limparUrl(string $url): array
    {
        $nomeArquivo = basename(parse_url($url, PHP_URL_PATH) ?: $url);
        $likes = ['%' . addcslashes($nomeArquivo, '%_\\') . '%'];
        $total = 0;
        $vazios = []; // colunas obrigatorias que ficaram sem a midia

        foreach (config('midias.colunas') as $tabela => $colunas) {
            $validas = $this->colunasValidas($tabela);
            if (empty($validas)) {
                continue;
            }

            $linhas = DB::table($tabela)->where(function ($query) use ($likes, $validas) {
                foreach (array_keys($validas) as $coluna) {
                    $query->orWhere(function ($interno) use ($likes, $coluna) {
                        foreach ($likes as $like) {
                            $interno->orWhere($coluna, 'like', $like);
                        }
                    });
                }
            })->get();

            foreach ($linhas as $linha) {
                if (!isset($linha->id)) {
                    continue;
                }

                foreach (array_keys($validas) as $coluna) {
                    [$mudou, $novoValor] = $this->transformarValor($linha->$coluna ?? null, [], false);
                    if (!$mudou) {
                        continue;
                    }

                    // Coluna obrigatoria (ex: galeria.url) nao aceita null
                    if ($novoValor === null && !$validas[$coluna]) {
                        $novoValor = '';
                        $vazios[] = config("midias.colunas.$tabela.$coluna") . ' (' . $linha->id . ')';
                    }

                    DB::table($tabela)->where('id', $linha->id)->update([$coluna => $novoValor]);
                    $total++;
                }
            }
        }

        if (!empty($vazios)) {
            LogService::aviso('2 - registros ficaram sem imagem (coluna obrigatoria)', ['registros' => $vazios]);
        }

        return [$total, array_values(array_unique($vazios))];
    }

    /**
     * Aplica as trocas de URL em um valor (texto simples ou JSON).
     * Se $limpar for true, remove a midia do valor.
     * Retorna [alterou?, novo_valor] - o novo valor pode ser null (limpeza).
     */
    private function transformarValor($valor, array $trocas, bool $substituir): array
    {
        if ($valor === null || $valor === '' || $valor === []) {
            return [false, null];
        }

        // Colunas JSON guardam uma lista de URLs
        if (is_string($valor) && (str_starts_with($valor, '[') || str_starts_with($valor, '{'))) {
            $decodificado = json_decode($valor, true);
            if (is_array($decodificado)) {
                $novaLista = [];
                $alterou = false;

                foreach ($decodificado as $item) {
                    if (!is_string($item)) {
                        $novaLista[] = $item;
                        continue;
                    }

                    if (!$substituir) {
                        // Limpando: remove o item se for a midia
                        if (str_contains($item, basename(parse_url($item, PHP_URL_PATH) ?: $item))) {
                            $alterou = true;
                            continue;
                        }
                        $novaLista[] = $item;
                        continue;
                    }

                    foreach ($trocas as [$de, $para]) {
                        $novoItem = str_replace($de, $para, $item);
                        if ($novoItem !== $item) {
                            $alterou = true;
                        }
                        $item = $novoItem;
                    }
                    $novaLista[] = $item;
                }

                if (!$alterou) {
                    return [false, null];
                }

                return [true, empty($novaLista) ? null : json_encode($novaLista, JSON_UNESCAPED_UNICODE)];
            }
        }

        if (!is_string($valor)) {
            return [false, null];
        }

        if (!$substituir) {
            // Limpando: se a URL aponta para a midia, a coluna fica null
            $ehEstaMidia = str_contains($valor, basename(parse_url($valor, PHP_URL_PATH) ?: $valor));
            return [$ehEstaMidia, null];
        }

        $novoValor = $valor;
        foreach ($trocas as [$de, $para]) {
            $novoValor = str_replace($de, $para, $novoValor);
        }

        return [$novoValor !== $valor, $novoValor];
    }

    /**
     * Lista as midias por pasta, com busca, paginacao e aviso de uso.
     */
    public function index(Request $request)
    {
        LogService::info('1 - listando midias do site');

        $dados = $request->validate([
            'pasta'  => ['sometimes', 'string'],
            'busca'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'pagina' => ['sometimes', 'integer', 'min:1'],
        ]);

        $pastas = config('midias.pastas');
        $pasta = in_array($dados['pasta'] ?? null, $pastas, true) ? $dados['pasta'] : null;
        $busca = trim($dados['busca'] ?? '');
        $porPagina = (int) config('midias.por_pagina', 24);
        $pagina = max(1, (int) ($dados['pagina'] ?? 1));

        // Le os arquivos do disco (pasta especifica ou todas)
        $caminhos = Storage::disk('public')->allFiles($pasta);

        // Remove arquivos ocultos (ex: .gitignore) e o que nao tem nome
        $caminhos = array_values(array_filter($caminhos, function ($caminho) {
            return !str_starts_with(basename($caminho), '.');
        }));

        // Busca por nome do arquivo
        if ($busca !== '') {
            $caminhos = array_values(array_filter($caminhos, function ($caminho) use ($busca) {
                return str_contains(Str::lower(basename($caminho)), Str::lower($busca));
            }));
        }

        // Ordena pelo mais recente
        usort($caminhos, function ($a, $b) {
            return Storage::disk('public')->lastModified($b) <=> Storage::disk('public')->lastModified($a);
        });

        $total = count($caminhos);
        $paginas = max(1, (int) ceil($total / $porPagina));
        $pagina = min($pagina, $paginas);
        $trecho = array_slice($caminhos, ($pagina - 1) * $porPagina, $porPagina);

        // Uso calculado apenas nos arquivos da pagina atual (consultas rapidas)
        $nomes = array_map(fn($c) => basename($c), $trecho);
        $usos = $this->mapearUso($nomes);

        $arquivos = [];
        foreach ($trecho as $caminho) {
            $nome = basename($caminho);
            $arquivos[] = [
                'caminho'  => $caminho,
                'nome'     => $nome,
                'pasta'    => Str::before($caminho, '/'),
                'url'      => asset('storage/' . $caminho),
                'tamanho'  => Storage::disk('public')->size($caminho),
                'mime'     => Storage::disk('public')->mimeType($caminho),
                'data'     => date('Y-m-d H:i:s', Storage::disk('public')->lastModified($caminho)),
                'em_uso'   => $usos[$nome] ?? [],
            ];
        }

        // Contagem por pasta para o menu lateral
        $contagem = [];
        foreach ($pastas as $p) {
            $contagem[$p] = count(Storage::disk('public')->allFiles($p));
        }

        LogService::info('2 - midias listadas com sucesso', ['pasta' => $pasta, 'total' => $total]);

        return response()->json([
            'pasta'     => $pasta,
            'busca'     => $busca,
            'pagina'    => $pagina,
            'paginas'   => $paginas,
            'por_pagina'=> $porPagina,
            'total'     => $total,
            'pastas'    => $pastas,
            'contagem'  => $contagem,
            'arquivos'  => $arquivos,
        ]);
    }

    /**
     * Renomeia a midia e corrige todas as URLs que apontam para ela.
     */
    public function renomear(Request $request)
    {
        LogService::info('1 - renomeando midia');

        $dados = $request->validate([
            'caminho'   => ['required', 'string', 'max:255'],
            'novo_nome' => ['required', 'string', 'max:255'],
        ]);

        $caminho = $this->validarCaminho($dados['caminho']);

        if (!Storage::disk('public')->exists($caminho)) {
            LogService::aviso('2 - midia nao encontrada', ['caminho' => $caminho]);
            return response()->json(['error' => 'Midia nao encontrada.'], 404);
        }

        // Seguranca: novo nome sem barra e sem ".." (mantem a mesma pasta e extensao)
        $novoNomeBruto = str_replace('\\', '/', trim($dados['novo_nome']));
        if (str_contains($novoNomeBruto, '/') || str_contains($novoNomeBruto, '..')) {
            throw ValidationException::withMessages(['novo_nome' => 'Nome de midia invalido.']);
        }

        $extensao = strtolower(pathinfo($caminho, PATHINFO_EXTENSION));
        $novoNome = Str::slug(pathinfo($novoNomeBruto, PATHINFO_FILENAME));
        if ($novoNome === '') {
            throw ValidationException::withMessages(['novo_nome' => 'Nome de midia invalido.']);
        }
        $novoNome .= '.' . $extensao;

        $novoCaminho = Str::before($caminho, '/') . '/' . $novoNome;

        if ($novoCaminho !== $caminho && Storage::disk('public')->exists($novoCaminho)) {
            throw ValidationException::withMessages(['novo_nome' => 'Ja existe uma midia com este nome.']);
        }

        if ($novoCaminho === $caminho) {
            LogService::info('2 - nome da midia nao mudou', ['caminho' => $caminho]);
            return response()->json([
                'message'                => 'O nome da midia nao mudou.',
                'url'                    => asset('storage/' . $caminho),
                'referencias_atualizadas'=> 0,
            ]);
        }

        Storage::disk('public')->move($caminho, $novoCaminho);

        // 2 - atualiza as URLs ja gravadas no banco (imagens continuam funcionando)
        $atualizadas = $this->substituirUrl(
            asset('storage/' . $caminho),
            asset('storage/' . $novoCaminho)
        );

        LogService::info('3 - midia renomeada com sucesso', [
            'de'  => $caminho,
            'para'=> $novoCaminho,
            'refs'=> $atualizadas,
        ]);

        return response()->json([
            'message'                 => 'Midia renomeada com sucesso!',
            'url'                     => asset('storage/' . $novoCaminho),
            'caminho'                 => $novoCaminho,
            'referencias_atualizadas' => $atualizadas,
        ]);
    }

    /**
     * Apaga a midia. Se estiver em uso, exige confirmacao e mostra onde e usada.
     */
    public function excluir(Request $request)
    {
        LogService::info('1 - excluindo midia');

        $dados = $request->validate([
            'caminho'   => ['required', 'string', 'max:255'],
            'confirmar' => ['sometimes', 'boolean'],
        ]);

        $caminho = $this->validarCaminho($dados['caminho']);

        if (!Storage::disk('public')->exists($caminho)) {
            LogService::aviso('2 - midia nao encontrada', ['caminho' => $caminho]);
            return response()->json(['error' => 'Midia nao encontrada.'], 404);
        }

        $url = asset('storage/' . $caminho);
        $uso = $this->mapearUso([basename($caminho)])[basename($caminho)] ?? [];

        // Bloqueia a exclusao de midia em uso sem confirmacao explicita
        if (!empty($uso) && !$request->boolean('confirmar')) {
            LogService::aviso('2 - midia em uso, exclusao bloqueada', [
                'caminho' => $caminho,
                'usos'    => count($uso),
            ]);

            return response()->json([
                'error'  => 'Esta midia esta sendo usada em ' . count($uso) . ' lugar(es).',
                'em_uso' => $uso,
            ], 409);
        }

        Storage::disk('public')->delete($caminho);

        // 2 - limpa as referencias no banco para nao sobrar URL quebrada
        [$limpas, $vazios] = empty($uso) ? [0, []] : $this->limparUrl($url);

        LogService::info('3 - midia excluida com sucesso', [
            'caminho'    => $caminho,
            'refs_limpas'=> $limpas,
        ]);

        return response()->json([
            'message'     => 'Midia excluida com sucesso!',
            'em_uso'      => $uso,
            'refs_limpas' => $limpas,
            'sem_imagem'  => $vazios,
        ]);
    }
}
