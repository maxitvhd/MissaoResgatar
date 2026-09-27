import React, { useState, useEffect } from "react";
import { Sparkles, Image as ImageIcon, Eye, X, Sliders, Check, Download, Share2 } from "lucide-react";
import { fetchGallery } from "../lib/api";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

export default function PhotoGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  
  // Custom Live Filter state for the lightbox previewer
  const [activeFilter, setActiveFilter] = useState<string>("hd");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetchGallery().then(setImages).catch(console.error);
  }, []);

  const categories = ["Todos", "Marcha Itaquá", "Louvor & Adoração", "Público", "Bastidores"];

  const filteredImages = images.filter((img) => {
    return selectedCategory === "Todos" || img.category === selectedCategory;
  });

  const getFilterClass = () => {
    switch (activeFilter) {
      case "grayscale": return "grayscale brightness-95 contrast-105";
      case "warm": return "sepia-[0.25] saturate-125 hue-rotate-15 brightness-105";
      case "vintage": return "sepia saturate-90 brightness-95 contrast-95";
      case "cool": return "saturate-110 hue-rotate-[-15deg] brightness-105";
      default: return "contrast-105 brightness-100 saturate-100";
    }
  };

  const copyImageLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="py-16 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Registros Históricos
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
            Galeria Interativa HD
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Explore fotos em alta definição dos momentos mais marcantes de louvor, oração e comunhão na Marcha para Jesus Itaquaquecetuba. Use filtros customizados.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-400 text-slate-950 shadow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setLightboxImage(img)}
              className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-md hover:border-amber-500/30 transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-sm"
            >
              {/* Image banner */}
              <div className="relative h-56 bg-slate-900 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating eye overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-amber-400/90 text-slate-900 flex items-center justify-center shadow">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[9px] font-mono font-semibold text-slate-300 uppercase tracking-wide">
                    {img.category}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-200 line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {img.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {img.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox / HD Interactive Viewer Modal */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl animate-fadeIn relative ring-1 ring-slate-700">
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setLightboxImage(null);
                  setActiveFilter("hd");
                }}
                className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Interactive HD Image Display with dynamic CSS filter */}
              <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[250px] sm:min-h-[400px]">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className={`max-w-full max-h-[50vh] md:max-h-[80vh] object-contain transition-all duration-300 ${getFilterClass()}`}
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-slate-950/80 text-[10px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                  Visualização HD
                </div>
              </div>

              {/* Right Column: Information & Filter controls */}
              <div className="md:w-2/5 p-6 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
                      {lightboxImage.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-slate-200 mt-2">
                      {lightboxImage.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lightboxImage.description}
                  </p>

                  <div className="h-[1px] bg-slate-800 my-4"></div>

                  {/* CUSTOM FILTERS SELECTOR SECTION */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-300 text-xs font-mono uppercase mb-2">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Filtros Personalizados (HD)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "hd", name: "HD / Original" },
                        { id: "grayscale", name: "Preto & Branco" },
                        { id: "warm", name: "Brilho Quente" },
                        { id: "vintage", name: "Sépia Vintage" },
                        { id: "cool", name: "Tom Azulado" }
                      ].map((filt) => (
                        <button
                          key={filt.id}
                          onClick={() => setActiveFilter(filt.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium border text-left transition-colors flex items-center justify-between ${
                            activeFilter === filt.id
                              ? "bg-amber-400/10 border-amber-500 text-amber-400 font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span>{filt.name}</span>
                          {activeFilter === filt.id && <Check className="w-3 h-3 text-amber-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={() => copyImageLink(lightboxImage.url)}
                    className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold font-mono shadow transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "Link HD Copiado!" : "Copiar Link HD"}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/galeria/${lightboxImage.id}`);
                      setCopiedShare(true);
                      setTimeout(() => setCopiedShare(false), 2500);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    title={copiedShare ? "Link Copiado!" : "Compartilhar Imagem"}
                  >
                    {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
