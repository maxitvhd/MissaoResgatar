import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, DownloadCloud, FileText, ArrowLeft, Bookmark, BookmarkCheck, Wifi, WifiOff } from "lucide-react";
import { fetchDevotionals } from "../lib/api";
import { Devotional } from "../types";
import { useTranslation } from "react-i18next";

export default function DevotionalsSection() {
  const { t } = useTranslation();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [selectedDev, setSelectedDev] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Offline State
  const [savedOfflineIds, setSavedOfflineIds] = useState<string[]>([]);
  const [viewOfflineOnly, setViewOfflineOnly] = useState<boolean>(false);

  useEffect(() => {
    // Load devotionals
    async function load() {
      setLoading(true);
      const data = await fetchDevotionals();
      setDevotionals(data);
      setLoading(false);
    }
    
    // Load local storage markers for offline saved devotionals
    const saved = localStorage.getItem("resgatar_offline_devs") || localStorage.getItem("marcha_offline_devs");
    if (saved) {
      try {
        setSavedOfflineIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  const toggleSaveOffline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (savedOfflineIds.includes(id)) {
      updated = savedOfflineIds.filter(x => x !== id);
    } else {
      updated = [...savedOfflineIds, id];
    }
    setSavedOfflineIds(updated);
    localStorage.setItem("resgatar_offline_devs", JSON.stringify(updated));
  };

  const isSaved = (id: string) => savedOfflineIds.includes(id);

  // Filter display list
  const filteredDevs = devotionals.filter(dev => {
    if (viewOfflineOnly) {
      return isSaved(dev.id);
    }
    return true;
  });

  return (
    <div className="py-16 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> {t("dev.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
            {t("dev.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            {t("dev.subtitle")}
          </p>
        </div>

        {/* Offline Mode Controller Bar */}
        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 rounded-3xl p-5 mb-10 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            {viewOfflineOnly ? (
              <WifiOff className="w-5 h-5 text-amber-500" />
            ) : (
              <Wifi className="w-5 h-5 text-emerald-500" />
            )}
            <div className="text-left">
              <span className="text-xs font-mono text-slate-400 uppercase block">{t("dev.offlineTitle")}</span>
              <p className="text-xs text-slate-300">
                {viewOfflineOnly 
                  ? t("dev.offlineOn")
                  : t("dev.offlineOff")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewOfflineOnly(!viewOfflineOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
              viewOfflineOnly
                ? "bg-amber-400 text-slate-900 border-amber-500 shadow"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-amber-400"
            }`}
          >
            {viewOfflineOnly ? t("dev.seeAll") : t("dev.seeSaved")}
          </button>
        </div>

        {/* Devotional Detail Expanded View */}
        {selectedDev ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn backdrop-blur-sm">
            
            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <button
                onClick={() => setSelectedDev(null)}
                className="flex items-center text-xs font-mono font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> {t("dev.back")}
              </button>

              <button
                onClick={(e) => toggleSaveOffline(selectedDev.id, e)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-amber-400 transition-colors"
              >
                {isSaved(selectedDev.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-500" />
                    <span>{t("dev.savedOffline")}</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>{t("dev.saveOffline")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Content Display */}
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
                  {selectedDev.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-2 leading-tight">
                  {selectedDev.title}
                </h3>
                
                {selectedDev.scripture && (
                  <div className="inline-block mt-3 px-3 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-xs font-mono font-bold text-amber-400/90 italic">
                    {t("dev.baseText")} {selectedDev.scripture}
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-slate-800 w-full my-6"></div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line text-justify font-sans">
                {selectedDev.content}
              </p>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mt-8 text-center text-xs text-slate-400 italic">
                {t("dev.quote")}
              </div>
            </div>

          </div>
        ) : (
          /* List View Grid */
          <div className="space-y-8">
            {filteredDevs.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/10 border border-slate-800/50 rounded-2xl">
                <p className="text-slate-400 text-sm">
                  {viewOfflineOnly ? t("dev.noSaved") : t("dev.loading")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDevs.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => setSelectedDev(dev)}
                    className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl shadow hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between cursor-pointer group backdrop-blur-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono uppercase text-slate-400 font-bold">
                          {dev.category}
                        </span>
                        
                        {/* Bookmark Icon */}
                        <button
                          onClick={(e) => toggleSaveOffline(dev.id, e)}
                          className="p-1.5 rounded-md hover:bg-slate-900/80 transition-colors"
                          title={isSaved(dev.id) ? t("dev.removeOffline") : t("dev.saveOfflineShort")}
                        >
                          {isSaved(dev.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-slate-500 hover:text-amber-400" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-base font-serif font-bold text-slate-200 mt-3 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {dev.title}
                      </h4>
                      
                      {dev.scripture && (
                        <span className="text-[10px] font-mono text-amber-500/80 italic mt-1 block">
                          {t("dev.scripture")} {dev.scripture}
                        </span>
                      )}

                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {dev.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>{t("dev.released", { date: dev.date })}</span>
                      <span className="text-amber-400 font-semibold group-hover:underline">{t("dev.read")}</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
