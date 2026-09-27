import React, { useState, useEffect } from "react";
import { Download, Share2, Globe, Heart, Bell, CheckCircle, Sparkles, MessageSquare, Copy, Send } from "lucide-react";
import { fetchDailyVerse, translateText } from "../lib/api";
import { DailyVerse } from "../types";
import { useTranslation } from "react-i18next";

export default function BibleSection() {
  const { t } = useTranslation();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse>({
    verse: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
    reference: "Salmo 119:105",
    reflection: "A Palavra de Deus guia cada um de nossos passos diários com clareza eterna."
  });
  
  const [translatedVerse, setTranslatedVerse] = useState<string>("");
  const [translating, setTranslating] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<string>("pt");
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);
  
  // Shareable Prayer Card State
  const [prayerName, setPrayerName] = useState<string>("");
  const [prayerText, setPrayerText] = useState<string>("Senhor, guia meus passos nas ruas de Itaquaquecetuba, abençoa minha família e concede-me sabedoria diária.");
  const [cardBackground, setCardBackground] = useState<string>("bg-gradient-to-br from-slate-900 to-indigo-950");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadVerse() {
      const verse = await fetchDailyVerse();
      setDailyVerse(verse);
      setTranslatedVerse(verse.verse);
    }
    loadVerse();
  }, []);

  const handleTranslate = async (lang: string) => {
    if (lang === "pt") {
      setTranslatedVerse(dailyVerse.verse);
      setCurrentLang("pt");
      return;
    }
    setTranslating(true);
    setCurrentLang(lang);
    try {
      const translationInput = `${dailyVerse.verse} (${dailyVerse.reference})`;
      const result = await translateText(translationInput, lang);
      setTranslatedVerse(result);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const enablePushNotifications = () => {
    setNotificationsEnabled(true);
    setShowNotificationPopup(true);
    setTimeout(() => {
      setShowNotificationPopup(false);
    }, 4000);
  };

  const handleShareCard = () => {
    const textToCopy = t("bible.shareCardText", { name: prayerName || t("bible.anon"), prayer: prayerText });
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const sharePredefinedVerse = () => {
    const textToCopy = t("bible.shareVerseText", { verse: translatedVerse, reference: dailyVerse.reference, reflection: dailyVerse.reflection });
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="py-16 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px]"></div>
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px]"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Toast Notification for Simulated Push */}
        {showNotificationPopup && (
          <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-amber-500/30 text-amber-400 p-4 rounded-xl shadow-2xl flex items-center space-x-3 max-w-sm animate-bounce">
            <Bell className="w-6 h-6 text-amber-400 animate-swing" />
            <div>
              <p className="font-bold text-xs">{t("bible.notifTitle")}</p>
              <p className="text-[10px] text-slate-300">{t("bible.notifBody")}</p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {t("bible.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
            {t("bible.title")}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            {t("bible.subtitle")}
          </p>
          <p className="text-xs text-amber-500 font-mono mt-2">
            {t("bible.access")} <a href="https://holyhub.com.br/biblia" target="_blank" rel="noopener noreferrer" className="hover:underline">holyhub.com.br/biblia</a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interactive Mobile App Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-[540px] rounded-[40px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between p-4 ring-1 ring-slate-700">
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full mb-1"></div>
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center px-4 pt-1 text-[10px] font-mono text-slate-400">
                <span>09:41</span>
                <div className="flex items-center space-x-1.5">
                  <Bell className="w-3 h-3 text-amber-500" />
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Phone Content Interface */}
              <div className="flex-1 mt-6 flex flex-col justify-between">
                
                {/* Simulated Screen App Header */}
                <div className="text-center">
                  <span className="font-serif text-sm font-bold text-slate-200">{t("bible.appTitle")}</span>
                  <div className="h-[1px] bg-slate-800 w-full mt-2"></div>
                </div>

                {/* Simulated Daily Verse on Phone */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 my-3 text-left">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 block mb-1">{t("bible.verseOfDay")}</span>
                  <p className="text-[11px] text-slate-200 font-serif leading-relaxed italic line-clamp-4">
                    "{dailyVerse.verse}"
                  </p>
                  <span className="text-[10px] font-semibold text-slate-400 block text-right mt-1.5">- {dailyVerse.reference}</span>
                </div>

                {/* App Buttons list */}
                <div className="space-y-2 mb-2 text-left">
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{t("bible.bookmarks")}</span>
                    <span className="text-amber-500 font-mono text-[9px] uppercase">{t("bible.free")}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{t("bible.nightMode")}</span>
                    <span className="text-amber-500 font-mono text-[9px] uppercase">{t("bible.active")}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{t("bible.copeiStudies")}</span>
                    <span className="text-amber-500 font-mono text-[9px] uppercase">{t("bible.online")}</span>
                  </div>
                </div>

                {/* Phone Download Call to Action */}
                <div className="text-center pb-2">
                  <button 
                    onClick={enablePushNotifications}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold shadow hover:from-amber-500 hover:to-amber-600 transition-all cursor-pointer"
                  >
                    {t("bible.enablePush")}
                  </button>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1.5">{t("bible.availIOS")}</span>
                </div>

              </div>

              {/* Bottom Home Indicator */}
              <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>
          </div>

          {/* Right Column: Dynamic Verse & Shareable Prayer Maker */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Box 1: AI-Powered Dynamic Translation Daily Verse */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-serif font-bold text-slate-200">{t("bible.altarTitle")}</h3>
                </div>
                
                {/* Translator Buttons */}
                <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  {[
                    { code: "pt", label: "PT" },
                    { code: "en", label: "EN" },
                    { code: "es", label: "ES" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleTranslate(lang.code)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                        currentLang === lang.code
                          ? "bg-amber-400 text-slate-950 shadow"
                          : "text-slate-400 hover:text-amber-400"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verse Display */}
              <div className="space-y-4">
                <div className="min-h-[80px] flex items-center justify-center">
                  {translating ? (
                    <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>{t("bible.translating")}</span>
                    </div>
                  ) : (
                    <blockquote className="text-base sm:text-lg font-serif italic text-slate-200 text-center leading-relaxed">
                      "{translatedVerse}"
                    </blockquote>
                  )}
                </div>

                <div className="text-center">
                  <cite className="text-xs font-mono font-semibold text-amber-500 block">
                    - {dailyVerse.reference}
                  </cite>
                  <p className="text-xs text-slate-400 mt-2 italic max-w-md mx-auto">
                    "{dailyVerse.reflection}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  onClick={enablePushNotifications}
                  className="flex items-center text-xs font-mono font-semibold text-amber-400/90 hover:text-amber-400"
                >
                  <Bell className="w-4 h-4 mr-1.5 animate-pulse" />
                  {notificationsEnabled ? t("bible.notifOn") : t("bible.receive")}
                </button>

                <button
                  onClick={sharePredefinedVerse}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-amber-400 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  <span>{t("bible.shareVerse")}</span>
                </button>
              </div>
            </div>

            {/* Box 2: Shareable Prayer Maker */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-serif font-bold text-slate-200">{t("bible.prayerTitle")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Inputs controls */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">{t("bible.yourName")}</label>
                    <input
                      type="text"
                      placeholder={t("bible.anon")}
                      value={prayerName}
                      onChange={(e) => setPrayerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">{t("bible.prayerLabel")}</label>
                    <textarea
                      rows={3}
                      value={prayerText}
                      onChange={(e) => setPrayerText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none resize-none"
                    />
                  </div>

                  {/* BG theme picker */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">{t("bible.styleLabel")}</span>
                    <div className="flex space-x-2">
                      {[
                        { bg: "bg-gradient-to-br from-slate-900 to-indigo-950", label: t("bible.styleEvening") },
                        { bg: "bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950", label: t("bible.styleAltar") },
                        { bg: "bg-gradient-to-br from-[#111827] to-[#1f2937]", label: t("bible.styleSober") }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCardBackground(item.bg)}
                          className={`px-3 py-1 rounded text-[10px] font-mono border text-xs transition-colors ${
                            cardBackground === item.bg
                              ? "border-amber-500 text-amber-400 bg-slate-900"
                              : "border-slate-800 text-slate-400 bg-slate-950 hover:text-slate-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Card Preview */}
                <div className="flex flex-col justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">{t("bible.preview")}</span>
                  <div className={`p-4 rounded-xl border border-slate-800 text-center flex flex-col justify-between min-h-[140px] flex-1 shadow-inner ${cardBackground}`}>
                    <div>
                      <span className="text-[9px] font-mono text-amber-400/80 uppercase block tracking-wider">{t("bible.prayerCard")}</span>
                      <p className="text-xs text-slate-200 italic mt-2 leading-relaxed">
                        {prayerText || t("bible.prayerPlaceholder")}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/50">
                      <span className="text-[10px] font-mono font-medium text-slate-300">
                        {t("bible.by")} {prayerName || t("bible.prayingHeart")}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{t("bible.itaqua2026")}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleShareCard}
                    id="btn-share-prayer"
                    className="w-full mt-4 flex items-center justify-center py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow transition-all duration-200 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    {copied ? t("bible.copiedClipboard") : t("bible.sharePrayerCard")}
                  </button>
                </div>

              </div>

            </div>

            {/* Direct App Store Download Links */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-200">{t("bible.downloadTitle")}</h4>
                <p className="text-xs text-slate-500 mt-1">{t("bible.downloadSubtitle")}</p>
              </div>
              <div className="flex space-x-3">
                <a 
                  href="https://holyhub.com.br/biblia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-slate-300">{t("bible.webAppStore")}</span>
                </a>
                <a 
                  href="https://play.google.com/store/search?q=holyhub&c=apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400/40 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-slate-300">{t("bible.googlePlay")}</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
