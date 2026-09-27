<?php

namespace App\Http\Controllers;

use App\Services\LogService;
use Illuminate\Http\Response;

/**
 * Gera o sitemap.xml com as URLs publicas do site.
 */
class SitemapController extends Controller
{
    public function index(): Response
    {
        LogService::info('1 - gerando sitemap.xml');

        $base = rtrim(config('app.url'), '/');

        $paginas = [
            '/' => ['freq' => 'daily', 'priority' => '1.0'],
            '/noticias' => ['freq' => 'daily', 'priority' => '0.9'],
            '/devocionais' => ['freq' => 'weekly', 'priority' => '0.8'],
            '/biblia' => ['freq' => 'weekly', 'priority' => '0.8'],
            '/radio' => ['freq' => 'weekly', 'priority' => '0.7'],
            '/galeria' => ['freq' => 'weekly', 'priority' => '0.7'],
            '/regulamentos' => ['freq' => 'monthly', 'priority' => '0.6'],
        ];

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
        $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";

        foreach ($paginas as $caminho => $meta) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$base}{$caminho}</loc>\n";
            $xml .= "    <changefreq>{$meta['freq']}</changefreq>\n";
            $xml .= "    <priority>{$meta['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= "</urlset>\n";

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    public function robots(): Response
    {
        LogService::info('1 - gerando robots.txt');

        $base = rtrim(config('app.url'), '/');
        $txt = "User-agent: *\n";
        $txt .= "Disallow:\n\n";
        $txt .= "Sitemap: {$base}/sitemap.xml\n";

        return response($txt, 200)->header('Content-Type', 'text/plain');
    }
}
