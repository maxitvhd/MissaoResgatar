import React, { useState, useEffect } from "react";
import { 
  MapPin, Calendar, Clock, Star, Users, Phone, ArrowRight, ShieldCheck, Mail, Globe, FileText, 
  Sparkles, Shield, Compass, ChevronRight, Play, ExternalLink, Headphones, Info, CheckCircle2,
  Instagram, Facebook, Youtube, ImageIcon
} from "lucide-react";
import Navbar from "./components/Navbar";
import LiveRadio from "./components/LiveRadio";
import BibleSection from "./components/BibleSection";
import NewsSection from "./components/NewsSection";
import DevotionalsSection from "./components/DevotionalsSection";
import PersonalNotes from "./components/PersonalNotes";
import PhotoGallery from "./components/PhotoGallery";
import AdminDashboard from "./components/AdminDashboard";
import { User, AgendaEvent, Regulation, Caravan, Sponsor, SiteSettings, Attraction } from "./types";
import { loginUser, fetchEvents, fetchRegulations, fetchSponsors, createCaravan, fetchSettings, fetchAttractions } from "./lib/api";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);

  // Localization
  const [currentLanguage, setCurrentLanguage] = useState<string>("pt");

  // Real-time Event Countdown (Days, Hours, Min, Sec)
  const [countdown, setCountdown] = useState({ days: 120, hours: 14, minutes: 30, seconds: 45 });

  // Dynamic Sections State
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  // Caravan Registration Form State
  const [caravanForm, setCaravanForm] = useState({
    church: "",
    pastor: "",
    contactName: "",
    phone: "",
    peopleCount: "",
    city: "Itaquaquecetuba"
  });
  const [caravanSuccess, setCaravanSuccess] = useState<boolean>(false);
  const [registeredCaravan, setRegisteredCaravan] = useState<Caravan | null>(null);
  const [isSubmittingCaravan, setIsSubmittingCaravan] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem("marcha_user_session");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch dynamic sections
    fetchEvents().then(setEvents).catch(console.error);
    fetchRegulations().then(setRegulations).catch(console.error);
    fetchSponsors().then(setSponsors).catch(console.error);
    fetchAttractions().then(setAttractions).catch(console.error);
    fetchSettings().then(setSettings).catch(console.error);

    // Countdown interval
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [caravanError, setCaravanError] = useState<string>("");

  const handleCaravanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaravanError("");
    if (!caravanForm.church || !caravanForm.contactName || !caravanForm.phone) {
      setCaravanError("Por favor, preencha todos os campos obrigatórios (Igreja, Responsável e Telefone).");
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
        city: "Itaquaquecetuba"
      });
    } catch (err) {
      console.error(err);
      setCaravanError("Ocorreu um erro ao enviar sua inscrição. Tente novamente.");
    } finally {
      setIsSubmittingCaravan(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setLoadingLogin(true);
    try {
      const user = await loginUser(loginEmail);
      setCurrentUser(user);
      localStorage.setItem("marcha_user_session", JSON.stringify(user));
      setShowLoginModal(false);
      setLoginEmail("");
      
      // Auto redirect to appropriate tabs
      if (user.role === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("anotacoes");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("marcha_user_session");
    setActiveTab("home");
  };

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-900">
      
      {/* Dynamic Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        currentLanguage={currentLanguage}
        onChangeLanguage={changeLanguage}
      />

      {/* Main Sections Switcher */}
      <main className="flex-grow">
        
        {/* TAB 1: HOME/LANDING PAGE */}
        {activeTab === "home" && (
          <div className="fade-in">
            
            {/* HERO LANDING SECTION WITH BACKGROUND VIDEO LOOP */}
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
                    className="w-full h-full object-cover opacity-35 scale-105"
                    src={settings.videoBackgroundUrl}
                  />
                ) : settings?.heroImageUrl ? (
                  <img 
                    key={settings.heroImageUrl}
                    className="w-full h-full object-cover opacity-30 scale-105"
                    src={settings.heroImageUrl}
                    alt="Background Marcha"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-35 scale-105"
                    src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c025f73d485c20130d2e8d356fae40a1&profile_id=139&oauth2_token_id=57447761"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50"></div>
              </div>

              {/* Foreground Hero Content */}
              <div className="max-w-6xl mx-auto px-4 relative z-10 w-full text-center py-16 sm:py-24">
                
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-6 uppercase tracking-wider glow-accent">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>Itaquaquecetuba 2026</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-slate-100 tracking-tight leading-none uppercase">
                  Marcha para <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Jesus</span>
                </h1>
                
                <p className="mt-4 text-base sm:text-xl font-sans text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                  "Pela Família e pela Vida" — O maior ato de louvor, oração e autoridade espiritual unindo as ruas de Itaquaquecetuba.
                </p>

                {/* COUNTDOWN COMPONENT */}
                <div className="flex justify-center items-center gap-2 sm:gap-4 mt-10">
                  {[
                    { val: countdown.days, lbl: "Dias" },
                    { val: countdown.hours, lbl: "Horas" },
                    { val: countdown.minutes, lbl: "Min" },
                    { val: countdown.seconds, lbl: "Seg" }
                  ].map((unit, idx) => (
                    <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-2 sm:px-5 sm:py-3 text-center min-w-[70px] sm:min-w-[90px] shadow-lg">
                      <span className="text-xl sm:text-3xl font-mono font-bold text-amber-400 block">{String(unit.val).padStart(2, '0')}</span>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block mt-1">{unit.lbl}</span>
                    </div>
                  ))}
                </div>

                {/* QUICK INFOS WRAPPER */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-14">
                  
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <MapPin className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Concentração</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">Praça Padre João Álvares</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Centro - Itaquá</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Calendar className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Data do Evento</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">Sábado Especial</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Contagem Regressiva Ativa</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Horário Inicial</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5">A partir das 14:00h</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Abertura COPEI</p>
                    </div>
                  </div>

                </div>



              </div>
            </div>

            {/* AGENDA DOS EVENTOS PRÓ MARCHA */}
            <section className="py-16 bg-slate-900/30 border-t border-slate-900/60 relative">
              <div className="max-w-6xl mx-auto px-4">
                
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Preparativos
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-200">Agenda dos Eventos Pró Marcha</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                    Participe dos encontros de oração, carreatas e vigílias que antecedem o grande dia em Itaquaquecetuba.
                  </p>
                </div>

                {events.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                    <p className="text-sm text-slate-500">Nenhum evento agendado no momento. Fique atento às atualizações!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {events.map((event) => (
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
                            <div className="flex flex-wrap items-center gap-3 mb-2 text-[11px] font-mono text-amber-400">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(event.dateTime).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(event.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
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

            {/* ARTISTS & ATTRACTIONS SHOWCASE (THE CANVA SPECIFICATIONS) */}
            <section className="py-16 bg-slate-950 border-t border-slate-900/60">
              <div className="max-w-6xl mx-auto px-4">
                
                <div className="text-center mb-12">
                  <span className="text-xs font-mono uppercase text-amber-500 tracking-widest block mb-1">Palco Principal</span>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-slate-200">Atrações Confirmadas</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                    Os maiores cantores e ministérios gospel do Brasil estarão reunidos no Parque Ecológico de Itaquaquecetuba para ministrar louvor e adoração profética.
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {attractions.map((art, idx) => (
                    <div 
                      key={idx}
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
                          Previsão: {art.time}h
                        </div>
                      </div>

                      <div className="p-5 text-left flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-base font-serif font-bold text-slate-100 group-hover:text-amber-400 transition-colors">{art.name}</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{art.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] font-mono uppercase text-slate-500">Itaquaquecetuba 2026</span>
                          <span className="text-[10px] font-mono text-amber-500 font-semibold uppercase">Show Ao Vivo</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* INTERACTIVE ROUTE TRACKER AND COPEI STATS */}
            <section className="py-16 bg-slate-950">
              <div className="max-w-5xl mx-auto px-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  
                  {/* Text descriptions */}
                  <div className="text-left space-y-6">
                    <div>
                      <span className="text-xs font-mono uppercase text-amber-500 tracking-widest block mb-1">O Caminho Sagrado</span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-200">Percurso da Marcha</h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      A concentração dos fiéis iniciará na clássica <strong>Praça Padre João Álvares (Itaquá Centro)</strong>, local histórico onde orações e proclamações serão entoadas. 
                    </p>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Os trios elétricos conduzirão a caminhada pela Avenida Emancipação em direção ao <strong>Parque Ecológico de Itaquaquecetuba</strong>. No Parque, a megaestrutura do Palco Principal estará aguardando o público para os shows e intercessões proféticas.
                    </p>

                    {/* Path steps indicators */}
                    <div className="space-y-3 pt-3">
                      <div className="flex items-center space-x-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-300"><strong>Concentração:</strong> Praça Padre João Álvares (14:00h)</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-300"><strong>Trajeto:</strong> Av. Emancipação com louvores nos Trios</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-300"><strong>Palco Final:</strong> Parque Ecológico de Itaquaquecetuba</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Visualizer Card */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-4">Simulador de Percurso GPS</span>
                    
                    <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                      
                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md shrink-0">1</div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-200">Início - Concentração</h4>
                          <p className="text-[10px] text-slate-400">Praça Padre João Álvares (Centro de Itaquá)</p>
                          <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">14:00h às 15:30h</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-200">Percurso Trios Elétricos</h4>
                          <p className="text-[10px] text-slate-400">Trajeto pela Av. Emancipação com louvor e intercessão</p>
                          <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">Previsão: 1.8 km de caminhada</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-md shrink-0">3</div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-200">Palco e Shows Principais</h4>
                          <p className="text-[10px] text-slate-400">Megaestrutura no Parque Ecológico de Itaquaquecetuba</p>
                          <span className="text-[9px] font-mono text-amber-500 uppercase mt-0.5 block">A partir das 16:30h</span>
                        </div>
                      </div>

                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                        Dispositivo Conectado ao GPS da Marcha
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* FLOATING PHOTO GALLERY SNIPPET */}
            <PhotoGallery />

            {/* INSCRIÇÃO DE CARAVANAS */}
            <section className="py-16 bg-gradient-to-b from-slate-950 to-[#0c101b] border-t border-slate-900/60 relative">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Cadastro Oficial
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-slate-200">Traga sua Caravana!</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                    Inscreva sua caravana, igreja ou ministério para receber informativos de logística, vagas de estacionamento e acessos especiais.
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-sm">
                  {caravanSuccess ? (
                    <div className="text-center space-y-6 py-6">
                      <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-serif font-bold text-slate-100">Inscrição Confirmada!</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Sua caravana foi cadastrada com sucesso na Marcha para Jesus 2026. Guarde o comprovante abaixo:
                        </p>
                      </div>

                      {registeredCaravan && (
                        <div className="max-w-md mx-auto bg-slate-950 border border-slate-850 rounded-2xl p-6 text-left space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full filter blur-2xl"></div>
                          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                            <span className="text-[10px] font-mono text-amber-500 uppercase font-semibold">Comprovante de Caravanas</span>
                            <span className="text-[10px] font-mono text-slate-500">ID: {registeredCaravan.id}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Igreja</span>
                              <span className="font-bold text-slate-200">{registeredCaravan.church}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Pastor(a)</span>
                              <span className="font-bold text-slate-200">{registeredCaravan.pastor || "Não informado"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Responsável</span>
                              <span className="font-bold text-slate-200">{registeredCaravan.contactName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Telefone</span>
                              <span className="font-bold text-slate-200">{registeredCaravan.phone}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Cidade</span>
                              <span className="font-bold text-slate-200">{registeredCaravan.city}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">Estimativa Pessoas</span>
                              <span className="font-bold text-amber-400 text-sm">{registeredCaravan.peopleCount} fiéis</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setCaravanSuccess(false)}
                        className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Realizar Outro Cadastro
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
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Nome da Igreja / Ministério *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: Igreja Evangélica Pentecostal"
                            value={caravanForm.church}
                            onChange={(e) => setCaravanForm({...caravanForm, church: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Pastor Responsável</label>
                          <input 
                            type="text"
                            placeholder="Ex: Pr. João Silva"
                            value={caravanForm.pastor}
                            onChange={(e) => setCaravanForm({...caravanForm, pastor: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Nome do Líder da Caravana *</label>
                          <input 
                            type="text"
                            required
                            placeholder="Nome de quem organizará o ônibus"
                            value={caravanForm.contactName}
                            onChange={(e) => setCaravanForm({...caravanForm, contactName: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Telefone de Contato (WhatsApp) *</label>
                          <input 
                            type="tel"
                            required
                            placeholder="Ex: (11) 99999-9999"
                            value={caravanForm.phone}
                            onChange={(e) => setCaravanForm({...caravanForm, phone: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Quantidade Estimada de Integrantes</label>
                          <input 
                            type="number"
                            placeholder="Ex: 45"
                            value={caravanForm.peopleCount}
                            onChange={(e) => setCaravanForm({...caravanForm, peopleCount: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">Cidade da Caravana</label>
                          <input 
                            type="text"
                            placeholder="Ex: Itaquaquecetuba"
                            value={caravanForm.city}
                            onChange={(e) => setCaravanForm({...caravanForm, city: e.target.value})}
                            className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-850 flex justify-between items-center flex-wrap gap-4">
                        <span className="text-[10px] text-slate-500 max-w-sm font-mono leading-relaxed">
                          * Ao enviar, os dados serão compartilhados com o COPEI para agenciamento de trânsito e recepção.
                        </span>
                        <button
                          type="submit"
                          disabled={isSubmittingCaravan}
                          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center shrink-0 disabled:opacity-50"
                        >
                          {isSubmittingCaravan ? "Cadastrando..." : "Enviar Inscrição de Caravana"}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </section>

            {/* REGULAMENTOS E NORMAS DA MARCHA */}
            <section className="py-16 bg-[#080b13] border-t border-slate-900/60">
              <div className="max-w-5xl mx-auto px-4">
                
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Regulamento
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-slate-200">Regulamentos e Normas Oficiais</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                    Acesse as regras fundamentais de participação para Trios Elétricos, Ambulantes, Caravanas e Equipes de Apoio da Marcha 2026.
                  </p>
                </div>

                {regulations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
                    <p className="text-sm text-slate-500">Nenhum regulamento publicado no momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {regulations.map((reg) => (
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
                          <span className="text-[10px] font-mono text-slate-500">Itaquaquecetuba 2026</span>
                          <a 
                            href={reg.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] font-mono text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            <span>Acessar Documento</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* SPONSORS / APOIADORES */}
            {sponsors.length > 0 && (
              <section className="py-12 bg-slate-950 border-t border-slate-900/60">
                <div className="max-w-6xl mx-auto px-4 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest block mb-6">Parceiros & Apoio Oficial</span>
                  <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {sponsors.map((spon) => (
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
            <section className="py-16 bg-gradient-to-b from-[#0c101b] to-slate-950 border-t border-slate-900/60 relative">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Assessoria & Credenciamento
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-slate-200">Imprensa</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
                    Área dedicada a profissionais de comunicação, jornalistas e veículos parceiros da Marcha para Jesus 2026.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {/* Card 1: Assessoria de Imprensa */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                        <Mail className="w-5 h-5 text-amber-500" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-slate-200">Assessoria de Imprensa</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Entre em contato com nossa assessoria oficial para entrevistas, notas oficiais e pautas.
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
                        Clique aqui
                      </a>
                    </div>
                  </div>

                  {/* Card 2: Divulgação/Material */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                        <ImageIcon className="w-5 h-5 text-amber-500" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-slate-200">Divulgação / Material</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Baixe os arquivos oficiais da Marcha, incluindo logotipos, cartazes, panfletos digitais e materiais de divulgação.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-850">
                      <a 
                        href={settings?.pressMaterialLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-bold text-slate-950 font-mono transition-all text-center"
                      >
                        Clique aqui
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Credenciamento Imprensa */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4">
                        <FileText className="w-5 h-5 text-amber-500" />
                      </div>
                      <h4 className="text-base font-serif font-bold text-slate-200">Credenciamento Imprensa</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Preencha o formulário para solicitar credenciamento para cobertura do evento (vagas limitadas).
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-850">
                      <a 
                        href={settings?.pressCredLink || "https://forms.gle/credenciamento"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/25 hover:border-amber-400/40 rounded-xl text-xs font-bold text-amber-400 font-mono transition-all text-center"
                      >
                        Clique aqui
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: RADIO */}
        {activeTab === "radio" && <LiveRadio />}

        {/* TAB 3: BIBLE SECTION */}
        {activeTab === "biblia" && <BibleSection />}

        {/* TAB 4: NEWS */}
        {activeTab === "noticias" && <NewsSection />}

        {/* TAB 5: DEVOTIONALS */}
        {activeTab === "devocionais" && <DevotionalsSection />}

        {/* TAB 6: PERSONAL NOTES (CLOUD PERSISTENCE) */}
        {activeTab === "anotacoes" && (
          <PersonalNotes 
            currentUser={currentUser} 
            onLoginClick={() => setShowLoginModal(true)} 
          />
        )}

        {/* TAB 7: ADMIN DASHBOARD */}
        {activeTab === "admin" && currentUser?.role === "admin" && <AdminDashboard />}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Column 1: Info and Slogan */}
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-serif font-bold text-lg flex items-center justify-center mr-2 shadow glow-accent">
                  M
                </div>
                <span className="font-serif text-slate-200 font-bold text-base tracking-wide">Marcha para Jesus</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plataforma tecnológica e ministerial da Marcha para Jesus Itaquaquecetuba 2026. Unindo fé e tecnologia em prol das famílias.
              </p>
              <span className="text-[10px] text-amber-500 font-mono uppercase block">Sempre Conectados</span>
              <div className="flex items-center space-x-2 mt-2">
                {settings?.instagramUrl && (
                  <a 
                    href={settings.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a 
                    href={settings.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.youtubeUrl && (
                  <a 
                    href={settings.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-200">Sitemap & Páginas</h4>
              <ul className="space-y-1.5 text-xs">
                <li><button onClick={() => setActiveTab("home")} className="hover:text-amber-400 transition-colors">Início</button></li>
                <li><button onClick={() => setActiveTab("radio")} className="hover:text-amber-400 transition-colors">Rádio Marcha</button></li>
                <li><button onClick={() => setActiveTab("biblia")} className="hover:text-amber-400 transition-colors">Bíblia App</button></li>
                <li><button onClick={() => setActiveTab("noticias")} className="hover:text-amber-400 transition-colors">Notícias & Blog</button></li>
                <li><button onClick={() => setActiveTab("devocionais")} className="hover:text-amber-400 transition-colors">Devocionais</button></li>
              </ul>
            </div>

            {/* Column 3: Contact and Support */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-200">Suporte Oficial</h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> contato@marchaitaqua.com.br</li>
                <li className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> Itaquaquecetuba - SP</li>
                <li className="flex items-center"><Compass className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> Parceria COPEI</li>
              </ul>
            </div>

            {/* Column 4: XML Sitemap SEO details */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-200">Sitemap XML & SEO</h4>
              <p className="text-xs text-slate-500">
                Sitemap XML gerado dinamicamente para indexação do portal em todos os motores de busca.
              </p>
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-400 hover:border-amber-500 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-amber-500" />
                <span>Ver sitemap.xml</span>
              </a>
            </div>

          </div>

          <div className="h-[1px] bg-slate-900 w-full mb-6"></div>

          {/* Bottom Copyright and requested developers credit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-600 font-mono">
              &copy; {new Date().getFullYear()} Marcha para Jesus Itaquaquecetuba. Todos os direitos reservados.
            </span>
            
            {/* Required designer footer credit */}
            <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
              <span>Desenvolvido com excelência por:</span>
              <a 
                href="https://www.maximo.tec.br" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-500 hover:text-amber-400 font-semibold underline flex items-center"
              >
                Rede Máximo em Soluções <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* LOGIN / SIGNUP MODAL DIALOG */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-fadeIn ring-1 ring-slate-700 text-center backdrop-blur-md">
            
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
            >
              &times;
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>

            <h3 className="text-lg font-serif font-bold text-slate-200">Acesso ao Altar - Portal da Marcha</h3>
            <p className="text-xs text-slate-400 mt-1">Insira seu e-mail para sincronizar suas anotações pessoais em nuvem.</p>
            <p className="text-[10px] text-amber-500 font-mono mt-1 italic">Dica: use maximoemsolucoes@gmail.com para acessar como Administrador.</p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 mt-6">
              <input
                type="email"
                placeholder="exemplo@email.com"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center"
              >
                <span>{loadingLogin ? "Autenticando..." : "Entrar / Sincronizar"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
