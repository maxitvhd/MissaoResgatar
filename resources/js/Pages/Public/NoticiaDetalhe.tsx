import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronLeft, Calendar, User, Share2 } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { NewsPost } from "../../types";

interface NoticiaDetalheProps {
  noticia: NewsPost;
}

/** Remove as tags do conteudo vindo do admin, mantendo o texto limpo para o leitor */
function limparConteudo(texto?: string): string {
  return (texto || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on\w+\s*=\s*(["']).*?\1/gi, "");
}

export default function NoticiaDetalhe({ noticia }: NoticiaDetalheProps) {
  const { props } = usePage<any>();
  const item = (noticia as any)?.data ?? noticia;

  const compartilhar = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <MainLayout>
      <article className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para as notícias
          </Link>

          <div className="text-xs font-mono uppercase tracking-wider text-amber-500 mb-3">
            {item.category}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight mb-4">
            {item.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 font-mono flex-wrap">
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
            {item.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {item.author}
              </span>
            )}
            <button
              onClick={compartilhar}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Compartilhar
            </button>
          </div>

          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full rounded-2xl border border-slate-800 mb-8 max-h-[450px] object-cover shadow-xl"
            />
          )}

          <div
            className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 [&_a]:text-amber-400 [&_a]:underline [&_strong]:text-slate-100 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-slate-100 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-amber-400 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-300 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_.card]:bg-slate-900/60 [&_.card]:border [&_.card]:border-slate-800 [&_.card]:p-4 [&_.card]:rounded-2xl [&_.card]:my-6 [&_.badge]:inline-block [&_.badge]:px-2 [&_.badge]:py-1 [&_.badge]:rounded [&_.badge]:text-xs [&_.badge]:font-mono"
            dangerouslySetInnerHTML={{ __html: limparConteudo(item.content) }}
          />

          <div className="mt-10 pt-6 border-t border-slate-800">
            <Link href="/noticias" className="text-xs text-amber-500 hover:underline">
              ← Todas as notícias
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
