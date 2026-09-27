import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, MapPin, Clock, Calendar } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { AgendaEvent } from "../../types";

interface EventoDetalheProps {
  evento: AgendaEvent;
}

function formatarData(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarHora(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function EventoDetalhe({ evento }: EventoDetalheProps) {
  const item = (evento as any)?.data ?? evento;

  return (
    <MainLayout>
      <article className="py-12 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Voltar para a home
          </Link>

          <div className="text-xs font-mono uppercase tracking-wider text-amber-500 mb-3">
            Agenda
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 leading-tight mb-5">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-6">
            {item.dateTime && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {formatarData(item.dateTime)}
              </span>
            )}
            {item.dateTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {formatarHora(item.dateTime)}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {item.location}
              </span>
            )}
          </div>

          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="w-full rounded-2xl border border-slate-800 mb-8 max-h-96 object-cover"
            />
          )}

          {item.description && (
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          )}

          <div className="mt-10 pt-6 border-t border-slate-800">
            <Link href="/" className="text-xs text-amber-500 hover:underline">
              ← Voltar para a home
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
}
