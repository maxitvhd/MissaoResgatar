<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnotacaoController;
use App\Http\Controllers\AtracaoController;
use App\Http\Controllers\AulaFechadaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaravanaController;
use App\Http\Controllers\ConfiguracaoController;
use App\Http\Controllers\DevocionalController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\FinanceiroController;
use App\Http\Controllers\GaleriaController;
use App\Http\Controllers\LojaController;
use App\Http\Controllers\MembroController;
use App\Http\Controllers\MidiaController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\PaginaController;
use App\Http\Controllers\PatrocinadorController;
use App\Http\Controllers\RegulamentoController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TraducaoController;
use App\Http\Controllers\TransparenciaController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoYoutubeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas Publicas - Paginas Inertia (React)
|--------------------------------------------------------------------------
*/

Route::get('/', [PaginaController::class, 'home'])->name('home');
Route::get('/noticias', [PaginaController::class, 'noticias'])->name('noticias');
Route::get('/devocionais', [PaginaController::class, 'devocionais'])->name('devocionais');
Route::get('/biblia', [PaginaController::class, 'biblia'])->name('biblia');
Route::get('/radio', [PaginaController::class, 'radio'])->name('radio');
Route::get('/galeria', [PaginaController::class, 'galeria'])->name('galeria');
Route::get('/regulamentos', [PaginaController::class, 'regulamentos'])->name('regulamentos');
Route::get('/loja', [LojaController::class, 'paginaLoja'])->name('loja');
Route::get('/transparencia', [TransparenciaController::class, 'paginaTransparencia'])->name('transparencia');
Route::get('/aulas', [AulaFechadaController::class, 'paginaAulas'])->name('aulas')->middleware('auth');
Route::get('/notas', [PaginaController::class, 'notas'])->name('notas')->middleware('auth');

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

/*
|--------------------------------------------------------------------------
| Autenticacao
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'mostrarLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/registro', [AuthController::class, 'mostrarRegistro'])->name('registro');
    Route::post('/registro', [AuthController::class, 'registrar']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

/*
|--------------------------------------------------------------------------
| API JSON - Conteudo publico (usado pelo frontend React)
|--------------------------------------------------------------------------
*/

Route::get('/api/noticias', [NoticiaController::class, 'index']);
Route::get('/api/noticias/{noticia}', [NoticiaController::class, 'mostrar']);
Route::post('/api/noticias/{noticia}/curtir', [NoticiaController::class, 'curtir']);
Route::post('/api/noticias/{noticia}/comentar', [NoticiaController::class, 'comentar']);

Route::get('/api/devocionais', [DevocionalController::class, 'index']);
Route::get('/api/devocionais/{devocional}', [DevocionalController::class, 'mostrar']);

Route::get('/api/eventos', [EventoController::class, 'index']);
Route::get('/api/galeria', [GaleriaController::class, 'index']);
Route::get('/api/regulamentos', [RegulamentoController::class, 'index']);
Route::get('/api/patrocinadores', [PatrocinadorController::class, 'index']);
Route::get('/api/atracoes', [AtracaoController::class, 'index']);
Route::get('/api/configuracoes', [ConfiguracaoController::class, 'index']);
Route::get('/api/videos-youtube', [VideoYoutubeController::class, 'index']);
Route::get('/api/youtube/info', [VideoYoutubeController::class, 'obterDadosYoutube']);
Route::get('/api/produtos', [LojaController::class, 'index']);
Route::get('/api/categorias-produtos', [LojaController::class, 'categorias']);
Route::get('/api/transparencia', [TransparenciaController::class, 'apiDados']);
Route::post('/api/loja/pedidos/registrar-clique', [FinanceiroController::class, 'registrarCliqueLoja']);

Route::post('/api/caravanas', [CaravanaController::class, 'criar']);

Route::post('/api/translate', [TraducaoController::class, 'traduzir']);
Route::get('/api/daily-verse', [TraducaoController::class, 'versiculoDiario']);

