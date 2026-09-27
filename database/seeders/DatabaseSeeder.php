<?php

namespace Database\Seeders;

use App\Models\AnotacaoPessoal;
use App\Models\Atracao;
use App\Models\Caravana;
use App\Models\Comentario;
use App\Models\ConfiguracaoSite;
use App\Models\Devocional;
use App\Models\EventoAgenda;
use App\Models\Galeria;
use App\Models\Noticia;
use App\Models\Patrocinador;
use App\Models\Regulamento;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder inicial: popula o banco com dados da Missao Resgatar
 * (www.mresgatar.com.br).
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Executa os seeds do banco.
     */
    public function run(): void
    {
        $this->criarUsuarios();
        $this->criarNoticias();
        $this->criarDevocionais();
        $this->criarEventos();
        $this->criarGaleria();
        $this->criarRegulamentos();
        $this->criarPatrocinadores();
        $this->criarAtracoes();
        $this->criarConfiguracoes();
    }

    /**
     * LOG: 1 - criando usuarios admin e usuario padrao
     */
    private function criarUsuarios(): void
    {
        User::firstOrCreate(
            ['email' => 'maximoemsolucoes@gmail.com'],
            [
                'name'     => 'Rede Máximo',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'membro@mresgatar.com.br'],
            [
                'name'     => 'Membro Resgatar',
                'password' => Hash::make('user123'),
                'role'     => 'user',
            ]
        );

        User::firstOrCreate(
            ['email' => 'maxitvhd@gmail.com'],
            [
                'name'     => 'Máximo Melo (Admin)',
                'password' => Hash::make('Kellytamo@10'),
                'role'     => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin@mresgatar.com.br'],
            [
                'name'     => 'Administrador Missão Resgatar',
                'password' => Hash::make('123@mudar'),
                'role'     => 'admin',
            ]
        );
    }

    /**
     * LOG: 2 - criando noticias e comentarios iniciais
     */
    private function criarNoticias(): void
    {
        if (Noticia::count() > 0) {
            return;
        }

        $noticia1 = Noticia::create([
            'titulo' => 'Bem-vindos à Missão Resgatar: Uma Igreja Viva Resgatando Vidas!',
            'conteudo' => 'Com grande alegria e temor ao Senhor, damos as boas-vindas a todos que chegam à Missão Resgatar. Somos uma comunidade de fé comprometida com o evangelho transformador de Jesus Cristo, dedicada a acolher famílias, restaurar vidas e proclamar a verdade da Palavra de Deus.

Nossa Visão e Propósito:
A Missão Resgatar nasceu no coração de Deus com a missão de resgatar corações feridos, proclamar libertação aos cativos e capacitar cada crente a viver uma vida abundante em comunhão com o Pai e com os irmãos.

Programação Semanal de Cultos:
- Domingo às 19h00: Culto da Família e Celebração
- Quarta-feira às 19h30: Culto de Ensino da Palavra & Oração
- Sábado às 19h30: Rede de Jovens & Conectados

Convidamos você e sua família para fazer parte desta grande missão de amor, restauração e esperança!',
            'autor' => 'Liderança Missão Resgatar',
            'imagem' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
            'categoria' => 'Missão Resgatar',
            'curtidas' => 280,
            'visualizacoes' => 950,
        ]);

        Comentario::create([
            'noticia_id' => $noticia1->id,
            'autor' => 'Pr. Máximo Melo',
            'conteudo' => 'Uma alegria ver a obra do Senhor avançando! Que cada vida seja ricamente abençoada.',
        ]);
        Comentario::create([
            'noticia_id' => $noticia1->id,
            'autor' => 'Família Silva',
            'conteudo' => 'Lugar abençoado onde encontramos acolhimento, palavra verdadeira e a presença do Espírito Santo.',
        ]);

        $noticia2 = Noticia::create([
            'titulo' => 'Rádio Missão Resgatar Online no Ar: Louvor e Edificação 24 Horas',
            'conteudo' => 'Já está no ar a Rádio Web Missão Resgatar! Uma estação dedicada a edificar a sua vida diariamente, onde quer que você esteja.

Transmissão Digital em Alta Fidelidade:
Com transmissão contínua, nossa programação traz os melhores louvores contemporâneos, hinos de adoração, mensagens bíblicas edificantes e momentos de oração intercessória.

Ouça pelo Portal ou no Celular:
Você pode ouvir a rádio diretamente em nosso site através do player integrado no rodapé e no menu superior, com total compatibilidade para dispositivos móveis.',
            'autor' => 'Comunicação Missão Resgatar',
            'imagem' => 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
            'categoria' => 'Novidades',
            'curtidas' => 175,
            'visualizacoes' => 620,
        ]);

        Comentario::create([
            'noticia_id' => $noticia2->id,
            'autor' => 'Lucas Santos',
            'conteudo' => 'Qualidade impecável de áudio! Sintonizado todos os dias aqui no trabalho.',
        ]);

        Noticia::create([
            'titulo' => 'Ação Social Resgatar: Arrecadação de Alimentos e Apoio às Famílias',
            'conteudo' => 'O amor de Deus se manifesta em ações práticas. A Missão Resgatar iniciou sua nova campanha de solidariedade para apoiar famílias em vulnerabilidade em nossa região.

Como Participar:
Você pode trazer alimentos não perecíveis em nossos cultos de domingo e quarta-feira, ou participar como voluntário nas equipes de triagem e entrega de cestas básicas.

Venha ser as mãos estendidas de Jesus para resgatar aqueles que mais necessitam!',
            'autor' => 'Ação Social Resgatar',
            'imagem' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
            'categoria' => 'Ação Social',
            'curtidas' => 312,
            'visualizacoes' => 840,
        ]);
    }

    /**
     * LOG: 3 - criando devocionais iniciais
     */
    private function criarDevocionais(): void
    {
        if (Devocional::count() > 0) {
            return;
        }

        Devocional::create([
            'titulo' => 'O Poder do Resgate pela Graça',
            'conteudo' => 'Em Lucas 15, Jesus conta a parábola da ovelha perdida. O bom pastor deixa as noventa e nove no deserto para ir atrás daquela que se perdeu até encontrá-la. E, encontrando-a, a põe sobre os ombros, cheio de júbilo.

Esse é o verdadeiro coração da Missão Resgatar: o Senhor não desiste de ninguém. Não importa a distância, as feridas ou o passado, a graça de Deus é poderosa para alcançar, perdoar e restaurar por completo.

Se hoje você se sente distante ou sobrecarregado, saiba que os braços do Bom Pastor continuam abertos. Permita que Ele resgate o seu coração e restaure a paz em sua alma.',
            'escritura' => 'Lucas 15:4-7',
            'categoria' => 'Graça & Salvação',
            'leituras' => 520,
        ]);

        Devocional::create([
            'titulo' => 'Edificando a Casa sobre a Rocha Inabalável',
            'conteudo' => 'Jesus ensinou que todo aquele que ouve as Suas palavras e as pratica é semelhante ao homem prudente que edificou a sua casa sobre a rocha. As chuvas desceram, os rios transbordaram, os ventos sopraram, e ela não caiu, pois estava alicerçada na rocha.

Edificar sobre a Rocha significa colocar os princípios bíblicos no centro do nosso casamento, das finanças, do trabalho e das decisões diárias.

Quando as crises chegam, quem está firmado em Cristo permanece inabalável. Busque ao Senhor hoje em oração e alinhe suas decisões com os conselhos eternos da Palavra.',
            'escritura' => 'Mateus 7:24-25',
            'categoria' => 'Edificação',
            'leituras' => 415,
        ]);

        Devocional::create([
            'titulo' => 'A Beleza da Comunhão e do Amor Fraternal',
            'conteudo' => 'O Salmo 133 declara: "Oh! quão bom e quão suave é que os irmãos vivam em união!". Ali o Senhor ordena a bênção e a vida para sempre.

A igreja não é apenas um templo ou edifício, é uma família espiritual onde cada membro cuida do outro, compartilha as alegrias e divide os fardos. Na Missão Resgatar, valorizamos cada pessoa como um tesouro precioso de Deus.

Que neste dia você possa estender uma palavra de ânimo a um irmão e semear a paz onde quer que você esteja.',
            'escritura' => 'Salmos 133:1-3',
            'categoria' => 'Comunhão',
            'leituras' => 380,
        ]);
    }

    /**
     * LOG: 4 - criando eventos da agenda
     */
    private function criarEventos(): void
    {
        if (EventoAgenda::count() > 0) {
            return;
        }

        EventoAgenda::create([
            'titulo' => 'Culto da Família & Celebração',
            'descricao' => 'Momento especial de louvor congregacional, adoração, palavra inspiradora para a família e ministração do Espírito Santo.',
            'local' => 'Sede Missão Resgatar',
            'data_hora' => '2026-10-04 19:00:00',
            'imagem' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        ]);

        EventoAgenda::create([
            'titulo' => 'Culto de Ensino Bíblico & Oração',
            'descricao' => 'Estudo aprofundado das Escrituras Sagradas e clamor intercessório pelas famílias e necessidades da igreja.',
            'local' => 'Sede Missão Resgatar',
            'data_hora' => '2026-10-07 19:30:00',
            'imagem' => 'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=800&q=80',
        ]);

        EventoAgenda::create([
            'titulo' => 'Vigília Resgatar: Noite de Avivamento e Clamor',
            'descricao' => 'Uma noite de poder, busca intensa da presença de Deus, louvor contínuo e intercessão profética.',
            'local' => 'Sede Missão Resgatar',
            'data_hora' => '2026-10-10 22:00:00',
            'imagem' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
        ]);
    }

    /**
     * LOG: 5 - criando itens da galeria
     */
    private function criarGaleria(): void
    {
        if (Galeria::count() > 0) {
            return;
        }

        $itens = [
            [
                'titulo' => 'Celebração e Louvor ao Vivo',
                'descricao' => 'Comunidade reunida em adoração e exaltação ao Senhor em nossos cultos de domingo.',
                'url' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
                'categoria' => 'Cultos',
            ],
            [
                'titulo' => 'Ministério de Louvor Missão Resgatar',
                'descricao' => 'Equipe de levitas e músicos ministrando com unção e dedicação na presença do Senhor.',
                'url' => 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
                'categoria' => 'Louvor & Adoração',
            ],
            [
                'titulo' => 'Comunhão e Acolhimento Fraternal',
                'descricao' => 'Irmãos reunidos celebrando a alegria de fazer parte da família da fé.',
                'url' => 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
                'categoria' => 'Comunhão',
            ],
            [
                'titulo' => 'Ação Social e Evangelismo nas Ruas',
                'descricao' => 'Equipe da Missão Resgatar distribuindo cestas e levando a palavra de esperança às famílias.',
                'url' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
                'categoria' => 'Ação Social',
            ],
        ];

        foreach ($itens as $item) {
            Galeria::create($item);
        }
    }

    /**
     * LOG: 6 - criando regulamentos e diretrizes
     */
    private function criarRegulamentos(): void
    {
        if (Regulamento::count() > 0) {
            return;
        }

        Regulamento::create([
            'titulo' => 'Diretrizes Ministeriais e Estatuto da Missão Resgatar',
            'descricao' => 'Princípios fundamentais, visão bíblica, confissão de fé e estrutura de liderança da Missão Resgatar.',
            'categoria' => 'Doutrina & Fé',
            'link' => 'https://www.mresgatar.com.br/docs/estatuto-diretrizes.pdf',
        ]);

        Regulamento::create([
            'titulo' => 'Manual dos Ministérios (Louvor, Recepção e Mídia)',
            'descricao' => 'Orientações práticas de pontualidade, preparo espiritual, escalas e postura para voluntários dos departamentos.',
            'categoria' => 'Ministérios',
            'link' => 'https://www.mresgatar.com.br/docs/manual-ministerios.pdf',
        ]);

        Regulamento::create([
            'titulo' => 'Guia de Células e Grupos de Oração nos Lares',
            'descricao' => 'Orientações para anfitriões e líderes de grupos familiares de estudo bíblico, acolhimento e comunhão.',
            'categoria' => 'Células',
            'link' => 'https://www.mresgatar.com.br/docs/guia-celulas.pdf',
        ]);
    }

    /**
     * LOG: 7 - criando parceiros e apoiadores
     */
    private function criarPatrocinadores(): void
    {
        if (Patrocinador::count() > 0) {
            return;
        }

        Patrocinador::create([
            'nome' => 'Rede Máximo em Soluções',
            'url_imagem' => 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=300&q=80',
            'link' => 'https://maximoprotecoes.com.br',
        ]);

        Patrocinador::create([
            'nome' => 'Missão & Ação Social Resgatar',
            'url_imagem' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
            'link' => 'https://www.mresgatar.com.br',
        ]);
    }

    /**
     * LOG: 8 - criando liderança pastoral e ministérios
     */
    private function criarAtracoes(): void
    {
        if (Atracao::count() > 0) {
            return;
        }

        $atracoes = [
            ['nome' => 'Ministério Pastoral', 'descricao' => 'Cuidado espiritual, oração e ministração da Palavra', 'horario' => 'Domingos 19h'],
            ['nome' => 'Ministério de Louvor Resgatar', 'descricao' => 'Adoração congregacional e exaltação a Deus', 'horario' => 'Em todos os cultos'],
            ['nome' => 'Rede de Células & Família', 'descricao' => 'Comunhão e discipulado nos lares', 'horario' => 'Semanal'],
            ['nome' => 'Juventude Resgatar', 'descricao' => 'Jovens apaixonados pelo Reino de Deus', 'horario' => 'Sábados 19h30'],
            ['nome' => 'Departamento Infantil', 'descricao' => 'Ensino bíblico lúdico e amoroso para as crianças', 'horario' => 'Domingos 19h'],
        ];

        foreach ($atracoes as $atracao) {
            Atracao::create($atracao);
        }
    }

    /**
     * LOG: 9 - criando configuracoes iniciais do site
     */
    private function criarConfiguracoes(): void
    {
        $config = ConfiguracaoSite::obter();

        if (empty($config->url_instagram)) {
            $config->update([
                'url_video_fundo' => 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c025f73d485c20130d2e8d356fae40a1&profile_id=139&oauth2_token_id=57447761',
                'url_imagem_hero' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
                'url_instagram' => 'https://instagram.com/missaoresgatar',
                'url_facebook' => 'https://facebook.com/missaoresgatar',
                'url_youtube' => 'https://youtube.com/missaoresgatar',
                'email_imprensa' => 'contato@mresgatar.com.br',
                'link_material_imprensa' => 'https://www.mresgatar.com.br/docs/kit-institucional.zip',
                'link_credencial_imprensa' => 'https://www.mresgatar.com.br/contato',
            ]);
        }
    }
}
