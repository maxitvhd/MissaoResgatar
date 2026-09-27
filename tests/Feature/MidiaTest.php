<?php

namespace Tests\Feature;

use App\Models\Galeria;
use App\Models\Produto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MidiaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_upload_usa_a_pasta_mandada(): void
    {
        $resposta = $this->actingAs($this->admin())->postJson('/admin/upload', [
            'arquivo' => UploadedFile::fake()->image('foto.jpg'),
            'pasta'   => 'galeria',
        ]);

        $resposta->assertOk();
        $caminho = ltrim(str_replace(url('/storage'), '', $resposta->json('url')), '/');
        $this->assertStringStartsWith('galeria/', $caminho);
        Storage::disk('public')->assertExists($caminho);
    }

    public function test_upload_recusa_pasta_fora_da_whitelist(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/admin/upload', [
                'arquivo' => UploadedFile::fake()->image('foto.jpg'),
                'pasta'   => '../../etc',
            ])
            ->assertStatus(422);
    }

    public function test_upload_sem_pasta_cai_em_uploads(): void
    {
        $resposta = $this->actingAs($this->admin())->postJson('/admin/upload', [
            'arquivo' => UploadedFile::fake()->image('foto.jpg'),
        ]);

        $resposta->assertOk();
        $caminho = ltrim(str_replace(url('/storage'), '', $resposta->json('url')), '/');
        $this->assertStringStartsWith('uploads/', $caminho);
    }

    public function test_listagem_mostra_uso_da_midia(): void
    {
        Storage::disk('public')->put('galeria/culto.jpg', 'conteudo');
        Galeria::create(['titulo' => 'Culto Domingo', 'url' => url('/storage/galeria/culto.jpg'), 'categoria' => 'Cultos']);

        $resposta = $this->actingAs($this->admin())->getJson('/admin/midias?pasta=galeria');
        $resposta->assertOk();
        $resposta->assertJsonPath('total', 1);

        $arquivo = $resposta->json('arquivos.0');
        $this->assertEquals('galeria/culto.jpg', $arquivo['caminho']);
        $this->assertEquals('Culto Domingo', $arquivo['em_uso'][0]['titulo']);
    }

    public function test_renomear_corrige_url_no_banco(): void
    {
        Storage::disk('public')->put('galeria/culto-antigo.jpg', 'conteudo');
        Galeria::create(['titulo' => 'Culto', 'url' => url('/storage/galeria/culto-antigo.jpg'), 'categoria' => 'Cultos']);

        $resposta = $this->actingAs($this->admin())->putJson('/admin/midias/renomear', [
            'caminho'   => 'galeria/culto-antigo.jpg',
            'novo_nome' => 'culto-novo.jpg',
        ]);

        $resposta->assertOk();
        Storage::disk('public')->assertMissing('galeria/culto-antigo.jpg');
        Storage::disk('public')->assertExists('galeria/culto-novo.jpg');
        $this->assertEquals(url('/storage/galeria/culto-novo.jpg'), Galeria::first()->url);
    }

    public function test_renomear_corrige_galeria_json_do_produto(): void
    {
        Storage::disk('public')->put('produtos/camisa.jpg', 'conteudo');
        Produto::create([
            'nome'            => 'Camiseta',
            'preco'           => 49.90,
            'imagem_url'      => url('/storage/produtos/camisa.jpg'),
            'imagens_galeria' => [url('/storage/produtos/camisa.jpg'), url('https://exemplo.com/outra.jpg')],
        ]);

        $this->actingAs($this->admin())->putJson('/admin/midias/renomear', [
            'caminho'   => 'produtos/camisa.jpg',
            'novo_nome' => 'camisa-nova.jpg',
        ])->assertOk();

        $produto = Produto::first();
        $this->assertEquals(url('/storage/produtos/camisa-nova.jpg'), $produto->imagem_url);
        $this->assertEquals(url('/storage/produtos/camisa-nova.jpg'), $produto->imagens_galeria[0]);
        $this->assertEquals('https://exemplo.com/outra.jpg', $produto->imagens_galeria[1]);
    }

    public function test_excluir_bloqueia_midia_em_uso(): void
    {
        Storage::disk('public')->put('galeria/culto.jpg', 'conteudo');
        Galeria::create(['titulo' => 'Culto', 'url' => url('/storage/galeria/culto.jpg'), 'categoria' => 'Cultos']);

        $resposta = $this->actingAs($this->admin())->deleteJson('/admin/midias', ['caminho' => 'galeria/culto.jpg']);
        $resposta->assertStatus(409);
        $resposta->assertJsonPath('em_uso.0.titulo', 'Culto');
        Storage::disk('public')->assertExists('galeria/culto.jpg');
    }

    public function test_excluir_com_confirmacao_apaga_arquivo_e_limpa_referencia(): void
    {
        Storage::disk('public')->put('galeria/culto.jpg', 'conteudo');
        Galeria::create(['titulo' => 'Culto', 'url' => url('/storage/galeria/culto.jpg'), 'categoria' => 'Cultos']);

        $this->actingAs($this->admin())->deleteJson('/admin/midias', [
            'caminho'   => 'galeria/culto.jpg',
            'confirmar' => true,
        ])->assertOk();

        Storage::disk('public')->assertMissing('galeria/culto.jpg');
        // galeria.url e NOT NULL no schema, entao fica vazia em vez de null
        $this->assertSame('', Galeria::first()->url);
    }

    public function test_excluir_midia_livre(): void
    {
        Storage::disk('public')->put('galeria/orfa.png', 'conteudo');

        $this->actingAs($this->admin())
            ->deleteJson('/admin/midias', ['caminho' => 'galeria/orfa.png'])
            ->assertOk();

        Storage::disk('public')->assertMissing('galeria/orfa.png');
    }

    public function test_path_traversal_bloqueado(): void
    {
        $this->actingAs($this->admin())
            ->deleteJson('/admin/midias', ['caminho' => '../../.env'])
            ->assertStatus(422);
    }

    public function test_rota_exige_admin(): void
    {
        $this->getJson('/admin/midias')->assertStatus(401);
    }

    private function admin()
    {
        $usuario = \App\Models\User::factory()->create();
        $usuario->forceFill(['role' => 'admin'])->save();
        return $usuario;
    }
}
