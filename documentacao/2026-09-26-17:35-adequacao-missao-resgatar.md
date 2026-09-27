# Adequação e Personalização para Missão Resgatar (www.mresgatar.com.br)

Data e Hora: 2026-09-26 17:35

## Objetivo

Baixar o gerenciador de site e portal desenvolvido em Laravel 12 + Inertia + React diretamente na raiz do projeto (sem criação de subpastas intermediárias) e adequar toda a identidade visual, dados, configurações, rotulagem e conteúdos institucionais para o portal da **Missão Resgatar** (`www.mresgatar.com.br`).

## O que foi realizado

1. **Clonagem e Organização na Raiz**:
   - Clonagem do repositório `https://github.com/maxitvhd/MarchaPraJesus.git` diretamente na raiz do diretório `/Users/maximooficial/Documents/Projetos/Missao Resgatar` sem criar subpastas aninhadas.

2. **Configuração de Ambiente e Banco de Dados**:
   - Criação e ajuste do arquivo `.env` e `.env.example` com o nome da aplicação (`Missão Resgatar`), URL oficial (`https://www.mresgatar.com.br`), idioma (`pt_BR`) e caminhos adequados para o banco SQLite.
   - Geração da chave da aplicação (`php artisan key:generate`).
   - Criação do link simbólico de uploads (`php artisan storage:link`).
   - Execução das migrações e seeders no banco de dados SQLite local.

3. **Seeder Institucional da Missão Resgatar (`DatabaseSeeder.php`)**:
   - População com notícias reais da igreja ("Bem-vindos à Missão Resgatar", lançamento da Rádio Web, Ação Social).
   - Devocionais bíblicos inspiradores (Lucas 15, Mateus 7, Salmos 133).
   - Agenda de Cultos da Missão (Culto da Família aos domingos às 19h, Culto de Ensino às quartas às 19h30, Vigílias e Encontros de Jovens).
   - Momentos em foto para a Galeria HD (Cultos, Louvor & Adoração, Comunhão, Ação Social).
   - Diretrizes e Estatutos ministeriais em Regulamentos.
   - Configurações do site com links para redes sociais oficiais (`@missaoresgatar`) e e-mail institucional `contato@mresgatar.com.br`.
   - Usuários administradores configurados (`maxitvhd@gmail.com`, `admin@mresgatar.com.br`, `maximoemsolucoes@gmail.com`).

4. **Frontend React & Inertia**:
   - **Navbar**: Logo com iniciais **MR**, título **MISSÃO RESGATAR** e subtítulo "Uma Igreja Viva". Rádio alterada para "Rádio Resgatar".
   - **Footer**: Slogan institucional da Missão Resgatar, dados de contato atualizados para `contato@mresgatar.com.br` e `www.mresgatar.com.br`, créditos da Rede Máximo em Soluções preservados.
   - **Página Inicial (`Home.tsx`)**: Textos, banners, contadores, destaques e pilares da visão ministerial atualizados.
   - **Internacionalização (`i18n`)**: Todos os dicionários (`pt`, `en`, `es`) adaptados para a Missão Resgatar, eliminando chaves duplicadas e referências ao evento anterior.
   - **Painel Administrativo (`AdminDashboard.tsx`)**: Títulos de seções, categorias pré-selecionadas, rotulagem de eventos e formulários ajustados para a gestão da Missão Resgatar.
   - **Console do Navegador (`app.tsx`)**: Ajustado conforme `REGRAS.MD` com mensagem corporativa da Maximo Tecnologias Brasil.

5. **Validação Técnica**:
   - `npm run lint` (`tsc --noEmit`): **0 erros TypeScript**.
   - `npm run build`: Build do Vite concluído com sucesso e assets gerados em `public/build/`.
6. **Correção de CORS / Carregamento de Assets em Desenvolvimento Local**:
   - O `.env` continha `ASSET_URL=https://www.mresgatar.com.br`, o que forçava o Laravel a gerar links absolutos apontando para o domínio externo em vez de `localhost:8000`.
   - `ASSET_URL` foi desativado no ambiente local e `APP_URL` definido como `http://localhost:8000`, permitindo que os scripts e estilos do Vite sejam carregados de forma relativa e com sucesso (HTTP 200).

-- git commit -m "fix: ajustar ASSET_URL e APP_URL local para evitar bloqueio CORS"
