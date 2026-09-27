import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Plus, Edit, Trash2, Video, FileText, Upload, 
  Layers, Clock, Check, X, Sparkles, ExternalLink, Play, Wand2, Loader2 
} from "lucide-react";
import { 
  fetchClosedLessons, createClosedLesson, updateClosedLesson, deleteClosedLesson, uploadFile,
  fetchYoutubeVideoInfo
} from "../../lib/api";
import { ClosedLesson } from "../../types";
import { getYoutubeEmbedUrl } from "../YoutubeSection";

interface AdminAulasTabProps {
  triggerSuccess: (msg: string) => void;
}

const PRESET_MODULES = [
  "Módulo 1 - Discipulado & Fundamentos",
  "Módulo 2 - Teologia Prática & Vida Cristã",
  "Módulo 3 - Liderança & Ministério Pastoral",
  "Módulo 4 - Evangelismo & Missões Urbanas",
  "Módulo 5 - Família & Casamento Cristão"
];

export default function AdminAulasTab({ triggerSuccess }: AdminAulasTabProps) {
  const [lessons, setLessons] = useState<ClosedLesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [module, setModule] = useState<string>(PRESET_MODULES[0]);
  const [customModule, setCustomModule] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [materialUrl, setMaterialUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [order, setOrder] = useState<number>(0);
  const [active, setActive] = useState<boolean>(true);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [fetchingMeta, setFetchingMeta] = useState<boolean>(false);

  const handleFetchYoutubeMeta = async (targetUrl?: string) => {
    const url = targetUrl || videoUrl;
    if (!url || !url.includes("youtu")) return;
    setFetchingMeta(true);
    try {
      const info = await fetchYoutubeVideoInfo(url);
      if (info && info.success) {
        if (info.title && !title) setTitle(info.title);
        if (info.description && !description) setDescription(info.description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingMeta(false);
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await fetchClosedLessons();
      setLessons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setVideoUrl("");
    setDuration("");
    setMaterialUrl("");
    setDescription("");
    setOrder(0);
    setActive(true);
    setCustomModule("");
  };

  const handleEditClick = (l: ClosedLesson) => {
    setEditingId(l.id);
    setTitle(l.title);
    setVideoUrl(l.videoUrl);
    setDuration(l.duration || "");
    setMaterialUrl(l.materialUrl || "");
    setDescription(l.description || "");
    setOrder(l.order || 0);
    setActive(Boolean(l.active));
    if (PRESET_MODULES.includes(l.module)) {
      setModule(l.module);
      setCustomModule("");
    } else {
      setModule("custom");
      setCustomModule(l.module);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir esta aula?")) {
      try {
        await deleteClosedLesson(id);
        setLessons((prev) => prev.filter((l) => l.id !== id));
        triggerSuccess("Aula excluída com sucesso!");
        if (editingId === id) resetForm();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    try {
      const url = await uploadFile(file);
      setMaterialUrl(url);
      triggerSuccess("Material PDF enviado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload do material.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !videoUrl) return;

    const finalModule = module === "custom" && customModule ? customModule : module;

    try {
      const payload: Partial<ClosedLesson> = {
        module: finalModule,
        title,
        videoUrl,
        duration,
        materialUrl,
        description,
        order,
        active,
      };

      if (editingId) {
        const updated = await updateClosedLesson(editingId, payload);
        setLessons((prev) => prev.map((l) => (l.id === editingId ? updated : l)));
        triggerSuccess("Aula atualizada com sucesso!");
      } else {
        const created = await createClosedLesson(payload);
        setLessons((prev) => [...prev, created]);
        triggerSuccess("Aula cadastrada com sucesso!");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar aula.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-serif font-bold text-slate-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>Gerenciar Aulas Fechadas (Área de Membros)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cadastre aulas em vídeo exclusivas para usuários autenticados, com controle de módulos e apostilas.
          </p>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 hover:bg-slate-750 cursor-pointer self-start"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lesson Form (5 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase text-amber-500 border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>{editingId ? "Editar Aula" : "Nova Aula / Treinamento"}</span>
          </h4>

          {/* Module selection */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Módulo do Treinamento</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
            >
              {PRESET_MODULES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="custom">+ Outro módulo personalizado...</option>
            </select>
            {module === "custom" && (
              <input
                type="text"
                required
                placeholder="Nome do novo módulo..."
                value={customModule}
                onChange={(e) => setCustomModule(e.target.value)}
                className="w-full mt-2 bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título da Aula *</label>
            <input
              type="text"
              required
              placeholder="Ex: Aula 01 - A Grande Comissão e o Chamado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">URL do Vídeo da Aula *</label>
              {videoUrl && videoUrl.includes("youtu") && (
                <button
                  type="button"
                  onClick={() => handleFetchYoutubeMeta()}
                  disabled={fetchingMeta}
                  className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 hover:text-amber-300"
                >
                  {fetchingMeta ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  <span>Puxar Dados do YouTube</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="Link do YouTube, Vimeo ou arquivo .mp4..."
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                if (e.target.value.includes("youtu") && !title) {
                  handleFetchYoutubeMeta(e.target.value);
                }
              }}
              onBlur={() => {
                if (videoUrl.includes("youtu") && !title && !fetchingMeta) {
                  handleFetchYoutubeMeta(videoUrl);
                }
              }}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Duration & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Duração (opcional)</label>
              <input
                type="text"
                placeholder="Ex: 35 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Ordem na Sequência</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Material URL / PDF Upload */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Material de Apoio (PDF / Apostila)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Link direto ou faça upload do PDF..."
                value={materialUrl}
                onChange={(e) => setMaterialUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                id="lesson-pdf-upload"
                className="hidden"
                onChange={handleMaterialUpload}
              />
              <label
                htmlFor="lesson-pdf-upload"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPdf ? "..." : "Upload"}</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Descrição / Objetivos da Aula</label>
            <textarea
              rows={3}
              placeholder="Descreva os tópicos abordados e orientações aos alunos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
            <input
              type="checkbox"
              id="lesson-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="lesson-active" className="text-xs text-slate-300 cursor-pointer">
              Aula Ativa e Visível para os Membros
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? "Salvar Alterações" : "Cadastrar Aula"}</span>
          </button>
        </form>

        {/* Lessons List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Aulas Cadastradas ({lessons.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs animate-pulse">Carregando aulas...</div>
          ) : lessons.length === 0 ? (
            <div className="p-10 text-center bg-slate-900/30 border border-slate-800 rounded-2xl space-y-2">
              <GraduationCap className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhuma aula cadastrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3.5 bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-amber-500 uppercase px-1.5 py-0.2 bg-amber-500/10 rounded">
                        {lesson.module}
                      </span>
                      {lesson.duration && (
                        <span className="text-[9px] font-mono text-slate-500">
                          {lesson.duration}
                        </span>
                      )}
                      {!lesson.active && (
                        <span className="text-[9px] font-mono text-red-400 font-bold uppercase">
                          Oculta
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 truncate mt-1">
                      {lesson.title}
                    </h4>

                    <span className="text-[9px] font-mono text-slate-500 truncate block mt-0.5">
                      {lesson.videoUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(lesson)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
