import React, { useState, useEffect } from "react";
import {
  MapPin, Calendar, Clock, Star, Users, Phone, ArrowRight, ShieldCheck, Mail, FileText,
  Sparkles, CheckCircle2, ExternalLink, Instagram, Facebook, Youtube, ImageIcon, RefreshCw
} from "lucide-react";
import MainLayout from "../Layouts/MainLayout";
import PhotoGallery from "../Components/PhotoGallery";
import YoutubeSection from "../Components/YoutubeSection";
import LojaFeaturedSection from "../Components/LojaFeaturedSection";
import { createCaravan } from "../lib/api";
import { AgendaEvent, Attraction, Caravan, Regulation, SiteSettings, Sponsor } from "../types";
import { useTranslation } from "react-i18next";

interface HomeProps {
  noticias?: any[];
  devocionais?: any[];
  eventos: AgendaEvent[];
  atracoes: Attraction[];
  patrocinadores: Sponsor[];
  regulamentos: Regulation[];
  configuracoes: SiteSettings | null;
}

export default function Home(props: HomeProps) {
  const { t } = useTranslation();
  const eventos = (props.eventos as any)?.data ?? props.eventos ?? [];
  const atracoes = (props.atracoes as any)?.data ?? props.atracoes ?? [];
  const patrocinadores = (props.patrocinadores as any)?.data ?? props.patrocinadores ?? [];
  const regulamentos = (props.regulamentos as any)?.data ?? props.regulamentos ?? [];
  const configuracoes = (props.configuracoes as any)?.data ?? props.configuracoes ?? null;
  const [candidateEvents, setCandidateEvents] = useState<AgendaEvent[]>([]);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [activeEvent, setActiveEvent] = useState<AgendaEvent | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Caravan Registration Form State
  const [caravanForm, setCaravanForm] = useState({
    church: "",
    pastor: "",
    contactName: "",
    phone: "",
    peopleCount: "",
    city: "São Paulo"
  });
  const [caravanSuccess, setCaravanSuccess] = useState<boolean>(false);
  const [registeredCaravan, setRegisteredCaravan] = useState<Caravan | null>(null);
  const [isSubmittingCaravan, setIsSubmittingCaravan] = useState<boolean>(false);
  const [caravanError, setCaravanError] = useState<string>("");

  useEffect(() => {
    const now = Date.now();

    // Filtra os eventos futuros da agenda e ordena do mais próximo para o mais distante
    const upcoming = eventos
      .map((ev: any) => {
        const targetDateStr = ev.nextDateTime || ev.dateTime;
        const timeValue = targetDateStr ? new Date(targetDateStr).getTime() : 0;
        return {
          ...ev,
          targetDateStr,
          timeValue,
        };
      })
      .filter((ev: any) => ev.timeValue > now)
      .sort((a: any, b: any) => a.timeValue - b.timeValue);

    if (upcoming.length > 0) {
      setCandidateEvents(upcoming);
    } else {
      // Fallback dinâmico: se todos os eventos já passaram, conta para o próximo domingo às 19h (Culto de Celebração)
      const d = new Date();
      const day = d.getDay();
      const diffDays = (7 - day) % 7;
      d.setDate(d.getDate() + (diffDays === 0 && d.getHours() >= 21 ? 7 : diffDays));
      d.setHours(19, 0, 0, 0);

      const fallbackEvent: AgendaEvent = {
        id: "culto-semanal",
        title: "Culto de Celebração & Família",
        description: "Reunião de louvor e palavra no templo da Missão Resgatar.",
        location: "Templo Central Missão Resgatar",
        dateTime: d.toISOString(),
        nextDateTime: d.toISOString(),
        recurrence: "semanal",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      };

      setCandidateEvents([fallbackEvent]);
    }
  }, [eventos]);

  // Rotaciona automaticamente entre os eventos candidatos (ex: Culto Semanal x Evento Especial) a cada 8 segundos
  useEffect(() => {
    if (candidateEvents.length <= 1) return;
    const slideInterval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % candidateEvents.length);
    }, 8000);
    return () => clearInterval(slideInterval);
  }, [candidateEvents]);

  // Atualiza o contador regressivo em tempo real para o evento ativo
  useEffect(() => {
    if (candidateEvents.length === 0) return;
    const currentEv = candidateEvents[activeEventIndex] || candidateEvents[0];
    if (!currentEv) return;

    setActiveEvent(currentEv);

    const updateTimer = () => {
      const now = Date.now();
      const targetTime = currentEv.timeValue || new Date(currentEv.nextDateTime || currentEv.dateTime).getTime();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [candidateEvents, activeEventIndex]);

  const handleCaravanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaravanError("");
    if (!caravanForm.church || !caravanForm.contactName || !caravanForm.phone) {
      setCaravanError(t("home.caravanErrRequired"));
      return;
    }
    setIsSubmittingCaravan(true);
    try {
      const data = await createCaravan({
        church: caravanForm.church,
        pastor: caravanForm.pastor,
        contactName: caravanForm.contactName,
        phone: caravanForm.phone,
        peopleCount: Number(caravanForm.peopleCount) || 0,
        city: caravanForm.city
      });
      setRegisteredCaravan(data);
      setCaravanSuccess(true);
      setCaravanForm({
        church: "",
        pastor: "",
        contactName: "",
        phone: "",
        peopleCount: "",
        city: "São Paulo"
      });

    } catch (err) {
      console.error(err);
      setCaravanError(t("home.caravanErrGeneric"));
    } finally {
      setIsSubmittingCaravan(false);
    }
  };

  const settings = configuracoes as SiteSettings | null;

  const bgSize = (settings?.backgroundSize as any) || "cover";
  const bgPosition = settings?.backgroundPosition || "center";
  const bgOpacity = typeof settings?.backgroundOpacity === "number" ? settings.backgroundOpacity / 100 : 0.35;
  const bgScale = typeof settings?.backgroundScale === "number" ? settings.backgroundScale / 100 : 1.05;
  const bgDarkness = typeof settings?.backgroundDarkness === "number" ? settings.backgroundDarkness / 100 : 0.70;

  const backgroundMediaStyle: React.CSSProperties = {
    objectFit: bgSize,
    objectPosition: bgPosition,
    opacity: bgOpacity,
    transform: `scale(${bgScale})`,
    transformOrigin: bgPosition,
    transition: "all 0.5s ease",
  };

  const isSectionActive = (sectionKey: string): boolean => {
    if (!settings?.activeSections) return true;
    return settings.activeSections[sectionKey] !== false;
  };

  return (
    <MainLayout>
      {/* HERO LANDING SECTION WITH BACKGROUND VIDEO LOOP */}
      {isSectionActive("hero") && (
      <div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950">

        {/* Background Video or Image element */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {settings?.videoBackgroundUrl ? (
            <video
              key={settings.videoBackgroundUrl}
              autoPlay
              loop
              muted
              playsInline
              style={backgroundMediaStyle}
              className="w-full h-full"
              src={settings.videoBackgroundUrl}
            />
          ) : settings?.heroImageUrl ? (
            <img
              key={settings.heroImageUrl}
              style={backgroundMediaStyle}
              className="w-full h-full"
              src={settings.heroImageUrl}
              alt="Background Missão Resgatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              style={backgroundMediaStyle}
              className="w-full h-full"
              src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c025f73d485c20130d2e8d356fae40a1&profile_id=139&oauth2_token_id=57447761"
            />
          )}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50"
            style={{ opacity: bgDarkness }}
          ></div>
        </div>

        {/* Foreground Hero Content */}
        <div className="max-w-6xl mx-auto px-4 relative z-10 w-full text-center py-16 sm:py-24">

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-6 uppercase tracking-wider glow-accent">
            {activeEvent?.isFeatured ? (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            ) : activeEvent?.recurrence && activeEvent.recurrence !== 'nenhuma' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {activeEvent?.isFeatured ? "⭐ DESTAQUE ESPECIAL: " : activeEvent?.recurrence && activeEvent.recurrence !== 'nenhuma' ? "🗓 EVENTO RECORRENTE: " : "PRÓXIMO EVENTO: "}
              {activeEvent ? activeEvent.title.toUpperCase() : t("home.badge")}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-slate-100 tracking-tight leading-none uppercase">
            {t("home.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">{t("home.titleHighlight")}</span>
          </h1>

          <p className="mt-4 text-base sm:text-xl font-sans text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {t("home.subtitle")}
          </p>

          {/* COUNTDOWN COMPONENT */}
          <div className="flex flex-col items-center justify-center mt-10 w-full max-w-full px-2">
            <div className="flex justify-center items-center gap-1.5 sm:gap-4 flex-wrap max-w-full">
              {[
                { val: countdown.days, lbl: t("home.days") },
                { val: countdown.hours, lbl: t("home.hours") },
                { val: countdown.minutes, lbl: t("home.min") },
                { val: countdown.seconds, lbl: t("home.sec") }
              ].map((unit, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-2.5 py-2 sm:px-5 sm:py-3 text-center min-w-[62px] sm:min-w-[90px] shadow-lg">
                  <span className="text-lg sm:text-3xl font-mono font-bold text-amber-400 block">{String(unit.val).padStart(2, '0')}</span>
                  <span className="text-[9px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block mt-0.5 sm:mt-1">{unit.lbl}</span>
                </div>
              ))}
            </div>

            {activeEvent && (
              <div className="mt-4 max-w-full inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-sm truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">Contagem regressiva: <strong className="text-amber-400 font-semibold">{activeEvent.title}</strong></span>
              </div>
            )}

            {candidateEvents.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {candidateEvents.map((ev, idx) => (
                  <button
                    key={ev.id || idx}
                    onClick={() => setActiveEventIndex(idx)}
                    title={ev.title}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeEventIndex
                        ? "w-7 bg-amber-400"
                        : "w-2 bg-slate-700 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* QUICK INFOS WRAPPER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-14">

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                <MapPin className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Local do Evento</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 truncate">
                  {activeEvent?.location || t("home.qiConcentrationValue")}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {activeEvent?.title || t("home.qiConcentrationSub")}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Data do Evento</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 capitalize truncate">
                  {(activeEvent?.nextDateTime || activeEvent?.dateTime)
                    ? new Date(activeEvent.nextDateTime || activeEvent.dateTime!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : t("home.qiDateValue")}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono capitalize">
                  {(activeEvent?.nextDateTime || activeEvent?.dateTime)
                    ? new Date(activeEvent.nextDateTime || activeEvent.dateTime!).toLocaleDateString('pt-BR', { weekday: 'long' })
                    : t("home.qiDateSub")}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Horário de Início</span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">
                  {(activeEvent?.nextDateTime || activeEvent?.dateTime)
                    ? new Date(activeEvent.nextDateTime || activeEvent.dateTime!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + "h"
                    : t("home.qiTimeValue")}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">Horário Oficial de Brasília</p>
              </div>
            </div>

          </div>

        </div>
      </div>
      )}

      {/* AGENDA DE CULTOS E EVENTOS */}
      {isSectionActive("agenda") && (
      <section className="py-16 bg-slate-900/30 border-t border-slate-900/60 relative">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> {t("home.agendaBadge")}
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-200">{t("home.agendaTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.agendaDesc")}
            </p>
          </div>

          {!eventos || eventos.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <p className="text-sm text-slate-500">{t("home.agendaEmpty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {eventos.map((event: any) => (
                <div
                  key={event.id}
                  className="group bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-amber-500/20 transition-all duration-300 shadow-lg flex flex-col sm:flex-row"
                >
                  <div className="sm:w-1/3 relative h-48 sm:h-full bg-slate-950 overflow-hidden min-h-[160px]">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="sm:w-2/3 p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] font-mono">
                        <span className="flex items-center text-amber-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(event.nextDateTime || event.dateTime).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center text-amber-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(event.nextDateTime || event.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {event.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> Destaque
                          </span>
                        )}
                        {event.recurrence && event.recurrence !== 'nenhuma' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 uppercase">
                            <RefreshCw className="w-2.5 h-2.5" /> {event.recurrence}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{event.title}</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{event.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ARTISTS & ATTRACTIONS SHOWCASE */}
      {isSectionActive("atracoes") && (
      <section className="py-16 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase text-amber-500 tracking-widest block mb-1">{t("home.attBadge")}</span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-200">{t("home.attTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.attDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {atracoes && atracoes.map((art: any, idx: number) => (
              <div
                key={art.id ?? idx}
                className="group bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 shadow flex flex-col justify-between backdrop-blur-sm"
              >
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-amber-400 border border-slate-800">
                    {t("home.attTime")}: {art.time}h
                  </div>
                </div>

                <div className="p-5 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{art.name}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{art.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase text-slate-500">{t("home.attCity")}</span>
                    <span className="text-[10px] font-mono text-amber-500 font-semibold uppercase">{t("home.attShow")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* YOUTUBE VIDEOS & PLAYLISTS */}
      {isSectionActive("videos") && <YoutubeSection />}

      {/* INTERACTIVE ROUTE TRACKER AND COPEI STATS */}
      {isSectionActive("rota") && (
      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Text descriptions */}
            <div className="text-left space-y-6">
              <div>
                <span className="text-xs font-mono uppercase text-amber-500 tracking-widest block mb-1">{t("home.routeBadge")}</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-200">{t("home.routeTitle")}</h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("home.routeP1") }} />

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("home.routeP2") }} />

              <div className="space-y-3 pt-3">
                <div className="flex items-center space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-300" dangerouslySetInnerHTML={{ __html: t("home.routeItem1") }} />
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-300" dangerouslySetInnerHTML={{ __html: t("home.routeItem2") }} />
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-300" dangerouslySetInnerHTML={{ __html: t("home.routeItem3") }} />
                </div>
              </div>
            </div>

            {/* Route Visualizer Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-4">{t("home.routeSimTitle")}</span>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">

                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md shrink-0">1</div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-200">{t("home.routeStep1Title")}</h4>
                    <p className="text-[10px] text-slate-400">{t("home.routeStep1Desc")}</p>
                    <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">{t("home.routeStep1Time")}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-200">{t("home.routeStep2Title")}</h4>
                    <p className="text-[10px] text-slate-400">{t("home.routeStep2Desc")}</p>
                    <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">{t("home.routeStep2Time")}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md shrink-0">3</div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-200">{t("home.routeStep3Title")}</h4>
                    <p className="text-[10px] text-slate-400">{t("home.routeStep3Desc")}</p>
                    <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">{t("home.routeStep3Time")}</span>
                  </div>
                </div>

              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                  {t("home.routeGps")}
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>
      )}

      {/* LOJA ONLINE DESTAQUES */}
      {isSectionActive("loja") && <LojaFeaturedSection />}

      {/* FLOATING PHOTO GALLERY SNIPPET */}
      {isSectionActive("galeria") && <PhotoGallery />}

      {/* INSCRIÇÃO DE CARAVANAS */}
      {isSectionActive("caravanas") && (
      <section className="py-16 bg-gradient-to-b from-slate-950 to-[#0c101b] border-t border-slate-900/60 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 mr-1.5" /> {t("home.caravanBadge")}
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-200">{t("home.caravanTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.caravanDesc")}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
            {caravanSuccess ? (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-serif font-bold text-slate-100">{t("home.caravanSuccessTitle")}</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {t("home.caravanSuccessDesc")}
                  </p>
                </div>

                {registeredCaravan && (
                  <div className="max-w-md mx-auto bg-slate-950 border border-slate-850 rounded-2xl p-6 text-left space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full filter blur-2xl"></div>
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">{t("home.caravanReceipt")}</span>
                      <span className="text-[10px] font-mono text-slate-500">ID: {registeredCaravan.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanChurch")}</span>
                        <span className="font-bold text-slate-200">{registeredCaravan.church}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanPastor")}</span>
                        <span className="font-bold text-slate-200">{registeredCaravan.pastor || t("home.caravanNotInformed")}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanContact")}</span>
                        <span className="font-bold text-slate-200">{registeredCaravan.contactName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanPhone")}</span>
                        <span className="font-bold text-slate-200">{registeredCaravan.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanCity")}</span>
                        <span className="font-bold text-slate-200">{registeredCaravan.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase font-mono">{t("home.caravanPeople")}</span>
                        <span className="font-bold text-amber-400 text-sm">{registeredCaravan.peopleCount} {t("home.caravanPeopleSuffix")}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setCaravanSuccess(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {t("home.caravanAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCaravanSubmit} className="space-y-6 text-left">
                {caravanError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono">
                    {caravanError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldChurch")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("home.caravanFieldChurchPh")}
                      value={caravanForm.church}
                      onChange={(e) => setCaravanForm({ ...caravanForm, church: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldPastor")}</label>
                    <input
                      type="text"
                      placeholder={t("home.caravanFieldPastorPh")}
                      value={caravanForm.pastor}
                      onChange={(e) => setCaravanForm({ ...caravanForm, pastor: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldLeader")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("home.caravanFieldLeaderPh")}
                      value={caravanForm.contactName}
                      onChange={(e) => setCaravanForm({ ...caravanForm, contactName: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldPhone")}</label>
                    <input
                      type="tel"
                      required
                      placeholder={t("home.caravanFieldPhonePh")}
                      value={caravanForm.phone}
                      onChange={(e) => setCaravanForm({ ...caravanForm, phone: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldCount")}</label>
                    <input
                      type="number"
                      placeholder={t("home.caravanFieldCountPh")}
                      value={caravanForm.peopleCount}
                      onChange={(e) => setCaravanForm({ ...caravanForm, peopleCount: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">{t("home.caravanFieldCity")}</label>
                    <input
                      type="text"
                      placeholder={t("home.caravanFieldCityPh")}
                      value={caravanForm.city}
                      onChange={(e) => setCaravanForm({ ...caravanForm, city: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850 flex justify-between items-center flex-wrap gap-4">
                  <span className="text-[10px] text-slate-500 max-w-sm font-mono leading-relaxed">
                    {t("home.caravanDisclaimer")}
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingCaravan}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center shrink-0 disabled:opacity-50"
                  >
                    {isSubmittingCaravan ? t("home.caravanSubmitting") : t("home.caravanSubmit")}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      )}

      {/* DIRETRIZES E ESTATUTO */}
      {isSectionActive("regulamentos") && (
      <section className="py-16 bg-[#080b13] border-t border-slate-900/60">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {t("home.regBadge")}
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-200">{t("home.regTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.regDesc")}
            </p>
          </div>

          {!regulamentos || regulamentos.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <p className="text-sm text-slate-500">{t("home.regEmpty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {regulamentos.map((reg: any) => (
                <div
                  key={reg.id}
                  className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 hover:border-amber-500/20 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-mono text-amber-500 uppercase border border-slate-800">
                        {reg.category}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-serif font-bold text-slate-100 mt-2">{reg.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{reg.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{t("home.regCity")}</span>
                    <a
                      href={reg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] font-mono text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>{t("home.regAccess")}</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* SPONSORS / APOIADORES */}
      {isSectionActive("patrocinadores") && patrocinadores && patrocinadores.length > 0 && (
        <section className="py-12 bg-slate-950 border-t border-slate-900/60">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest block mb-6">{t("home.sponTitle")}</span>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {patrocinadores.map((spon: any) => (
                <a
                  key={spon.id}
                  href={spon.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center"
                  title={spon.name}
                >
                  <img
                    src={spon.imageUrl}
                    alt={spon.name}
                    className="h-10 sm:h-12 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[9px] font-mono text-slate-500 group-hover:text-amber-400 mt-2 transition-colors">{spon.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO IMPRENSA */}
      {isSectionActive("imprensa") && (
      <section className="py-16 bg-gradient-to-b from-[#0c101b] to-slate-950 border-t border-slate-900/60 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> {t("home.pressBadge")}
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-200">{t("home.pressTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.pressDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1: Assessoria de Imprensa */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                  <Mail className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-base font-serif font-bold text-slate-200">{t("home.pressAssessTitle")}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {t("home.pressAssessDesc")}
                </p>
                <p className="text-xs font-mono text-amber-400 mt-4 font-bold select-all">
                  {settings?.pressEmail || "imprensa@renascer.org.br"}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-850">
                <a
                  href={`mailto:${settings?.pressEmail || "imprensa@renascer.org.br"}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/25 hover:border-amber-400/40 rounded-xl text-xs font-bold text-amber-400 font-mono transition-all text-center"
                >
                  {t("home.pressClick")}
                </a>
              </div>
            </div>

            {/* Card 2: Divulgação/Material */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-base font-serif font-bold text-slate-200">{t("home.pressMaterialTitle")}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {t("home.pressMaterialDesc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-850">
                <a
                  href={settings?.pressMaterialLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-bold text-slate-950 font-mono transition-all text-center"
                >
                  {t("home.pressClick")}
                </a>
              </div>
            </div>

            {/* Card 3: Credenciamento Imprensa */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-base font-serif font-bold text-slate-200">{t("home.pressCredTitle")}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {t("home.pressCredDesc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-850">
                <a
                  href={settings?.pressCredLink || "https://forms.gle/credenciamento"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/25 hover:border-amber-400/40 rounded-xl text-xs font-bold text-amber-400 font-mono transition-all text-center"
                >
                  {t("home.pressClick")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </MainLayout>
  );
}
