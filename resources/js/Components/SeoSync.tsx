import React, { useEffect, useRef } from "react";
import { usePage } from "@inertiajs/react";

/** Cria (ou atualiza) uma tag <meta> do <head> */
function definirMeta(selector: string, atributo: "name" | "property", chave: string, conteudo?: string | null) {
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!conteudo) {
    meta?.remove();
    return;
  }
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(atributo, chave);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", conteudo);
}

/** Cria (ou atualiza) um <script type="application/ld+json"> */
function definirJsonLd(dados: any[]) {
  document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
  dados.forEach((dado) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "1");
    script.textContent = JSON.stringify(dado);
    document.head.appendChild(script);
  });
}

/**
 * Sincroniza o SEO durante a navegacao do Inertia.
 *
 * Na primeira carga quem monta o head e o blade (o buscador ve aquilo).
 * Navegando por link, o blade nao volta a ser enviado, entao aqui as tags
 * sao atualizadas para o usuario e para quem compartilha a URL.
 */
export default function SeoSync() {
  const { props, url } = usePage<any>();
  const primeiraRenderizacao = useRef(true);

  useEffect(() => {
    const seo = props?.seo;
    if (!seo) return;

    // Na primeira carga o blade ja renderizou tudo corretamente
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }

    document.title = seo.titulo || "";

    definirMeta('meta[name="description"]', "name", "description", seo.descricao);
    definirMeta('meta[name="robots"]', "name", "robots", seo.robots);
    definirMeta('meta[name="keywords"]', "name", "keywords", seo.palavras);

    definirMeta('meta[property="og:title"]', "property", "og:title", seo.og?.title);
    definirMeta('meta[property="og:description"]', "property", "og:description", seo.og?.description);
    definirMeta('meta[property="og:url"]', "property", "og:url", seo.og?.url);
    definirMeta('meta[property="og:type"]', "property", "og:type", seo.og?.type);
    definirMeta('meta[property="og:image"]', "property", "og:image", seo.og?.image);
    definirMeta('meta[property="og:image:alt"]', "property", "og:image:alt", seo.og?.image ? seo.og.title : null);

    definirMeta('meta[name="twitter:card"]', "name", "twitter:card", seo.twitter?.card);
    definirMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.twitter?.title);
    definirMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.twitter?.description);
    definirMeta('meta[name="twitter:image"]', "name", "twitter:image", seo.twitter?.image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonical || window.location.href;

    definirJsonLd(seo.json_ld || []);
  }, [url, props?.seo]);

  return null;
}
