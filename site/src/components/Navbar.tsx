import React, { useState } from "react";
import { Radio, BookOpen, Settings, LogIn, LogOut, User as UserIcon, Globe, MapPin, Menu, X, Share2, FileText } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  currentLanguage: string;
  onChangeLanguage: (lang: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginClick,
  onLogout,
  currentLanguage,
  onChangeLanguage
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Início", icon: MapPin },
    { id: "noticias", label: "Notícias & Blog", icon: FileText },
    { id: "devocionais", label: "Devocionais", icon: BookOpen },
    { id: "anotacoes", label: "Minhas Anotações", icon: BookOpen },
    { id: "biblia", label: "App da Bíblia", icon: BookOpen },
    { id: "radio", label: "Rádio Marcha", icon: Radio }
  ];

  if (currentUser?.role === "admin") {
    menuItems.push({ id: "admin", label: "Administração", icon: Settings });
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const getLangLabel = (code: string) => {
    switch (code) {
      case "pt": return "Português";
      case "en": return "English";
      case "es": return "Español";
      default: return "Português";
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange("home")}>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl transition-all duration-300 hover:scale-105 shadow-md shadow-amber-500/10">
              MJ
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-light tracking-widest text-white leading-none">MARCHA<span className="font-bold text-amber-500">ITAQUÁ</span></span>
              <span className="text-[8px] font-mono tracking-[0.2em] text-slate-500 uppercase mt-1">Itaquaquecetuba 2026</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3 h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`flex items-center px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-amber-500 bg-slate-900 border border-slate-800/80"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-amber-500/90" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Translations & User Sessions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                id="btn-language"
                className="flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider text-slate-300 hover:text-amber-500 border border-slate-800 bg-slate-900/60"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" />
                {currentLanguage.toUpperCase()}
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-xl bg-slate-900 border border-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {["pt", "en", "es"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onChangeLanguage(lang);
                          setLangDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2.5 text-xs transition-colors duration-200 ${
                          currentLanguage === lang
                            ? "bg-slate-950 text-amber-500 font-bold"
                            : "text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                        }`}
                      >
                        {getLangLabel(lang)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-300">{currentUser.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  id="btn-logout"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-all duration-200"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                id="btn-login"
                className="flex items-center px-5 py-2 rounded-lg text-xs uppercase tracking-widest font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Acessar Altar
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Language Selection Quick Icon */}
            <button
              onClick={() => {
                const nextLang = currentLanguage === "pt" ? "en" : currentLanguage === "en" ? "es" : "pt";
                onChangeLanguage(nextLang);
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 border border-slate-800 bg-slate-900/60"
            >
              <Globe className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c1220] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? "text-amber-400 bg-slate-800"
                    : "text-slate-300 hover:text-amber-400 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-slate-800 mt-4 flex flex-col space-y-3">
            {currentUser ? (
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded-md border border-slate-800">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-300">{currentUser.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-red-400 hover:text-red-500 text-sm font-semibold flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-full px-4 py-3 rounded-md text-base font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Entrar / Criar Conta
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
