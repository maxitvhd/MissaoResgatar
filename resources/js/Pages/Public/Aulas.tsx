import React, { useState, useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import { 
  GraduationCap, Play, CheckCircle2, Download, FileText, 
  Clock, BookOpen, ChevronRight, Lock, Sparkles, Layers, Video
} from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { ClosedLesson } from "../../types";
import { getYoutubeEmbedUrl } from "../../Components/YoutubeSection";

interface AulasProps {
  aulas: ClosedLesson[];
}

export default function Aulas({ aulas = [] }: AulasProps) {
  const { auth } = usePage<any>().props;
  const currentUser = auth?.user;

  // Group lessons by module
  const modules = useMemo(() => {
    const groups: { [key: string]: ClosedLesson[] } = {};
    aulas.forEach((a) => {
      const mod = a.module || "Módulo Geral";
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(a);
    });
    return groups;
  }, [aulas]);

  const moduleNames = Object.keys(modules);
  const [activeLesson, setActiveLesson] = useState<ClosedLesson | null>(
    aulas.length > 0 ? aulas[0] : null
  );
  const [watchedIds, setWatchedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("resgatar_watched_lessons");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWatched = (id: string) => {
    const next = watchedIds.includes(id)
      ? watchedIds.filter((item) => item !== id)
      : [...watchedIds, id];
    setWatchedIds(next);
    localStorage.setItem("resgatar_watched_lessons", JSON.stringify(next));
  };

  const isVideoDirect = (url: string) => {
    return url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/storage/");
  };

  return (
    <MainLayout>
      <Head title="Aulas Fechadas - Área de Treinamento" />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Área Exclusiva de Membros</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
                Aulas Fechadas & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Capacitação</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
                Bem-vindo(a), <strong className="text-slate-200">{currentUser?.name}</strong>. Acesse os treinamentos, estudos bíblicos aprofundados e materiais para liderança e ministério.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shrink-0 text-center sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Progresso do Curso</span>
              <span className="text-2xl font-mono font-bold text-amber-400">
                {watchedIds.length} / {aulas.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">aulas concluídas</span>
            </div>
          </div>

          {aulas.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/20 border border-slate-800 rounded-3xl space-y-3">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">Nenhuma aula disponível no momento</h3>
              <p className="text-xs text-slate-500">Novas aulas e módulos estão sendo preparados para a sua capacitação.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Player & Lesson Details (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {activeLesson ? (
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-5 text-left">
                    
                    {/* Video Player */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
                      {isVideoDirect(activeLesson.videoUrl) ? (
                        <video
                          key={activeLesson.videoUrl}
                          src={activeLesson.videoUrl}
                          controls
                          playsInline
                          className="w-full h-full"
                        />
                      ) : (
                        <iframe
                          key={activeLesson.videoUrl}
                          src={getYoutubeEmbedUrl(activeLesson.videoUrl)}
                          title={activeLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      )}
                    </div>

                    {/* Lesson Meta & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-800/80 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {activeLesson.module}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                          {activeLesson.title}
                        </h2>
                        {activeLesson.duration && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{activeLesson.duration}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleWatched(activeLesson.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            watchedIds.includes(activeLesson.id)
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${watchedIds.includes(activeLesson.id) ? "fill-current" : ""}`} />
                          <span>{watchedIds.includes(activeLesson.id) ? "Concluída" : "Marcar como Concluída"}</span>
                        </button>

                        {activeLesson.materialUrl && (
                          <a
                            href={activeLesson.materialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
                          >
                            <Download className="w-4 h-4" />
                            <span>Material PDF</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {activeLesson.description && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">
                          Sobre esta aula:
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
                          {activeLesson.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modules & Lessons List (4 Cols) */}
              <div className="lg:col-span-4 space-y-4 text-left">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-500" />
                    Módulos & Conteúdos
                  </span>
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                  {moduleNames.map((modName) => {
                    const lessons = modules[modName];

                    return (
                      <div key={modName} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                        <h3 className="text-xs font-serif font-bold text-slate-200 border-b border-slate-800/80 pb-2 flex items-center justify-between">
                          <span>{modName}</span>
                          <span className="text-[10px] font-mono text-amber-500 font-normal">
                            {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
                          </span>
                        </h3>

                        <div className="space-y-2">
                          {lessons.map((lesson, idx) => {
                            const isCurrent = activeLesson?.id === lesson.id;
                            const isDone = watchedIds.includes(lesson.id);

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10"
                                    : "bg-slate-950/60 border-slate-850 hover:bg-slate-800/50 hover:border-slate-750"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                    isDone
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : isCurrent
                                      ? "bg-amber-500 text-slate-950 font-bold"
                                      : "bg-slate-850 text-slate-400"
                                  }`}>
                                    {isDone ? (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <Play className="w-3 h-3 fill-current ml-0.5" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="text-xs font-medium text-slate-200 truncate">
                                      {lesson.title}
                                    </h4>
                                    {lesson.duration && (
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {lesson.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
