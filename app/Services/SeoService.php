<?php

namespace App\Services;

use App\Models\ConfiguracaoSite;
use Illuminate\Support\Str;

/**
 * Monta o pacote de SEO de cada pagina (title, description, canonical,
 * Open Graph, Twitter Cards e dados estruturados JSON-LD).
 *
 * Tudo que for gravado em configuracoes_site tem prioridade sobre o
 * padrao do config/seo.php. Campo vazio = usa o padrao.
 */
class SeoService
{
    // Titulo/descricao usados quando a pagina nao informa os seus
    private string $titulo;
    private string $descricao;
    private ?string $imagem = null;
    private ?string $canonical = null;
    private string $tipo = 'website';
    private bool $noIndex = false;
    private array $jsonLd = [];
    private array $extras = [];

    public function __construct(?ConfiguracaoSite $config = null)
    {
        $config = $config ?: ConfiguracaoSite::obterCacheado();

        // Identidade: banco tem prioridade, senao o padrao do config
        $this->titulo = trim((string) ($config->titulo_site ?: config('seo.titulo_padrao')));
        $this->descricao = trim((string) ($config->meta_description ?: config('seo.descricao_padrao')));

        // Imagem padrao de compartilhamento: imagem_og -> logo -> hero
        $this->imagem = $config->imagem_og ?: $config->logo_url ?: $config->url_imagem_hero;
    }

    /**
     * Cria o construtor de SEO de uma pagina.
     */
    public static function daPagina(?ConfiguracaoSite $config = null): self
    {
        return new self($config);
    }

    /**
     * Registra o SEO da pagina atual. Os controllers chamam isso antes de
     * responder com Inertia; o middleware le depois para compartilhar com o frontend.
     */
    public static function atribuir(?self $seo): void
    {
        if ($seo) {
            app()->instance('seo.pagina', $seo);
        }
    }

    /**
     * Recupera o SEO da pagina atual (ou o padrao, se o controller nao definiu).
     */
    public static function pegar(): self
    {
        return app()->bound('seo.pagina') ? app('seo.pagina') : self::daPagina();
    }

