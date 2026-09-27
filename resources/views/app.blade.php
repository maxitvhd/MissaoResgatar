<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark overflow-x-hidden w-full max-w-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Missão Resgatar') }}</title>
    <meta name="description" content="Portal oficial da Missão Resgatar - Uma Igreja Viva Resgatando Vidas. Notícias, devocionais, cultos, bíblia e rádio online.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    {{-- Favicon inline --}}
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23d4af37'/%3E%3Ctext x='50' y='65' font-size='55' text-anchor='middle' fill='%230f172a' font-family='Arial' font-weight='bold'%3EM%3C/text%3E%3C/svg%3E">

    @vite(['resources/css/app.css', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-950 text-slate-300 overflow-x-hidden w-full max-w-full relative">
    @inertia
</body>
</html>
