import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ShieldCheck, ExternalLink } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { Regulation } from "../../types";

interface RegulamentoDetalheProps {
  regulamento: Regulation;
}

function limparConteudo(texto?: string): string {
  return (texto || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on\w+\s*=\s*(["']).*?\1/gi, "");
}

export default function RegulamentoDetalhe({ regulamento }: RegulamentoDetalheProps) {
  const item = (regulamento as any)?.data ?? regulamento;

  return (
    <MainLayout>
      <article className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/regulamentos"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para os regulamentos
          </Link>

          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {item.category}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight mb-6">
            {item.title}
          </h1>

          <div
            className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 [&_a]:text-amber-500 [&_a]:underline [&_strong]:text-slate-100 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-100 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: limparConteudo(item.description) }}
          />

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-8 text-xs text-amber-500 hover:underline"
            >
              Abrir documento completo <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="mt-10 pt-6 border-t border-slate-800">
            <Link href="/regulamentos" className="text-xs text-amber-500 hover:underline">
              ← Todos os regulamentos
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