    /** Indica se a URL acessada e uma area que nao deve ser indexada. */
    public static function urlPrivada(string $caminho): bool
    {
        $caminho = trim($caminho, '/');
        if ($caminho === '') {
            return false;
        }

        $privados = config('seo.nao_indexar', []);

        foreach ($privados as $privado) {
            if ($caminho === $privado || str_starts_with($caminho, $privado . '/')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Titulo da pagina. Ex.: noticias: "Titulo | Missao Resgatar".
     */
    public function titulo(?string $titulo = null): self
    {
        if ($titulo) {
            $titulo = trim($titulo);

            // Evita repetir o nome da igreja quando o titulo ja cita a marca
            $marca = config('app.name');
            $this->titulo = Str::contains($titulo, $marca)
                ? $titulo
                : $titulo . ' | ' . $marca;
        }

        return $this;
    }

    /**
     * Descricao da pagina (meta description), limitada a 160 caracteres.
     */
    public function descricao(?string $descricao = null): self
    {
        if ($descricao) {
            $this->descricao = $this->resumir(strip_tags($descricao), 160);
        }

        return $this;
    }

    /**
     * URL canonica. Padrao: a URL acessada.
     */
    public function canonical(?string $url = null): self
    {
        $this->canonical = $url ?: request()->fullUrl();

        return $this;
    }

    /**
     * Imagem de compartilhamento (og:image / twitter:image).
     */
    public function imagem(?string $url): self
    {
        $this->imagem = $url ?: $this->imagem;

        return $this;
    }

    /**
     * Tipo do Open Graph: website, article, product, article...
     */
    public function tipo(string $tipo): self
    {
        $this->tipo = $tipo;

        return $this;
    }

    /**
     * Palavras-chave extras desta pagina.
     */
    public function palavrasChave(array $extra = []): self
    {
        $this->extras['palavras_chave'] = array_values(array_unique(
            array_merge(config('seo.palavras_chave', []), $extra)
        ));

        return $this;
    }

    /**
     * Bloqueia a indexacao desta pagina (admin, login, areas privadas).
     */
    public function noIndex(bool $noIndex = true): self
    {
        $this->noIndex = $noIndex;

        return $this;
    }

    /**
     * Acrescenta um bloco de dado estruturado (JSON-LD) a pagina.
     */
    public function jsonLd(array $dados): self
    {
        $this->jsonLd[] = $dados;

        return $this;
    }

    /**
     * Monta e devolve o pacote de SEO completo (usado no blade e no Inertia).
     */
    public function toArray(): array
    {
        $config = ConfiguracaoSite::obterCacheado();
        $tituloPagina = $this->titulo;
        $imagem = $this->imagem ? $this->imagemAbsoluta($this->imagem) : null;
        $canonical = $this->canonical ?: $this->canonicalDaPagina();

        return [
            'titulo'      => $tituloPagina,
            'descricao'   => $this->descricao,
            'palavras'    => implode(', ', $this->extras['palavras_chave'] ?? config('seo.palavras_chave', [])),
            'canonical'   => $canonical,
            'imagem'      => $imagem,
            'twitter_site'=> $config->twitter_site ?: null,
            'robots'      => $this->noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
            'og' => [
                'title'       => $tituloPagina,
                'description' => $this->descricao,
                'url'         => $canonical,
                'type'        => $this->tipo,
                'site_name'   => config('app.name'),
                'locale'      => config('seo.locale_open_graph'),
                'image'       => $imagem,
            ],
            'twitter' => [
                'card'        => $imagem ? 'summary_large_image' : 'summary',
                'title'       => $tituloPagina,
                'description' => $this->descricao,
                'image'       => $imagem,
                'site'        => $config->twitter_site ?: null,
            ],
            'json_ld' => array_values(array_filter([$this->organizacao($config), $this->jsonLd])),
        ];
    }

    /**
     * URL canonica padrao: a propria pagina acessada, sem parametros de
     * query (evita que o Google indexe URLs com utm_ e filtros).
     */
    private function canonicalDaPagina(): string
    {
        $url = request()->fullUrl();

        // Remove a query string (?busca=, ?utm_...) da canonica
        $url = strtok($url, '?') ?: $url;
        $url = rtrim($url, '/');

        // Na raiz a canonica precisa terminar com barra
        return $url === '' || $url === rtrim(config('app.url'), '/')
            ? rtrim(config('app.url'), '/') . '/'
            : $url;
    }

    /**
     * Dados estruturados da igreja (presente em todas as paginas).
     */
    private function organizacao(ConfiguracaoSite $config): array
    {
        $dados = [
            '@context' => 'https://schema.org',
            '@type'    => ['Church', 'LocalBusiness'],
            '@id'      => rtrim(config('app.url'), '/') . '/#igreja',
            'name'     => config('app.name'),
            'url'      => rtrim(config('app.url'), '/') . '/',
            'description' => $this->descricao,
            'image'    => $this->imagem ? $this->imagemAbsoluta($this->imagem) : null,
        ];

        if ($logo = $config->logo_url) {
            $dados['logo'] = $this->imagemAbsoluta($logo);
        }

        // Redes sociais knownAs (declara o perfil para o Google)
        $redes = array_filter([
            $config->url_instagram,
            $config->url_facebook,
            $config->url_youtube,
        ]);
        if ($redes) {
            $dados['sameAs'] = $redes;
        }

        $contato = config('seo.contato');

        // Endereco: so monta se houver rua, para nao publicar dados falsos
        $rua = $config->endereco_rua;
        if ($rua) {
            $dados['address'] = array_filter([
                '@type'           => 'PostalAddress',
                'streetAddress'   => trim(($rua) . ' ' . ($config->endereco_numero ?: '')),
                'addressLocality' => $config->endereco_cidade ?: $contato['cidade'],
                'addressRegion'   => $config->endereco_estado ?: $contato['estado'],
                'postalCode'      => $config->endereco_cep ?: $contato['cep'],
                'addressCountry'  => $contato['pais'],
            ]);
        } else {
            $dados['address'] = [
                '@type'           => 'PostalAddress',
                'addressLocality' => $contato['cidade'],
                'addressRegion'   => $contato['estado'],
                'addressCountry'  => $contato['pais'],
            ];
        }

        if ($telefone = $config->telefone ?: $contato['telefone']) {
            $dados['telephone'] = $telefone;
        }
        if ($email = $config->email_imprensa ?: $contato['email']) {
            $dados['email'] = $email;
        }

        // Horarios de culto como OpeningHoursSpecification
        $horarios = [];
        foreach (config('seo.cultos', []) as $culto) {
            $horarios[] = array_filter([
                '@type'     => 'OpeningHoursSpecification',
                'dayOfWeek' => $this->diaDaSemana($culto['dia'] ?? ''),
                'opens'     => $culto['hora'] ?? null,
                'description' => $culto['nome'] ?? null,
            ]);
        }
        if ($horarios) {
            $dados['openingHoursSpecification'] = $horarios;
        }

        return $dados;
    }

    /**
     * Converte o dia em ingles no formato do schema.org.
     */
    private function diaDaSemana(string $dia): ?string
    {
        $dias = [
            'domingo' => 'https://schema.org/Sunday',
            'segunda' => 'https://schema.org/Monday',
            'terca'   => 'https://schema.org/Tuesday',
            'quarta'  => 'https://schema.org/Wednesday',
            'quinta'  => 'https://schema.org/Thursday',
            'sexta'   => 'https://schema.org/Friday',
            'sabado'  => 'https://schema.org/Saturday',
        ];

        return $dias[Str::lower(Str::ascii($dia))] ?? null;
    }

    /**
     * Garante que a imagem seja uma URL absoluta (exigida por og:image).
     */
    public function imagemAbsoluta(string $url): string
    {
        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        return rtrim(config('app.url'), '/') . '/' . ltrim($url, '/');
    }

    /**
     * Corta o texto no limite, sem quebrar palavra e sem deixar reticencias
     * faltando espaco. Retorna o texto pronto para meta description.
     */
    public function resumir(?string $texto, int $limite = 160): string
    {
        $texto = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $texto)) ?? '');

        if ($texto === '' || Str::length($texto) <= $limite) {
            return $texto;
        }

        $corte = Str::substr($texto, 0, $limite);
        $espaco = strrpos($corte, ' ');

        return rtrim($espaco ? substr($corte, 0, $espaco) : $corte, " ,.;:-") . '…';
    }
}
