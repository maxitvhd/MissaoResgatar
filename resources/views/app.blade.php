<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark overflow-x-hidden w-full max-w-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{--
        SEO dinamico: o pacote vem do SeoService (app/Services/SeoService.php).
        Tudo e renderizado no servidor de proposito: o site e SPA, entao os
        buscadores e as redes sociais so enxergam o que chega aqui no HTML.
    --}}
    @php($seo = $page['props']['seo'] ?? null)
    @php($og = $seo['og'] ?? [])
    @php($tw = $seo['twitter'] ?? [])

    <title inertia>{{ $seo['titulo'] ?? config('app.name', 'Missão Resgatar') }}</title>
    <meta name="description" content="{{ $seo['descricao'] ?? '' }}">
    <meta name="author" content="{{ config('app.name', 'Missão Resgatar') }}">
    @if(!empty($seo['palavras']))
        <meta name="keywords" content="{{ $seo['palavras'] }}">
    @endif
    <meta name="robots" content="{{ $seo['robots'] ?? 'index, follow' }}">
    <link rel="canonical" href="{{ $seo['canonical'] ?? url('/') }}">

    {{-- Open Graph (Facebook, WhatsApp, LinkedIn, Instagram) --}}
    <meta property="og:site_name" content="{{ $og['site_name'] ?? config('app.name') }}">
    <meta property="og:type" content="{{ $og['type'] ?? 'website' }}">
    <meta property="og:locale" content="{{ $og['locale'] ?? 'pt_BR' }}">
    <meta property="og:title" content="{{ $og['title'] ?? ($seo['titulo'] ?? '') }}">
    <meta property="og:description" content="{{ $og['description'] ?? ($seo['descricao'] ?? '') }}">
    <meta property="og:url" content="{{ $og['url'] ?? ($seo['canonical'] ?? url('/')) }}">
    @if(!empty($og['image']))
        <meta property="og:image" content="{{ $og['image'] }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ $og['title'] ?? ($seo['titulo'] ?? '') }}">
    @endif

    {{-- Twitter / X --}}
    <meta name="twitter:card" content="{{ $tw['card'] ?? 'summary_large_image' }}">
    <meta name="twitter:title" content="{{ $tw['title'] ?? ($seo['titulo'] ?? '') }}">
    <meta name="twitter:description" content="{{ $tw['description'] ?? ($seo['descricao'] ?? '') }}">
    @if(!empty($tw['image']))
        <meta name="twitter:image" content="{{ $tw['image'] }}">
    @endif
    @if(!empty($tw['site']))
        <meta name="twitter:site" content="{{ $tw['site'] }}">
    @endif

    {{-- Dados estruturados (JSON-LD): igreja, artigos, eventos, produtos, paginas --}}
    @foreach($seo['json_ld'] ?? [] as $dadosEstruturados)
        <script type="application/ld+json">{!! json_encode($dadosEstruturados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
    @endforeach

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    {{-- Favicon inline --}}
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23d4af37'/%3E%3Ctext x='50' y='65' font-size='55' text-anchor='middle' fill='%230f172a' font-family='Arial' font-weight='bold'%3EM%3C/text%3E%3C/svg%3E">
    <meta name="theme-color" content="#0f172a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Missão Resgatar') }}">

    @vite(['resources/css/app.css', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-950 text-slate-300 overflow-x-hidden w-full max-w-full relative">
    @inertia
</body>
</html>