/*
|--------------------------------------------------------------------------
| API JSON - Autenticado (notas pessoais e aulas fechadas)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/api/notas', [AnotacaoController::class, 'index']);
    Route::post('/api/notas', [AnotacaoController::class, 'criar']);
    Route::put('/api/notas/{anotacao}', [AnotacaoController::class, 'atualizar']);
    Route::delete('/api/notas/{anotacao}', [AnotacaoController::class, 'excluir']);

    Route::get('/api/aulas', [AulaFechadaController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Painel Admin - somente usuarios com perfil admin
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/usuarios', [AdminController::class, 'usuarios'])->name('usuarios');
    Route::put('/usuarios/{usuario}', [AdminController::class, 'atualizarUsuario'])->name('usuarios.atualizar');
    Route::delete('/usuarios/{usuario}', [AdminController::class, 'excluirUsuario'])->name('usuarios.excluir');

    // Gestao de conteudo (API JSON usada pelo AdminDashboard React)
    Route::post('/noticias', [NoticiaController::class, 'criar']);
    Route::put('/noticias/{noticia}', [NoticiaController::class, 'atualizar']);
    Route::delete('/noticias/{noticia}', [NoticiaController::class, 'excluir']);

    Route::post('/devocionais', [DevocionalController::class, 'criar']);
    Route::put('/devocionais/{devocional}', [DevocionalController::class, 'atualizar']);
    Route::delete('/devocionais/{devocional}', [DevocionalController::class, 'excluir']);

    Route::post('/eventos', [EventoController::class, 'criar']);
    Route::put('/eventos/{evento}', [EventoController::class, 'atualizar']);
    Route::delete('/eventos/{evento}', [EventoController::class, 'excluir']);

    Route::post('/galeria', [GaleriaController::class, 'criar']);
    Route::post('/galeria/lote', [GaleriaController::class, 'criarLote']);
    Route::put('/galeria/{item}', [GaleriaController::class, 'atualizar']);
    Route::delete('/galeria/{item}', [GaleriaController::class, 'excluir']);

    Route::post('/regulamentos', [RegulamentoController::class, 'criar']);
    Route::put('/regulamentos/{regulamento}', [RegulamentoController::class, 'atualizar']);
    Route::delete('/regulamentos/{regulamento}', [RegulamentoController::class, 'excluir']);

    Route::get('/caravanas', [CaravanaController::class, 'index']);
    Route::put('/caravanas/{caravana}', [CaravanaController::class, 'atualizar']);
    Route::delete('/caravanas/{caravana}', [CaravanaController::class, 'excluir']);

    Route::post('/patrocinadores', [PatrocinadorController::class, 'criar']);
    Route::put('/patrocinadores/{patrocinador}', [PatrocinadorController::class, 'atualizar']);
    Route::delete('/patrocinadores/{patrocinador}', [PatrocinadorController::class, 'excluir']);

    Route::post('/atracoes', [AtracaoController::class, 'criar']);
    Route::put('/atracoes/{atracao}', [AtracaoController::class, 'atualizar']);
    Route::delete('/atracoes/{atracao}', [AtracaoController::class, 'excluir']);

    Route::post('/videos-youtube', [VideoYoutubeController::class, 'criar']);
    Route::put('/videos-youtube/{video}', [VideoYoutubeController::class, 'atualizar']);
    Route::delete('/videos-youtube/{video}', [VideoYoutubeController::class, 'excluir']);

    Route::post('/categorias-produtos', [LojaController::class, 'criarCategoria']);
    Route::delete('/categorias-produtos/{categoria}', [LojaController::class, 'excluirCategoria']);
    Route::post('/produtos', [LojaController::class, 'criarProduto']);
    Route::put('/produtos/{produto}', [LojaController::class, 'atualizarProduto']);
    Route::delete('/produtos/{produto}', [LojaController::class, 'excluirProduto']);

    Route::post('/aulas', [AulaFechadaController::class, 'criar']);
    Route::put('/aulas/{aula}', [AulaFechadaController::class, 'atualizar']);
    Route::delete('/aulas/{aula}', [AulaFechadaController::class, 'excluir']);

    // Gestao de Membros da Igreja
    Route::get('/membros', [MembroController::class, 'index']);
    Route::get('/membros/{membro}', [MembroController::class, 'detalhes']);
    Route::post('/membros', [MembroController::class, 'criar']);
    Route::put('/membros/{membro}', [MembroController::class, 'atualizar']);
    Route::delete('/membros/{membro}', [MembroController::class, 'excluir']);

    // Gestao Financeira, Dizimos, Ofertas, Vendas e Saidas
    Route::get('/financeiro/dashboard', [FinanceiroController::class, 'dashboard']);
    Route::get('/financeiro/transacoes', [FinanceiroController::class, 'transacoes']);
    Route::post('/financeiro/transacoes', [FinanceiroController::class, 'criarTransacao']);
    Route::put('/financeiro/transacoes/{transacao}', [FinanceiroController::class, 'atualizarTransacao']);
    Route::delete('/financeiro/transacoes/{transacao}', [FinanceiroController::class, 'excluirTransacao']);
    Route::get('/financeiro/pedidos-loja', [FinanceiroController::class, 'pedidosLoja']);
    Route::put('/financeiro/pedidos-loja/{pedido}', [FinanceiroController::class, 'atualizarStatusPedido']);

    Route::put('/configuracoes', [ConfiguracaoController::class, 'atualizar']);

    Route::post('/upload', [UploadController::class, 'enviar']);
    Route::post('/upload/lote', [UploadController::class, 'enviarLote']);

    // Gerenciador de midias do site
    Route::get('/midias', [MidiaController::class, 'index']);
    Route::put('/midias/renomear', [MidiaController::class, 'renomear']);
    Route::delete('/midias', [MidiaController::class, 'excluir']);
});
