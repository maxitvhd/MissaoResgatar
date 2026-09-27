import React, { useState, useEffect } from "react";
import { 
  Youtube, Plus, Edit, Trash2, ExternalLink, Play, Film, 
  Sparkles, X, Check, Wand2, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";
import { 
  fetchYoutubeVideos, createYoutubeVideo, updateYoutubeVideo, 
  deleteYoutubeVideo, fetchYoutubeVideoInfo 
} from "../../lib/api";
import { VideoYoutube } from "../../types";
import { getYoutubeEmbedUrl, getYoutubeThumbnail } from "../YoutubeSection";

interface AdminVideosTabProps {
  triggerSuccess?: (msg: string) => void;
}

export default function AdminVideosTab({ triggerSuccess }: AdminVideosTabProps) {
  const [videos, setVideos] = useState<VideoYoutube[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState<string>("");
  const [urlOrId, setUrlOrId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Cultos");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [order, setOrder] = useState<number>(0);

  // Estados do autocompletar do YouTube
  const [fetchingMeta, setFetchingMeta] = useState<boolean>(false);
  const [metaSuccess, setMetaSuccess] = useState<boolean>(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    if (triggerSuccess) {
      triggerSuccess(msg);
    } else {
      console.log(msg);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await fetchYoutubeVideos();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setUrlOrId("");
    setDescription("");
    setCategory("Cultos");
    setIsFeatured(false);
    setOrder(0);
    setMetaSuccess(false);
    setMetaError(null);
    setChannelName(null);
    setThumbnailPreview(null);
  };

  const handleEditClick = (v: VideoYoutube) => {
    setEditingId(v.id);
    setTitle(v.title);
    setUrlOrId(v.urlOrId);
    setDescription(v.description || "");
    setCategory(v.category || "Cultos");
    setIsFeatured(Boolean(v.isFeatured));
    setOrder(v.order || 0);
    setMetaSuccess(false);
    setMetaError(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir este vídeo?")) {
      try {
        await deleteYoutubeVideo(id);
        setVideos((prev) => prev.filter((v) => v.id !== id));
        notifySuccess("Vídeo removido com sucesso!");
        if (editingId === id) resetForm();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Puxa metadados do YouTube (Título, Descrição, Thumbnail) e autocompleta os campos
  const handleFetchMetadata = async (targetUrl?: string) => {
    const urlToUse = targetUrl || urlOrId;
    if (!urlToUse || urlToUse.trim().length < 4) {
      setMetaError("Insira um link ou ID válido do YouTube antes de puxar os dados.");
      setTimeout(() => setMetaError(null), 4000);
      return;
    }

    setFetchingMeta(true);
    setMetaError(null);
    setMetaSuccess(false);

    try {
      const info = await fetchYoutubeVideoInfo(urlToUse.trim());
      if (info && info.success) {
        if (info.title) {
          setTitle(info.title);
        }
        if (info.description) {
          setDescription(info.description);
        }
        if (info.author) {
          setChannelName(info.author);
        }
        if (info.thumbnail) {
          setThumbnailPreview(info.thumbnail);
        }
        setMetaSuccess(true);
        setTimeout(() => setMetaSuccess(false), 5000);
      } else {
        setMetaError("Não foi possível identificar dados para este link. Verifique a URL do YouTube.");
        setTimeout(() => setMetaError(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setMetaError("Falha na consulta ao YouTube.");
      setTimeout(() => setMetaError(null), 5000);
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !urlOrId) return;

    try {
      if (editingId) {
        const updated = await updateYoutubeVideo(editingId, {
          title,
          urlOrId,
          description,
          category,
          isFeatured,
          order,
        });
        setVideos((prev) => prev.map((v) => (v.id === editingId ? updated : v)));
        notifySuccess("Vídeo atualizado com sucesso!");
      } else {
        const created = await createYoutubeVideo({
          title,
          urlOrId,
          description,
          category,
          isFeatured,
          order,
        });
        setVideos((prev) => [created, ...prev]);
        notifySuccess("Vídeo adicionado com sucesso!");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar vídeo.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-serif font-bold text-slate-200 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>Gerenciar Vídeos & Playlists do YouTube</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cadastre transmissões ao vivo, pregações, estudos e playlists oficiais da Missão Resgatar com autocompletar inteligente de dados.
          </p>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>{editingId ? "Editar Vídeo" : "Adicionar Novo Vídeo"}</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Autocompletar Ativo
            </span>
          </div>

          {/* 1. URL or ID do YouTube com Botão de Autocompletar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-slate-300 uppercase font-semibold flex items-center gap-1">
                <Youtube className="w-3 h-3 text-red-500" />
                <span>Link ou ID do YouTube *</span>
              </label>

              <button
                type="button"
                onClick={() => handleFetchMetadata()}
                disabled={fetchingMeta || !urlOrId.trim()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Puxar título e descrição oficiais do YouTube"
              >
                {fetchingMeta ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Puxando dados...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-amber-400" />
                    <span>Puxar Dados do Vídeo</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder="Cole o link (https://www.youtube.com/watch?v=... ou youtu.be/...)"
                value={urlOrId}
                onChange={(e) => {
                  setUrlOrId(e.target.value);
                  // Se o usuário colou uma URL completa do YouTube e o título estiver vazio, busca automaticamente
                  if (e.target.value.includes("youtu") && !title) {
                    handleFetchMetadata(e.target.value);
                  }
                }}
                onBlur={() => {
                  if (urlOrId.trim() && !title && !fetchingMeta) {
                    handleFetchMetadata(urlOrId);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono pr-8"
              />
              {fetchingMeta && (
                <div className="absolute right-2.5 top-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500">
              <span>Aceita links normais, curtos (youtu.be), lives ou shorts.</span>
              <span className="text-amber-500/80">Ao colar, os dados são puxados automaticamente</span>
            </div>

            {/* Banner de Feedback de Autocompletar */}
            {metaSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Título e descrição preenchidos com os dados oficiais do YouTube!</span>
              </div>
            )}

            {metaError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{metaError}</span>
              </div>
            )}
          </div>

          {/* 2. Título do Vídeo (Autocompletado) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">Título do Vídeo *</label>
              {channelName && (
                <span className="text-[9px] font-mono text-slate-500">Canal: {channelName}</span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="Ex: Culto de Celebração & Santa Ceia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          {/* 3. Categoria & Ordem */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              >
                <option value="Cultos">Cultos</option>
                <option value="Pregações">Pregações</option>
                <option value="Missão Resgatar">Missão Resgatar</option>
                <option value="Louvor & Música">Louvor & Música</option>
                <option value="Estudos Bíblicos">Estudos Bíblicos</option>
                <option value="Playlists">Playlists</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Ordem de Exibição</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* 4. Destaque Checkbox */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 border border-slate-850 rounded-lg">
            <input
              type="checkbox"
              id="video-featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="video-featured" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Vídeo em Destaque Principal</span>
            </label>
          </div>

          {/* 5. Descrição (Autocompletada) */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Descrição / Detalhes</label>
            <textarea
              rows={4}
              placeholder="Breve resumo da mensagem ou evento transmitido (puxado automaticamente do YouTube)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
            />
          </div>

          {/* Live Preview If URL */}
          {urlOrId && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Pré-visualização do Embed:</span>
              <div className="aspect-video rounded-lg overflow-hidden bg-black border border-slate-800">
                <iframe
                  src={getYoutubeEmbedUrl(urlOrId)}
                  title="Preview"
                  className="w-full h-full pointer-events-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-mono font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
          >
            {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editingId ? "Salvar Alterações" : "Adicionar à Galeria de Vídeos"}</span>
          </button>
        </form>

        {/* Video List Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Vídeos Cadastrados ({videos.length})
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              Carregando catálogo de transmissões...
            </div>
          ) : videos.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/20 border border-slate-800/60 rounded-xl text-slate-500 text-xs">
              Nenhum vídeo cadastrado ainda. Cole um link do YouTube ao lado para começar!
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row gap-3 items-start justify-between transition-all"
                >
                  <div className="flex gap-3 items-start w-full sm:w-auto">
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800">
                      <img
                        src={getYoutubeThumbnail(vid.urlOrId)}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>

                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {vid.category || "Geral"}
                        </span>
                        {vid.isFeatured && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            ★ Destaque
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-500">
                          Ordem: {vid.order}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-200 line-clamp-1">
                        {vid.title}
                      </h5>

                      {vid.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEditClick(vid)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vid.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
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
