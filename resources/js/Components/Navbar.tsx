import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, BookOpen, Settings, LogIn, LogOut, User as UserIcon, 
  Globe, MapPin, Menu, X, FileText, ShoppingBag, GraduationCap, 
  ShieldCheck, ChevronDown, Sparkles 
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { fetchSettings } from "../lib/api";
import { SiteSettings } from "../types";

interface PageProps {
  [key: string]: unknown;
  auth?: {
    user?: { id: number; name: string; email: string; role: string } | null;
  };
}

export default function Navbar() {
  const page = usePage<PageProps>();
  const { auth } = page.props;
  const { url } = page;
  const currentUser = auth?.user ?? null;
  const { t, i18n } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "pt");
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings().then(setSiteSettings).catch(() => {});
  }, []);

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fecha menu móvel ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [url]);

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem("resgatar_lang", lang);
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") return url === "/";
    return url.startsWith(path);
  };

  // Links essenciais do menu superior
  const primaryMenuItems = [
    { id: "home", label: t("nav.home") || "Início", icon: MapPin, href: "/" },
    { id: "noticias", label: t("nav.news") || "Notícias", icon: FileText, href: "/noticias" },
    { id: "devocionais", label: t("nav.devs") || "Devocionais", icon: BookOpen, href: "/devocionais" },
    { id: "loja", label: "Loja", icon: ShoppingBag, href: "/loja" },
  ];

  if (siteSettings?.activeSections?.transparencia !== false) {
    primaryMenuItems.push({ id: "transparencia", label: "Transparência", icon: ShieldCheck, href: "/transparencia" });
  }

  primaryMenuItems.push({ id: "radio", label: t("nav.radio") || "Rádio", icon: Radio, href: "/radio" });

  // Links secundários agrupados em "Mais" no desktop
  const secondaryMenuItems = [
    { id: "biblia", label: t("nav.bible") || "Bíblia Sagrada", icon: BookOpen, href: "/biblia", desc: "Leitura e versículos" },
  ];

  if (currentUser) {
    secondaryMenuItems.push(
      { id: "anotacoes", label: t("nav.notes") || "Minhas Notas", icon: FileText, href: "/notas", desc: "Anotações pessoais e sermões" },
      { id: "aulas", label: "Aulas Fechadas", icon: GraduationCap, href: "/aulas", desc: "Treinamentos e discipulado" }
    );
  }

  if (currentUser?.role === "admin") {
    secondaryMenuItems.push(
      { id: "admin", label: "Painel Admin", icon: Settings, href: "/admin", desc: "Gestão completa da Missão" }
    );
  }

  // Lista unificada para o menu móvel
  const allMobileItems = [...primaryMenuItems, ...secondaryMenuItems];

  const isMoreActive = secondaryMenuItems.some((item) => isActive(item.href));

  const handleLogout = () => {
    router.post("/logout");
  };

  const getLangLabel = (code: string) => {
    return t(`nav.${code}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt="Missão Resgatar" 
                className="h-9 sm:h-11 w-auto max-w-[140px] sm:max-w-[170px] object-contain transition-transform duration-300 hover:scale-105" 
              />
            ) : (
              <>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center font-bold text-slate-950 text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-md shadow-amber-500/10 shrink-0">
                  MR
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg sm:text-xl font-light tracking-widest text-white leading-none">
                    MISSÃO<span className="font-bold text-amber-500">RESGATAR</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.2em] text-slate-400 uppercase mt-0.5 sm:mt-1">
                    Uma Igreja Viva
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Navigation (visível em telas grandes xl: >= 1280px para nunca quebrar) */}
          <div className="hidden xl:flex items-center space-x-1 lg:space-x-1.5 h-full">
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  id={`nav-item-${item.id}`}
                  className={`flex items-center px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 whitespace-nowrap ${
                    active
                      ? "text-amber-400 bg-slate-900 border border-slate-800 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-amber-500/90 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Dropdown "Mais" para manter o menu 100% enxuto e nunca quebrar */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center px-3 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isMoreActive || moreDropdownOpen
                    ? "text-amber-400 bg-slate-900 border border-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <span>Recursos</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180 text-amber-400" : "text-slate-400"}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl p-2 z-50 animate-fadeIn">
                  <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1.5 font-bold">
                    Estudo & Espiritualidade
                  </div>
                  {secondaryMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          active
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800/80 text-amber-400 shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          {item.desc && <div className="text-[10px] text-slate-400">{item.desc}</div>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Controls Desktop: Idioma & Usuário (>= xl) */}
          <div className="hidden xl:flex items-center space-x-2.5 shrink-0">
            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                id="btn-language"
                className="flex items-center px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold tracking-wider text-slate-300 hover:text-amber-400 border border-slate-800 bg-slate-900/80 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 mr-1 text-amber-500/80" />
                <span>{currentLanguage.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 ml-1 text-slate-500" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-xl bg-slate-900 border border-slate-800 p-1 z-50">
                  {["pt", "en", "es"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentLanguage === lang
                          ? "bg-amber-500/10 text-amber-400 font-bold"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {getLangLabel(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  id="btn-logout"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                  title={t("nav.logout") || "Sair"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                id="btn-login"
                className="flex items-center px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>{t("nav.access") || "Entrar"}</span>
              </Link>
            )}
          </div>

          {/* Mobile & Tablet Controls (< xl) */}
          <div className="flex xl:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Quick Switch */}
            <button
              onClick={() => {
                const nextLang = currentLanguage === "pt" ? "en" : currentLanguage === "en" ? "es" : "pt";
                changeLanguage(nextLang);
              }}
              className="px-2 py-1.5 sm:px-2.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-amber-400 border border-slate-800 bg-slate-900/80 flex items-center gap-1 cursor-pointer"
              title="Mudar idioma"
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentLanguage.toUpperCase()}</span>
            </button>

            {/* Login rápido ou Avatar se logado */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1.5 sm:px-3 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                Entrar
              </Link>
            )}

            {/* Botão Hambúrguer Mobile/Tablet */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menu Mobile / Tablet Full-Width Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/98 backdrop-blur-2xl border-t border-slate-800 px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto w-full max-w-full shadow-2xl">
          {currentUser && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                  <span className="text-[10px] text-zinc-400 block">{currentUser.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-400 hover:text-red-300 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20"
              >
                Sair
              </button>
            </div>
          )}

          {/* Links Principais */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 px-2 font-bold block mb-1">
              Navegação
            </span>
            {allMobileItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-amber-400 bg-slate-900 border border-slate-800 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3 text-amber-500/90 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {!currentUser && (
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/20"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span>{t("nav.enterCreate") || "Entrar / Criar Conta"}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
