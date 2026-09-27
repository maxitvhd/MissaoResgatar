import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, BookOpen, Calendar } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { Devotional } from "../../types";

interface DevocionalDetalheProps {
  devocional: Devotional;
}

function limparConteudo(texto?: string): string {
  return (texto || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+on\w+\s*=\s*(["']).*?\1/gi, "");
}

export default function DevocionalDetalhe({ devocional }: DevocionalDetalheProps) {
  const item = (devocional as any)?.data ?? devocional;

  return (
    <MainLayout>
      <article className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/devocionais"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para os devocionais
          </Link>

          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> {item.category}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight mb-4">
            {item.title}
          </h1>

          {item.date && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(item.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}

          {item.scripture && (
            <blockquote className="border-l-2 border-amber-500 bg-amber-500/5 rounded-r-xl p-5 mb-8">
              <p className="text-sm italic text-slate-300 leading-relaxed">{item.scripture}</p>
            </blockquote>
          )}

          <div
            className="text-slate-300 text-sm sm:text-base leading-loose space-y-4 [&_a]:text-amber-500 [&_a]:underline [&_strong]:text-slate-100 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-100 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: limparConteudo(item.content) }}
          />

          <div className="mt-10 pt-6 border-t border-slate-800">
            <Link href="/devocionais" className="text-xs text-amber-500 hover:underline">
              ← Todos os devocionais
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
