import React, { useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { ChevronLeft, Calendar, User, Share2, Check, ExternalLink, Sparkles } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { NewsPost } from "../../types";

interface NoticiaDetalheProps {
  noticia: NewsPost;
}

/** Remove scripts indesejados mantendo o HTML limpo */
function limparConteudo(texto?: string): string {
  return (texto || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on\w+\s*=\s*(["']).*?\1/gi, "");
}

export default function NoticiaDetalhe({ noticia }: NoticiaDetalheProps) {
  const { props } = usePage<any>();
  const item = (noticia as any)?.data ?? noticia;
  const [copiado, setCopiado] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://mresgatar.com.br/noticias/${item.slug || item.id}`;
  const titulo = item.title || item.titulo || "Notícia";
  const resumoText = item.resumo || item.summary || item.title || "";
  const imagem = item.image || item.imagem || "";

  const compartilharWhatsApp = () => {
    const text = `${titulo}\n\n${pageUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const compartilharFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <MainLayout>
      {/* Meta Tags Dinâmicas para Redes Sociais (WhatsApp, Facebook, Google) */}
      <Head>
        <title>{`${titulo} | Missão Resgatar`}</title>
        <meta name="description" content={resumoText} />
        <meta name="keywords" content={`notícias, ${item.category || 'Geral'}, Rede Máximo em Soluções, maximo.tec.br`} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={titulo} />
        <meta property="og:description" content={resumoText} />
        {imagem && <meta property="og:image" content={imagem} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Missão Resgatar" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titulo} />
        <meta name="twitter:description" content={resumoText} />
        {imagem && <meta name="twitter:image" content={imagem} />}
      </Head>

      <article className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6 font-mono"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para todas as notícias
          </Link>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-950 font-bold bg-amber-400 px-2.5 py-0.5 rounded">
              {item.category || "Geral"}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-300 text-xs font-mono font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> Notícia Verificada • Rede Máximo em Soluções (maximo.tec.br)
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight mb-4">
            {titulo}
          </h1>

          <div className="flex items-center justify-between gap-4 text-xs text-slate-400 mb-6 font-mono flex-wrap border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4 flex-wrap">
              {item.date && (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {typeof item.date === 'string' && item.date.includes('/') 
                    ? item.date 
                    : (!isNaN(new Date(item.date).getTime()) 
                        ? new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                        : item.date)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Fonte: Rede Máximo em Soluções (maximo.tec.br)
              </span>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={compartilharWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Compartilhar no WhatsApp"
              >
                <span>WhatsApp</span>
              </button>

              <button
                onClick={compartilharFacebook}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Compartilhar no Facebook"
              >
                <span>Facebook</span>
              </button>

              <button
                onClick={copiarLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiado ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>

          {imagem && (
            <img
              src={imagem}
              alt={titulo}
              className="w-full rounded-2xl border border-slate-800 mb-8 max-h-[450px] object-cover shadow-xl"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Body content with news-body formatting */}
          <div
            className="news-body text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 [&_a]:text-amber-400 [&_a]:underline [&_strong]:text-slate-100 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-amber-400 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-300 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400"
            dangerouslySetInnerHTML={{ __html: limparConteudo(item.content) }}
          />

          <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
            <Link href="/noticias" className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1">
              ← Ver todas as notícias
            </Link>

            <a
              href="https://maximo.tec.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-slate-500 hover:text-amber-400 flex items-center gap-1"
            >
              <span>Fonte: Rede Máximo em Soluções (maximo.tec.br)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
