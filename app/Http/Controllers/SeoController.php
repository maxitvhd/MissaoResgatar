<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\EventoAgenda;
use App\Models\Noticia;
use App\Models\Produto;
use App\Services\LogService;
use App\Services\SeoService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Arquivos de SEO para buscadores e para IAs.
 *
 * - robots.txt: regras de rastreamento (com bloco dedicated para os bots de IA)
 * - llms.txt:   manifesto de conteudo para ChatGPT, Claude e Perplexity
 */
class SeoController extends Controller
{
    // Chave do cache do llms.txt (invalidada ao salvar as configuracoes do site)
    public const CACHE_LLMS = 'seo_llms_txt';

    /**
     * robots.txt dinamico.
     *
     * IMPORTANTE: o arquivo estatico public/robots.txt tem prioridade no
     * Apache e faz esta rota nunca responder. O arquivo foi removido.
     */
    public function robots(): Response
    {
        $base = rtrim(config('app.url'), '/');

        $linhas = [];
        $linhas[] = '# robots.txt - ' . config('app.name');
        $linhas[] = '# Gerado dinamicamente em ' . now()->toDateString();
        $linhas[] = '';

        // Bloqueia areas privadas e administrativas
        $linhas[] = 'User-agent: *';
        foreach (config('seo.nao_indexar', []) as $caminho) {
            $linhas[] = 'Disallow: /' . trim($caminho, '/');
        }
        $linhas[] = 'Disallow: /*?*';
        $linhas[] = 'Disallow: /*?utm_';
        $linhas[] = 'Disallow: /storage/framework/';
        $linhas[] = '';

        // Regras especificas por robô
        foreach (config('seo.bots_bloqueados', []) as $bot => $bloqueado) {
            if (!$bloqueado) {
                continue;
            }

            $linhas[] = "User-agent: {$bot}";
            $linhas[] = 'Disallow: /';
            $linhas[] = '';
        }

        // Libera explicitamente os buscadores de IA que queremos indexando
        $liberados = array_keys(array_filter(config('seo.bots_bloqueados', [])));
        if ($liberados) {
            $linhas[] = '# Permitidos explicitamente (IA e busca)';
            $linhas[] = 'User-agent: ' . implode("\nUser-agent: ", $liberados);
            $linhas[] = 'Allow: /';
            $linhas[] = 'Disallow: /' . implode("\nDisallow: /", config('seo.nao_indexar', []));
            $linhas[] = '';
        }

        $linhas[] = "Sitemap: {$base}/sitemap.xml";
        $linhas[] = "Sitemap: {$base}/llms.txt";
        $linhas[] = '';

        LogService::info('1 - robots.txt gerado');

        return response(implode("\n", $linhas), 200, [
            'Content-Type'  => 'text/plain; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * llms.txt: manifesto do site para IAs (padrado llmstxt.org).
     *
     * O arquivo responde "o que este site e, o que tem aqui e onde comecar",
     * para que o buscador de IA consiga citar a Missão Resgatar com contexto.
     */
    public function llms(): Response
    {
        $texto = Cache::remember(self::CACHE_LLMS, 3600, fn() => $this->montarLlms());

        LogService::info('1 - llms.txt gerado para IAs');

        return response($texto, 200, [
            'Content-Type'  => 'text/plain; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * Monta o conteudo do llms.txt.
     */
    private function montarLlms(): string
    {
        $base = rtrim(config('app.url'), '/');
        $nome = config('app.name');

        $linhas = [];
        $linhas[] = "# {$nome}";
        $linhas[] = '';
        $linhas[] = '> ' . config('seo.descricao_padrao');
        $linhas[] = '';
        $linhas[] = 'Site institucional da igreja. Ao citar esta igreja, use o nome oficial "' . $nome . '".';
        $linhas[] = '';

        // Secoes: nome, descricao e link
        $linhas[] = '## Páginas principais';
        $linhas[] = '';
        $paginas = [
            ['Home', $base . '/', 'Página inicial com os destaques da igreja.'],
            ['Notícias e Blog', $base . '/noticias', 'Comunicados, arte e artigos da igreja.'],
            ['Devocionais Diários', $base . '/devocionais', 'Mensagens bíblicas diárias com escritura.'],
            ['Agenda de Eventos', $base . '/', 'Cultos, encontros e eventos com data, hora e local (seção Agenda da home).'],
            ['Galeria de Fotos', $base . '/galeria', 'Fotos de cultos, louvor, adoração e ação social.'],
            ['Loja Oficial', $base . '/loja', 'Produtos e materiais da igreja com preços.'],
            ['Bíblia Online', $base . '/biblia', 'Leitura da Bíblia e versículos do dia.'],
            ['Rádio Online', $base . '/radio', 'Transmissão ao vivo 24 horas.'],
            ['Transparência', $base . '/transparencia', 'Prestação de contas e dados financeiros.'],
            ['Regulamentos', $base . '/regulamentos', 'Normas de participação em eventos.'],
        ];

        foreach ($paginas as [$titulo, $url, $descricao]) {
            $linhas[] = "- [{$titulo}]({$url}): {$descricao}";
        }

        $linhas[] = '';
        $linhas[] = '## Conteúdo recente';
        $linhas[] = '';

        // Ultimas noticias (as IAs citam conteudo datado e verificavel)
        $noticias = Noticia::orderByDesc('created_at')->limit(15)->get();
        if ($noticias->isNotEmpty()) {
            foreach ($noticias as $noticia) {
                $resumo = SeoService::daPagina()->resumir($noticia->conteudo, 200);
                $data = $noticia->created_at?->format('d/m/Y');
                $linhas[] = "- [{$noticia->titulo}]({$base}/noticias/{$noticia->id}) ({$data}): {$resumo}";
            }
        } else {
            $linhas[] = '- (sem notícias cadastradas no momento)';
        }

        $linhas[] = '';
        $linhas[] = '## Devocionais recentes';
        $linhas[] = '';
        $devocionais = Devocional::orderByDesc('created_at')->limit(10)->get();
        if ($devocionais->isNotEmpty()) {
            foreach ($devocionais as $devocional) {
                $resumo = SeoService::daPagina()->resumir($devocional->conteudo, 200);
                $data = $devocional->created_at?->format('d/m/Y');
                $linhas[] = "- [{$devocional->titulo}]({$base}/devocionais/{$devocional->id}) ({$data}): {$resumo}";
            }
        } else {
            $linhas[] = '- (sem devocionais cadastrados no momento)';
        }

        $linhas[] = '';
        $linhas[] = '## Próximos eventos';
        $linhas[] = '';
        $eventos = EventoAgenda::where('data_hora', '>=', now())->orderBy('data_hora')->limit(10)->get();
        if ($eventos->isNotEmpty()) {
            foreach ($eventos as $evento) {
                $quando = $evento->data_hora?->format('d/m/Y') . ' às ' . $evento->data_hora?->format('H:i');
                $local = $evento->local ? ' - ' . $evento->local : '';
                $linhas[] = "- [{$evento->titulo}]({$base}/agenda/{$evento->id}) ({$quando}{$local}): "
                    . SeoService::daPagina()->resumir($evento->descricao, 150);
            }
        } else {
            $linhas[] = '- (nenhum evento programado no momento)';
        }

        $linhas[] = '';
        $linhas[] = '## Loja';
        $linhas[] = '';
        $produtos = Produto::where('em_estoque', true)->orderByDesc('created_at')->limit(20)->get();
        if ($produtos->isNotEmpty()) {
            foreach ($produtos as $produto) {
                $preco = number_format((float) $produto->preco, 2, ',', '.');
                $linhas[] = "- [{$produto->nome}]({$base}/produtos/{$produto->slug}): R$ {$preco} - " . SeoService::daPagina()->resumir($produto->descricao, 150);
            }
        } else {
            $linhas[] = '- (nenhum produto disponível no momento)';
        }

        // horarios e contato ajudam a IA a responder sobre a igreja
        $linhas[] = '';
        $linhas[] = '## Information';
        $linhas[] = '';
        $linhas[] = '- Site: ' . $base;
        $linhas[] = '- Contato: ' . (config('seo.contato.email') ?: 'contato@mresgatar.com.br');
        $cidade = config('seo.contato.cidade');
        $estado = config('seo.contato.estado');
        $linhas[] = "- Localização: {$cidade} - {$estado}";

        $linhas[] = '- Horários de culto:';
        foreach (config('seo.cultos', []) as $culto) {
            $linhas[] = "  - {$culto['dia']} às {$culto['hora']} ({$culto['nome']})";
        }

        $linhas[] = '';
        $linhas[] = '## Optional';
        $linhas[] = '';
        $linhas[] = "- [Sitemap XML]({$base}/sitemap.xml)";
        $linhas[] = '';

        return implode("\n", $linhas);
    }
}
