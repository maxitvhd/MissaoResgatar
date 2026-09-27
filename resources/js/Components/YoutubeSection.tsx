import React, { useState, useEffect } from "react";
import { Youtube, Play, Film, Sparkles, ExternalLink, Filter } from "lucide-react";
import { fetchYoutubeVideos } from "../lib/api";
import { VideoYoutube } from "../types";

export function getYoutubeEmbedUrl(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  // If already an embed URL
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }

  // Playlist
  if (trimmed.includes("list=")) {
    const listId = trimmed.split("list=")[1]?.split("&")[0];
    if (listId) {
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }
  }

  // Standard watch?v=
  if (trimmed.includes("watch?v=")) {
    const videoId = trimmed.split("watch?v=")[1]?.split("&")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Short youtu.be/
  if (trimmed.includes("youtu.be/")) {
    const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // Direct video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  return trimmed;
}

export function getYoutubeThumbnail(urlOrId: string): string {
  if (!urlOrId) return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80";
  const trimmed = urlOrId.trim();

  let videoId = "";
  if (trimmed.includes("watch?v=")) {
    videoId = trimmed.split("watch?v=")[1]?.split("&")[0] || "";
  } else if (trimmed.includes("youtu.be/")) {
    videoId = trimmed.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (trimmed.includes("youtube.com/embed/")) {
    videoId = trimmed.split("embed/")[1]?.split("?")[0] || "";
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    videoId = trimmed;
  }

  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80";
}

export default function YoutubeSection() {
  const [videos, setVideos] = useState<VideoYoutube[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoYoutube | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYoutubeVideos()
      .then((data) => {
        setVideos(data);
        if (data.length > 0) {
          const featured = data.find((v) => v.isFeatured) || data[0];
          setSelectedVideo(featured);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Todas", ...Array.from(new Set(videos.map((v) => v.category || "Geral")))];

  const filteredVideos = selectedCategory === "Todas"
    ? videos
    : videos.filter((v) => (v.category || "Geral") === selectedCategory);

  if (!loading && videos.length === 0) {
    return null; // Não exibe se não houver vídeos cadastrados
  }

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-900/60 relative overflow-hidden" id="secao-videos">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Youtube className="w-3.5 h-3.5" />
            <span>Vídeos & Mensagens Oficiais</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-100 tracking-tight">
            Transmissões & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Playlists</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 font-light">
            Acompanhe nossos cultos, pregações, momentos da Missão Resgatar e estudos em vídeo.
          </p>
        </div>

        {/* Categories Pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white font-bold shadow-lg shadow-red-600/30 border border-red-500"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Main Content: Player + Playlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Selected Video Player (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-slate-800">
                  <iframe
                    src={getYoutubeEmbedUrl(selectedVideo.urlOrId)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <div>
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      {selectedVideo.category || "Vídeo"}
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-100 mt-1">
                      {selectedVideo.title}
                    </h3>
                  </div>
                  {selectedVideo.urlOrId.startsWith("http") && (
                    <a
                      href={selectedVideo.urlOrId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-mono transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir no YouTube</span>
                    </a>
                  )}
                </div>
                {selectedVideo.description && (
                  <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-500 text-sm font-mono">
                Selecione um vídeo para assistir
              </div>
            )}
          </div>

          {/* Playlist / Videos list (4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-500" />
                Lista de Vídeos ({filteredVideos.length})
              </span>
            </div>

            {filteredVideos.map((video) => {
              const isCurrent = selectedVideo?.id === video.id;
              const thumb = getYoutubeThumbnail(video.urlOrId);

              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isCurrent
                      ? "bg-slate-800/80 border-red-500/60 shadow-lg shadow-red-500/10"
                      : "bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700"
                  }`}
                >
                  <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCurrent ? "bg-red-600 text-white" : "bg-black/60 text-slate-200"}`}>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-[9px] font-mono text-amber-500 uppercase">
                      {video.category || "Geral"}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 mt-0.5 leading-snug">
                      {video.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
