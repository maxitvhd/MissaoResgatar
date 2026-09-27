import React, { useState, useEffect } from "react";
import { 
  ImageIcon, ToggleLeft, Video, Share2, Mail, CheckCircle, 
  Upload, X, RotateCcw, Sliders, ExternalLink, Save, RefreshCw, Eye
} from "lucide-react";
import { fetchSettings, updateSettings, uploadFile } from "../../lib/api";
import { SiteSettings } from "../../types";

export default function AdminSettingsTab() {
  const [activeSubMenu, setActiveSubMenu] = useState<"logo" | "secoes" | "hero" | "redes" | "imprensa">("logo");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Settings State
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    hero: true,
    agenda: true,
    atracoes: true,
    videos: true,
    rota: true,
    loja: true,
    galeria: true,
    caravanas: true,
    regulamentos: true,
    patrocinadores: true,
    imprensa: true,
  });

  const [videoBgUrl, setVideoBgUrl] = useState<string>("");
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [heroImgUrl, setHeroImgUrl] = useState<string>("");
  const [uploadingHeroImg, setUploadingHeroImg] = useState<boolean>(false);
  const [bgSize, setBgSize] = useState<string>("cover");
  const [bgPosition, setBgPosition] = useState<string>("center");
  const [bgOpacity, setBgOpacity] = useState<number>(35);
  const [bgScale, setBgScale] = useState<number>(105);
  const [bgDarkness, setBgDarkness] = useState<number>(70);

  const [instagramUrl, setInstagramUrl] = useState<string>("");
  const [facebookUrl, setFacebookUrl] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  const [pressEmail, setPressEmail] = useState<string>("");
  const [pressMaterialLink, setPressMaterialLink] = useState<string>("");
  const [pressCredLink, setPressCredLink] = useState<string>("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSettings();
      setLogoUrl(data.logoUrl || "");
      if (data.activeSections) {
        setActiveSections((prev) => ({ ...prev, ...data.activeSections }));
      }
      setVideoBgUrl(data.videoBackgroundUrl || "");
      setHeroImgUrl(data.heroImageUrl || "");
      setBgSize(data.backgroundSize || "cover");
      setBgPosition(data.backgroundPosition || "center");
      setBgOpacity(typeof data.backgroundOpacity === "number" ? data.backgroundOpacity : 35);
      setBgScale(typeof data.backgroundScale === "number" ? data.backgroundScale : 105);
      setBgDarkness(typeof data.backgroundDarkness === "number" ? data.backgroundDarkness : 70);
      setInstagramUrl(data.instagramUrl || "");
      setFacebookUrl(data.facebookUrl || "");
      setYoutubeUrl(data.youtubeUrl || "");
      setPressEmail(data.pressEmail || "");
      setPressMaterialLink(data.pressMaterialLink || "");
      setPressCredLink(data.pressCredLink || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        logoUrl,
        activeSections,
        videoBackgroundUrl: videoBgUrl,
        heroImageUrl: heroImgUrl,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundOpacity: bgOpacity,
        backgroundScale: bgScale,
        backgroundDarkness: bgDarkness,
        instagramUrl,
        facebookUrl,
        youtubeUrl,
        pressEmail,
        pressMaterialLink,
        pressCredLink,
      });
      triggerSuccess("Configurações salvas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "site");
      setLogoUrl(url);
      triggerSuccess("Logo carregada! Clique em 'Salvar Alterações' para aplicar.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar a logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, "site");
      setVideoBgUrl(url);
      triggerSuccess("Vídeo de fundo carregado! Clique em 'Salvar Alterações' para aplicar.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar o vídeo.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleHeroImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImg(true);
    try {
      const url = await uploadFile(file, "site");
      setHeroImgUrl(url);
      triggerSuccess("Imagem de fundo carregada! Clique em 'Salvar Alterações' para aplicar.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar a imagem.");
    } finally {
      setUploadingHeroImg(false);
    }
  };

  const toggleSection = (key: string) => {
    setActiveSections((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 flex items-center justify-center space-x-2 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
        <span>Carregando configurações...</span>
      </div>
    );
  }

  const subMenuItems = [
    { id: "logo", label: "Logotipo Oficial", icon: ImageIcon, desc: "Logo da Navbar e Rodapé" },
    { id: "secoes", label: "Seções do Site", icon: ToggleLeft, desc: "Ativar ou desativar blocos" },
    { id: "hero", label: "Fundo do Hero", icon: Video, desc: "Vídeo/foto e estilo visual" },
    { id: "redes", label: "Redes Sociais", icon: Share2, desc: "Instagram, YouTube e Facebook" },
    { id: "imprensa", label: "Imprensa & Mídia", icon: Mail, desc: "Assessoria e credenciamento" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Feedback Toast */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center space-x-2 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub-menu Navigation Tabs (Horizontal Minimalist Pills) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/70 border border-slate-800 rounded-2xl backdrop-blur-md">
        {subMenuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSubMenu === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubMenu(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-MENU 1: LOGOTIPO OFICIAL */}
      {activeSubMenu === "logo" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              Logotipo Oficial do Site
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Esta imagem será exibida com destaque na barra de navegação superior (Navbar) e no rodapé do portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Logo Preview Frame */}
            <div className="w-48 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 shrink-0 overflow-hidden shadow-inner">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Atual" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">M</div>
                  <span className="text-xs font-bold text-slate-400">Missão Resgatar</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <label className="text-[11px] font-mono text-slate-400 uppercase block">
                Enviar Nova Imagem da Logo ou Colar URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... ou clique em Upload para escolher do computador"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload-input"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <label
                  htmlFor="logo-upload-input"
                  className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? "Enviando..." : "Upload Logo"}</span>
                </label>
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Remover logo e voltar ao texto padrão
                </button>
              )}
              <p className="text-[11px] text-slate-500">
                Formato sugerido: PNG transparente ou SVG com altura mínima de 80px.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Logotipo"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: SEÇÕES DO SITE */}
      {activeSubMenu === "secoes" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <ToggleLeft className="w-4 h-4 text-amber-500" />
              Ativar e Desativar Seções da Página Inicial
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle quais blocos e seções aparecem para os visitantes na página inicial do site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: "hero", label: "Hero Principal", desc: "Vídeo/foto de destaque e chamada principal" },
              { key: "agenda", label: "Agenda & Cronograma", desc: "Contador regressivo e horários" },
              { key: "atracoes", label: "Atrações & Preletores", desc: "Cantores, bandas e pregadores" },
              { key: "videos", label: "Vídeos do YouTube", desc: "Transmissões e playlists em vídeo" },
              { key: "rota", label: "Localização & Endereço", desc: "Trajeto, mapa e ponto de encontro da Missão" },
              { key: "loja", label: "Vitrine da Loja Oficial", desc: "Destaque de produtos da loja" },
              { key: "transparencia", label: "Painel de Transparência", desc: "Prestação de contas pública de entradas e saídas no Reino" },
              { key: "galeria", label: "Galeria de Fotos", desc: "Fotos de eventos e cultos anteriores" },
              { key: "caravanas", label: "Caravanas & Grupos", desc: "Formulário de inscrição de caravanas" },
              { key: "regulamentos", label: "Regulamentos", desc: "Normas de participação e segurança" },
              { key: "patrocinadores", label: "Patrocinadores & Apoio", desc: "Logotipos de apoiadores" },
              { key: "imprensa", label: "Assessoria de Imprensa", desc: "Material para jornalistas e contato" },
            ].map((sec) => {
              const active = activeSections[sec.key] !== false;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => toggleSection(sec.key)}
                  className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-100 hover:border-emerald-500/50"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="pr-2">
                    <p className={`text-xs font-semibold ${active ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
                      {sec.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sec.desc}</p>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      active
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {active ? "Ativo" : "Inativo"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Seções Ativas"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-MENU 3: FUNDO DO HERO (VÍDEO / IMAGEM) */}
      {activeSubMenu === "hero" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                Fundo do Hero (Vídeo ou Foto de Abertura)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Envie um vídeo em MP4 ou foto de alta qualidade que fica em looping no topo da página inicial.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBgSize("cover");
                setBgPosition("center");
                setBgScale(105);
                setBgOpacity(35);
                setBgDarkness(70);
              }}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões
            </button>
          </div>

          {/* Video and Image Upload Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase block flex items-center justify-between">
                <span>Vídeo de Fundo (.mp4)</span>
                {videoBgUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoBgUrl("")}
                    className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Remover Vídeo
                  </button>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL direta ou faça upload..."
                  value={videoBgUrl}
                  onChange={(e) => setVideoBgUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  id="video-bg-upload-input"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <label
                  htmlFor="video-bg-upload-input"
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVideo ? "..." : "Upload Vídeo"}</span>
                </label>
              </div>
            </div>

            {/* Imagem */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase block flex items-center justify-between">
                <span>Imagem Alternativa / Poster</span>
                {heroImgUrl && (
                  <button
                    type="button"
                    onClick={() => setHeroImgUrl("")}
                    className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Remover Imagem
                  </button>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL direta ou faça upload..."
                  value={heroImgUrl}
                  onChange={(e) => setHeroImgUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
                <input
                  type="file"
                  accept="image/*"
                  id="hero-img-upload-input"
                  className="hidden"
                  onChange={handleHeroImgUpload}
                />
                <label
                  htmlFor="hero-img-upload-input"
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingHeroImg ? "..." : "Upload Foto"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ajustes de Enquadramento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Enquadramento</label>
              <select
                value={bgSize}
                onChange={(e) => setBgSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="cover">Preencher Tela (Cover)</option>
                <option value="contain">Conter Inteiro (Contain)</option>
                <option value="100% 100%">Esticado (100% 100%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Posicionamento</label>
              <select
                value={bgPosition}
                onChange={(e) => setBgPosition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="center">Centro</option>
                <option value="top">Topo</option>
                <option value="bottom">Base</option>
                <option value="left">Esquerda</option>
                <option value="right">Direita</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Opacidade: {bgOpacity}%</label>
              <input
                type="range"
                min="10"
                max="100"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Zoom: {bgScale}%</label>
              <input
                type="range"
                min="90"
                max="150"
                value={bgScale}
                onChange={(e) => setBgScale(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Escurecimento: {bgDarkness}%</label>
              <input
                type="range"
                min="20"
                max="95"
                value={bgDarkness}
                onChange={(e) => setBgDarkness(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase block mb-2">
              Pré-visualização em Tempo Real do Topo (Hero)
            </label>
            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              {videoBgUrl ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={videoBgUrl}
                  style={{
                    objectFit: bgSize as any,
                    objectPosition: bgPosition,
                    opacity: bgOpacity / 100,
                    transform: `scale(${bgScale / 100})`,
                    transformOrigin: bgPosition,
                  }}
                  className="w-full h-full pointer-events-none"
                />
              ) : heroImgUrl ? (
                <img
                  src={heroImgUrl}
                  alt="Prévia"
                  style={{
                    objectFit: bgSize as any,
                    objectPosition: bgPosition,
                    opacity: bgOpacity / 100,
                    transform: `scale(${bgScale / 100})`,
                    transformOrigin: bgPosition,
                  }}
                  className="w-full h-full pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-mono">
                  Vídeo padrão do sistema
                </div>
              )}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50 pointer-events-none"
                style={{ opacity: bgDarkness / 100 }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none z-10">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 mb-1">
                  MISSÃO RESGATAR 2026
                </span>
                <p className="text-base font-serif font-bold text-white tracking-wide uppercase">
                  MISSÃO <span className="text-amber-400">RESGATAR</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Fundo e Estilo"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-MENU 4: REDES SOCIAIS */}
      {activeSubMenu === "redes" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-500" />
              Redes Sociais Oficiais da Missão
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Links dos canais oficiais que são abertos ao clicar nos ícones do cabeçalho e rodapé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Instagram</label>
              <input
                type="text"
                placeholder="https://instagram.com/missaoresgatar"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Facebook</label>
              <input
                type="text"
                placeholder="https://facebook.com/missaoresgatar"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Canal do YouTube</label>
              <input
                type="text"
                placeholder="https://youtube.com/@missaoresgatar"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Redes Sociais"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-MENU 5: ASSESSORIA DE IMPRENSA */}
      {activeSubMenu === "imprensa" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" />
              Assessoria de Imprensa & Materiais
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Contatos e links oficiais para jornalistas, fotógrafos e credenciamento de mídia.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">E-mail de Contato da Assessoria</label>
              <input
                type="email"
                placeholder="Ex: imprensa@mresgatar.com.br"
                value={pressEmail}
                onChange={(e) => setPressEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Link do Material / Kit de Imprensa (.zip)</label>
              <input
                type="text"
                placeholder="https://.../kit-imprensa.zip"
                value={pressMaterialLink}
                onChange={(e) => setPressMaterialLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Formulário de Credenciamento da Imprensa</label>
              <input
                type="text"
                placeholder="Link para o Google Forms ou página de credenciamento..."
                value={pressCredLink}
                onChange={(e) => setPressCredLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Informações de Imprensa"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
