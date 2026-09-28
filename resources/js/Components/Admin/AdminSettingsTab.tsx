import React, { useState, useEffect } from "react";
import { 
  ImageIcon, ToggleLeft, Video, Share2, Mail, CheckCircle, 
  Upload, X, RotateCcw, Sliders, ExternalLink, Save, RefreshCw, Eye, MessageCircle, Phone,
  Search, Globe, MapPin
} from "lucide-react";
import { fetchSettings, updateSettings, uploadFile } from "../../lib/api";
import { SiteSettings } from "../../types";

export default function AdminSettingsTab() {
  const [activeSubMenu, setActiveSubMenu] = useState<"logo" | "secoes" | "hero" | "redes" | "whatsapp" | "imprensa" | "seo" | "noticias_api">("logo");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Noticias API (IA maximo.tec.br) State
  const [noticiasApiUrl, setNoticiasApiUrl] = useState<string>("https://noticias.maximo.tec.br/api/noticias/v1");
  const [noticiasApiKey, setNoticiasApiKey] = useState<string>("");
  const [testingApi, setTestingApi] = useState<boolean>(false);
  const [apiTestResult, setApiTestResult] = useState<{ sucesso: boolean; mensagem: string } | null>(null);

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

  const [whatsappLoja, setWhatsappLoja] = useState<string>("");
  const [whatsappFlutuante, setWhatsappFlutuante] = useState<string>("");
  const [mensagemWhatsappFlutuante, setMensagemWhatsappFlutuante] = useState<string>("");

  const [pressEmail, setPressEmail] = useState<string>("");
  const [pressMaterialLink, setPressMaterialLink] = useState<string>("");
  const [pressCredLink, setPressCredLink] = useState<string>("");

  // SEO
  const [seoTitle, setSeoTitle] = useState<string>("");
  const [seoDescription, setSeoDescription] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string>("");
  const [seoOgImage, setSeoOgImage] = useState<string>("");
  const [seoTwitterSite, setSeoTwitterSite] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [addressStreet, setAddressStreet] = useState<string>("");
  const [addressNumber, setAddressNumber] = useState<string>("");
  const [addressNeighborhood, setAddressNeighborhood] = useState<string>("");
  const [addressCity, setAddressCity] = useState<string>("");
  const [addressState, setAddressState] = useState<string>("");
  const [addressZip, setAddressZip] = useState<string>("");

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
      setWhatsappLoja(data.whatsappLoja || "");
      setWhatsappFlutuante(data.whatsappFlutuante || "");
      setMensagemWhatsappFlutuante(data.mensagemWhatsappFlutuante || "");
      setPressEmail(data.pressEmail || "");
      setPressMaterialLink(data.pressMaterialLink || "");
      setPressCredLink(data.pressCredLink || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
      setSeoKeywords(data.seoKeywords || "");
      setSeoOgImage(data.seoOgImage || "");
      setSeoTwitterSite(data.seoTwitterSite || "");
      setNoticiasApiUrl(data.noticiasApiUrl || "https://noticias.maximo.tec.br/api/noticias/v1");
      setNoticiasApiKey(data.noticiasApiKey || "");
      setContactPhone(data.contactPhone || "");
      setAddressStreet(data.addressStreet || "");
      setAddressNumber(data.addressNumber || "");
      setAddressNeighborhood(data.addressNeighborhood || "");
      setAddressCity(data.addressCity || "");
      setAddressState(data.addressState || "");
      setAddressZip(data.addressZip || "");
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

  const handleTestApiConnection = async () => {
    setTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch("/configuracoes/testar-noticias-api", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ url: noticiasApiUrl, key: noticiasApiKey }),
      });
      const json = await res.json();
      setApiTestResult(json);
    } catch (err: any) {
      setApiTestResult({ sucesso: false, mensagem: "Erro ao testar API: " + (err.message || "Falha na requisição") });
    } finally {
      setTestingApi(false);
    }
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
        whatsappLoja,
        whatsappFlutuante,
        mensagemWhatsappFlutuante,
        pressEmail,
        pressMaterialLink,
        pressCredLink,
        seoTitle,
        seoDescription,
        seoKeywords,
        seoOgImage,
        seoTwitterSite,
        noticias_api_url: noticiasApiUrl,
        noticias_api_key: noticiasApiKey,
        contactPhone,
        addressStreet,
        addressNumber,
        addressNeighborhood,
        addressCity,
        addressState,
        addressZip,
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
    { id: "whatsapp", label: "WhatsApp & Loja", icon: MessageCircle, desc: "Botão flutuante e vendas" },
    { id: "imprensa", label: "Imprensa & Mídia", icon: Mail, desc: "Assessoria e credenciamento" },
    { id: "seo", label: "SEO & Busca", icon: Search, desc: "Google, redes sociais e IAs" },
    { id: "noticias_api", label: "API de Notícias IA", icon: Globe, desc: "Integração maximo.tec.br" },
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

      {/* SUB-MENU: WHATSAPP & LOJA */}
      {activeSubMenu === "whatsapp" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              Configuração de Números do WhatsApp (Loja & Atendimento Flutuante)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina os números para recebimento de pedidos da loja e para o botão flutuante de atendimento do portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp da Loja Oficial (Pedidos)</span>
              </label>
              <p className="text-[11px] text-slate-400 leading-snug">
                Número que receberá as mensagens diretas de pedidos e dúvidas sobre os produtos da loja.
              </p>
              <input
                type="text"
                placeholder="Ex: 5511999999999 ou (11) 99999-9999"
                value={whatsappLoja}
                onChange={(e) => setWhatsappLoja(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-500 block">
                Formato internacional recomendado: DDD + Número (ex: 5511999999999)
              </span>
            </div>

            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Flutuante (Atendimento / Pastor)</span>
              </label>
              <p className="text-[11px] text-slate-400 leading-snug">
                Número que abre ao clicar no botão verde flutuante no canto da tela do site.
              </p>
              <input
                type="text"
                placeholder="Ex: 5511999999999 ou (11) 99999-9999"
                value={whatsappFlutuante}
                onChange={(e) => setWhatsappFlutuante(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] font-mono text-slate-500 block">
                Deixe em branco para ocultar o botão flutuante.
              </span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <label className="text-xs font-bold text-slate-200">
              Mensagem Inicial Padrão do WhatsApp Flutuante
            </label>
            <input
              type="text"
              placeholder="Ex: Olá! Paz do Senhor, gostaria de falar com a equipe da Missão Resgatar."
              value={mensagemWhatsappFlutuante}
              onChange={(e) => setMensagemWhatsappFlutuante(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Salvando..." : "Salvar Números do WhatsApp"}</span>
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

      {/* SUB-MENU: SEO & BUSCA */}
      {activeSubMenu === "seo" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              SEO, Mapa do Site e Busca por IA
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Estes textos aparecem no Google, ao compartilhar no WhatsApp/Facebook e são lidos pelos
              buscadores de IA (ChatGPT, Claude, Perplexity). Campo em branco = usa o padrão do sistema.
            </p>
          </div>

          {/* PREVIEW */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Prévia no Google</p>
            <p className="text-[11px] text-emerald-500 font-mono truncate">
              {seoTitle || "Missão Resgatar | Igreja em Itaquaquecetuba - SP"}
            </p>
            <p className="text-[11px] text-sky-500 font-mono truncate mt-0.5">
              {typeof window !== "undefined" ? window.location.origin : "https://www.mresgatar.com.br"}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {seoDescription ||
                "Missão Resgatar, uma igreja viva resgatando vidas em Itaquaquecetuba. Notícias, devocionais, agenda de cultos, galeria de fotos, loja e rádio online 24h."}
            </p>
            <p className="text-[10px] text-slate-500 mt-3">
             {(seoDescription || "descrição padrão").length} caracteres (recomendado: 120 a 160)
            </p>
          </div>

          {/* ARQUIVOS GERADOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Sitemap XML", url: "/sitemap.xml", desc: "Todas as URLs para o Google" },
              { label: "Robots.txt", url: "/robots.txt", desc: "Regras de rastreamento" },
              { label: "llms.txt", url: "/llms.txt", desc: "Manifesto para IAs" },
            ].map((arq) => (
              <a
                key={arq.url}
                href={arq.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> {arq.label}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{arq.url}</p>
                <p className="text-[11px] text-slate-400 mt-1">{arq.desc}</p>
              </a>
            ))}
          </div>

          {/* IDENTIDADE NO GOOGLE */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase block">
              Título do Site (title) - em branco usa o padrão
            </label>
            <input
              type="text"
              placeholder="Missão Resgatar | Igreja em Itaquaquecetuba - SP"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase block">
              Descrição (meta description) - até 160 caracteres
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Resumo do site que aparece no Google e ao compartilhar."
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase block">
              Palavras-chave (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="igreja em Itaquaquecetuba, culto, devocional diário..."
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">
                Imagem de compartilhamento (og:image 1200x630)
              </label>
              <input
                type="text"
                placeholder="Em branco usa o logo ou a imagem hero"
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 block">
                É a imagem que aparece no WhatsApp e Facebook ao linkar o site.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase block">
                Perfil Twitter / X
              </label>
              <input
                type="text"
                placeholder="@missaoresgatar"
                value={seoTwitterSite}
                onChange={(e) => setSeoTwitterSite(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 block">
                Sem o "@" no início. Deixe vazio se a igreja não tiver perfil.
              </span>
            </div>
          </div>

          {/* CONTATO E ENDERECO */}
          <div className="border-t border-slate-800/80 pt-4">
            <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Contato e endereço (usados no Google Maps e nos dados estruturados)
            </h5>
            <p className="text-[11px] text-slate-400 mb-4">
              Preencha para o Google exibir a igreja com endereço, telefone e horário de culto.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Rua / Avenida</label>
                <input
                  type="text"
                  placeholder="Rua Exemplo da Fé"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Número</label>
                <input
                  type="text"
                  placeholder="123"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Bairro</label>
                <input
                  type="text"
                  placeholder="Centro"
                  value={addressNeighborhood}
                  onChange={(e) => setAddressNeighborhood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">Cidade</label>
                <input
                  type="text"
                  placeholder="Itaquaquecetuba"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">UF</label>
                <input
                  type="text"
                  placeholder="SP"
                  maxLength={2}
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block">CEP</label>
                <input
                  type="text"
                  placeholder="08570-000"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
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
              <span>{saving ? "Salvando..." : "Salvar Configurações de SEO"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-MENU 8: API DE NOTÍCIAS IA */}
      {activeSubMenu === "noticias_api" && (
        <div className="space-y-6 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <div className="border-b border-slate-800/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                Integração com o Sistema de Notícias IA (maximo.tec.br)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Alimente a seção de Notícias do site automaticamente consumindo as matérias jornalísticas geradas com Inteligência Artificial.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestApiConnection}
              disabled={testingApi}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-400 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingApi ? "animate-spin" : ""}`} />
              <span>{testingApi ? "Testando Conexão..." : "Testar Conexão com API"}</span>
            </button>
          </div>

          {apiTestResult && (
            <div className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 ${
              apiTestResult.sucesso 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">{apiTestResult.sucesso ? "Conexão Bem-Sucedida!" : "Falha no Teste de Conexão"}</span>
                <p className="text-[11px] opacity-90">{apiTestResult.mensagem}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                URL do Servidor / Endpoint da API *
              </label>
              <input
                type="text"
                placeholder="https://noticias.maximo.tec.br/api/noticias/v1"
                value={noticiasApiUrl}
                onChange={(e) => setNoticiasApiUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Endereço padrão: <code className="text-amber-400">https://noticias.maximo.tec.br/api/noticias/v1</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Chave de Autenticação de API (X-API-KEY) *
              </label>
              <input
                type="text"
                placeholder="Insira a sua chave gerada no painel de Notícias IA..."
                value={noticiasApiKey}
                onChange={(e) => setNoticiasApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                A chave pode ser cadastrada aqui pelo painel ou definida no arquivo <code className="text-amber-400">.env</code> como <code className="text-amber-400">NOTICIAS_API_KEY</code>. A chave do painel tem prioridade.
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
              <span>{saving ? "Salvando..." : "Salvar Credenciais da API"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
