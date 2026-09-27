# Missão Resgatar

Portal e Gerenciador de Conteúdo da **Missão Resgatar** (www.mresgatar.com.br).
Uma Igreja Viva Resgatando Vidas através do evangelho de Jesus Cristo.

## Tecnologias

- **Backend**: Laravel 12, PHP 8.5, SQLite
- **Frontend**: React 19, Inertia.js, Tailwind CSS, TypeScript, Vite
- **Recursos**: Painel Administrativo, Notícias & Blog, Devocionais Bíblicos, Rádio Online 24h, Bíblia Online com cartões de oração, Galeria de fotos e Agenda de Cultos & Eventos.

## Inicialização Local

```bash
# Instalar dependências
composer install
npm install

# Configurar ambiente
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed

# Executar desenvolvimento
npm run dev
php artisan serve
```

## Acesso Administrativo Padrão

- **URL**: `/admin`
- **Email**: `maxitvhd@gmail.com`
- **Senha**: `Kellytamo@10`
- **Email secundário**: `admin@mresgatar.com.br` / `123@mudar`
