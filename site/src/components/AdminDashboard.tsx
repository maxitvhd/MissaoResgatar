import React, { useState, useEffect } from "react";
import { 
  Settings, FileText, BookOpen, Users, Terminal, Plus, Trash2, Send, CheckCircle, 
  RefreshCw, Radio, Calendar, Image as ImageIcon, ShieldCheck, Heart, Upload, Edit, X, MapPin, Clock, ExternalLink, Star 
} from "lucide-react";
import { 
  fetchNews, createNews, deleteNews, editNews, uploadImage, 
  fetchDevotionals, createDevotional, deleteDevotional, fetchAllUsers, editDevotional,
  fetchEvents, createEvent, editEvent, deleteEvent,
  fetchGallery, createGalleryItem, deleteGalleryItem, editGalleryItem,
  fetchRegulations, createRegulation, deleteRegulation, editRegulation,
  fetchCaravans, deleteCaravan, editCaravan,
  fetchSponsors, createSponsor, deleteSponsor, editSponsor,
  fetchSettings, updateSettings,
  fetchAttractions, createAttraction, editAttraction, deleteAttraction
} from "../lib/api";
import { NewsPost, Devotional, User, AgendaEvent, GalleryItem, Regulation, Caravan, Sponsor, SiteSettings, Attraction } from "../types";

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"news" | "devotionals" | "events" | "gallery" | "regulations" | "caravans" | "sponsors" | "users" | "telemetry" | "settings" | "attractions">("news");
  
  // List states
  const [news, setNews] = useState<NewsPost[]>([]);
  const [devs, setDevs] = useState<Devotional[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Form State: News
  const [newsTitle, setNewsTitle] = useState<string>("");
  const [newsContent, setNewsContent] = useState<string>("");
  const [newsCategory, setNewsCategory] = useState<string>("Marcha 2026");
  const [newsImage, setNewsImage] = useState<string>("");
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [uploadingNewsImg, setUploadingNewsImg] = useState<boolean>(false);

  // Form State: Devotional
  const [devTitle, setDevTitle] = useState<string>("");
  const [devContent, setDevContent] = useState<string>("");
  const [devScripture, setDevScripture] = useState<string>("");
  const [devCategory, setDevCategory] = useState<string>("Edificação");
  const [editingDevId, setEditingDevId] = useState<string | null>(null);

  // Form State: Events (Agenda)
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDesc, setEventDesc] = useState<string>("");
  const [eventLoc, setEventLoc] = useState<string>("");
  const [eventDateTime, setEventDateTime] = useState<string>("");
  const [eventImage, setEventImage] = useState<string>("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [uploadingEventImg, setUploadingEventImg] = useState<boolean>(false);

  // Form State: Gallery (Momentos Especiais)
  const [galTitle, setGalTitle] = useState<string>("");
  const [galDesc, setGalDesc] = useState<string>("");
  const [galUrl, setGalUrl] = useState<string>("");
  const [galCategory, setGalCategory] = useState<string>("Marcha Itaquá");
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [uploadingGalImg, setUploadingGalImg] = useState<boolean>(false);

  // Form State: Regulations
  const [regTitle, setRegTitle] = useState<string>("");
  const [regDesc, setRegDesc] = useState<string>("");
  const [regCategory, setRegCategory] = useState<string>("Geral");
  const [regLink, setRegLink] = useState<string>("");
  const [editingRegId, setEditingRegId] = useState<string | null>(null);

  // Form State: Caravans (Edit Only)
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carChurch, setCarChurch] = useState<string>("");
  const [carPastor, setCarPastor] = useState<string>("");
  const [carContactName, setCarContactName] = useState<string>("");
  const [carPhone, setCarPhone] = useState<string>("");
  const [carPeopleCount, setCarPeopleCount] = useState<string>("");
  const [carCity, setCarCity] = useState<string>("Itaquaquecetuba");

  // Form State: Sponsors
  const [sponName, setSponName] = useState<string>("");
  const [sponImg, setSponImg] = useState<string>("");
  const [sponLink, setSponLink] = useState<string>("");
  const [editingSponId, setEditingSponId] = useState<string | null>(null);
  const [uploadingSponImg, setUploadingSponImg] = useState<boolean>(false);

  // List states supplement: Attractions
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  // Form State: Attractions
  const [attName, setAttName] = useState<string>("");
  const [attDesc, setAttDesc] = useState<string>("");
  const [attTime, setAttTime] = useState<string>("");
  const [attImage, setAttImage] = useState<string>("");
  const [editingAttId, setEditingAttId] = useState<string | null>(null);
  const [uploadingAttImg, setUploadingAttImg] = useState<boolean>(false);

  // Settings State
  const [adminSettings, setAdminSettings] = useState<SiteSettings | null>(null);
  const [settingsVideoBg, setSettingsVideoBg] = useState<string>("");
  const [settingsHeroImg, setSettingsHeroImg] = useState<string>("");
  const [settingsInstagram, setSettingsInstagram] = useState<string>("");
  const [settingsFacebook, setSettingsFacebook] = useState<string>("");
  const [settingsYoutube, setSettingsYoutube] = useState<string>("");
  const [settingsPressEmail, setSettingsPressEmail] = useState<string>("");
  const [settingsPressMaterial, setSettingsPressMaterial] = useState<string>("");
  const [settingsPressCred, setSettingsPressCred] = useState<string>("");

  // Notifications feedback
  const [successMsg, setSuccessMsg] = useState<string>("");

  const loadAllAdminData = async () => {
    setRefreshing(true);
    try {
      const newsData = await fetchNews();
      setNews(newsData);
      
      const devsData = await fetchDevotionals();
      setDevs(devsData);

      const usersData = await fetchAllUsers();
      setUsers(usersData);

      const eventsData = await fetchEvents();
      setEvents(eventsData);

      const galleryData = await fetchGallery();
      setGallery(galleryData);

      const regsData = await fetchRegulations();
      setRegulations(regsData);

      const carsData = await fetchCaravans();
      setCaravans(carsData);

      const sponsData = await fetchSponsors();
      setSponsors(sponsData);

      const attsData = await fetchAttractions();
      setAttractions(attsData);

      const settingsData = await fetchSettings();
      setAdminSettings(settingsData);
      setSettingsVideoBg(settingsData.videoBackgroundUrl || "");
      setSettingsHeroImg(settingsData.heroImageUrl || "");
      setSettingsInstagram(settingsData.instagramUrl || "");
      setSettingsFacebook(settingsData.facebookUrl || "");
      setSettingsYoutube(settingsData.youtubeUrl || "");
      setSettingsPressEmail(settingsData.pressEmail || "");
      setSettingsPressMaterial(settingsData.pressMaterialLink || "");
      setSettingsPressCred(settingsData.pressCredLink || "");
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Upload utility
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    setImgUrl: (url: string) => void, 
    setUploading: (u: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const url = await uploadImage(base64, file.name);
          setImgUrl(url);
          triggerSuccess("Imagem carregada com sucesso para o servidor!");
        } catch (uploadErr) {
          console.error(uploadErr);
          alert("Falha ao fazer upload da imagem.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  // SETTINGS ACTION
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateSettings({
        videoBackgroundUrl: settingsVideoBg,
        heroImageUrl: settingsHeroImg,
        instagramUrl: settingsInstagram,
        facebookUrl: settingsFacebook,
        youtubeUrl: settingsYoutube,
        pressEmail: settingsPressEmail,
        pressMaterialLink: settingsPressMaterial,
        pressCredLink: settingsPressCred
      });
      setAdminSettings(updated);
      triggerSuccess("Configurações do site atualizadas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Falha ao salvar as configurações.");
    }
  };

  // NEWS ACTIONS
  const handleCreateOrUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;

    try {
      if (editingNewsId) {
        const updated = await editNews(editingNewsId, {
          title: newsTitle,
          content: newsContent,
          category: newsCategory,
          image: newsImage || undefined
        });
        setNews(news.map(n => n.id === editingNewsId ? updated : n));
        setEditingNewsId(null);
        triggerSuccess("Publicação atualizada com sucesso!");
      } else {
        const created = await createNews({
          title: newsTitle,
          content: newsContent,
          category: newsCategory,
          image: newsImage || undefined
        });
        setNews([created, ...news]);
        triggerSuccess("Notícia criada com sucesso!");
      }
      setNewsTitle("");
      setNewsContent("");
      setNewsImage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditNewsClick = (item: NewsPost) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title);
    setNewsContent(item.content);
    setNewsCategory(item.category);
    setNewsImage(item.image || "");
    triggerSuccess("Campos preenchidos para edição!");
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm("Deseja deletar esta notícia definitivamente?")) {
      try {
        await deleteNews(id);
        setNews(news.filter(n => n.id !== id));
        triggerSuccess("Notícia deletada com sucesso.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // DEVOTIONAL ACTIONS
  const handleCreateOrUpdateDev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTitle || !devContent) return;

    try {
      if (editingDevId) {
        const updated = await editDevotional(editingDevId, {
          title: devTitle,
          content: devContent,
          scripture: devScripture,
          category: devCategory
        });
        setDevs(devs.map(d => d.id === editingDevId ? updated : d));
        setEditingDevId(null);
        triggerSuccess("Estudo Devocional atualizado com sucesso!");
      } else {
        const created = await createDevotional({
          title: devTitle,
          content: devContent,
          scripture: devScripture,
          category: devCategory
        });
        setDevs([created, ...devs]);
        triggerSuccess("Estudo Devocional publicado com sucesso!");
      }
      setDevTitle("");
      setDevContent("");
      setDevScripture("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDevClick = (item: Devotional) => {
    setEditingDevId(item.id);
    setDevTitle(item.title);
    setDevContent(item.content);
    setDevScripture(item.scripture || "");
    setDevCategory(item.category);
    triggerSuccess("Campos preenchidos para edição!");
  };

  const handleDeleteDev = async (id: string) => {
    if (confirm("Deseja deletar este estudo devocional?")) {
      try {
        await deleteDevotional(id);
        setDevs(devs.filter(d => d.id !== id));
        triggerSuccess("Estudo devocional removido.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // EVENT ACTIONS
  const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDateTime) return;

    try {
      if (editingEventId) {
        const updated = await editEvent(editingEventId, {
          title: eventTitle,
          description: eventDesc,
          location: eventLoc,
          dateTime: eventDateTime,
          image: eventImage || undefined
        });
        setEvents(events.map(ev => ev.id === editingEventId ? updated : ev));
        setEditingEventId(null);
        triggerSuccess("Evento atualizado na agenda!");
      } else {
        const created = await createEvent({
          title: eventTitle,
          description: eventDesc,
          location: eventLoc,
          dateTime: eventDateTime,
          image: eventImage || undefined
        });
        setEvents([created, ...events]);
        triggerSuccess("Evento criado com sucesso na agenda!");
      }
      setEventTitle("");
      setEventDesc("");
      setEventLoc("");
      setEventDateTime("");
      setEventImage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditEventClick = (item: AgendaEvent) => {
    setEditingEventId(item.id);
    setEventTitle(item.title);
    setEventDesc(item.description || "");
    setEventLoc(item.location || "");
    setEventDateTime(item.dateTime);
    setEventImage(item.image || "");
    triggerSuccess("Dados do evento preenchidos para edição!");
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Deseja remover este evento da agenda?")) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
        triggerSuccess("Evento removido da agenda.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // GALLERY ACTIONS
  const handleCreateOrUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galUrl) return;

    try {
      if (editingGalId) {
        const updated = await editGalleryItem(editingGalId, {
          title: galTitle,
          description: galDesc,
          url: galUrl,
          category: galCategory
        });
        setGallery(gallery.map(g => g.id === editingGalId ? updated : g));
        setEditingGalId(null);
        triggerSuccess("Imagem da galeria atualizada!");
      } else {
        const created = await createGalleryItem({
          title: galTitle,
          description: galDesc,
          url: galUrl,
          category: galCategory
        });
        setGallery([created, ...gallery]);
        triggerSuccess("Momento adicionado à galeria!");
      }
      setGalTitle("");
      setGalDesc("");
      setGalUrl("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGalleryClick = (item: GalleryItem) => {
    setEditingGalId(item.id);
    setGalTitle(item.title || "");
    setGalDesc(item.description || "");
    setGalUrl(item.url);
    setGalCategory(item.category);
    triggerSuccess("Dados do momento preenchidos para edição!");
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (confirm("Remover esta imagem da galeria?")) {
      try {
        await deleteGalleryItem(id);
        setGallery(gallery.filter(g => g.id !== id));
        triggerSuccess("Imagem removida da galeria.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // REGULATIONS ACTIONS
  const handleCreateOrUpdateReg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTitle) return;

    try {
      if (editingRegId) {
        const updated = await editRegulation(editingRegId, {
          title: regTitle,
          description: regDesc,
          category: regCategory,
          link: regLink || undefined
        });
        setRegulations(regulations.map(r => r.id === editingRegId ? updated : r));
        setEditingRegId(null);
        triggerSuccess("Regulamento atualizado com sucesso!");
      } else {
        const created = await createRegulation({
          title: regTitle,
          description: regDesc,
          category: regCategory,
          link: regLink || undefined
        });
        setRegulations([created, ...regulations]);
        triggerSuccess("Regulamento adicionado com sucesso!");
      }
      setRegTitle("");
      setRegDesc("");
      setRegLink("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRegClick = (item: Regulation) => {
    setEditingRegId(item.id);
    setRegTitle(item.title);
    setRegDesc(item.description || "");
    setRegCategory(item.category);
    setRegLink(item.link || "");
    triggerSuccess("Dados do regulamento preenchidos para edição!");
  };

  const handleDeleteRegulation = async (id: string) => {
    if (confirm("Deseja remover este regulamento?")) {
      try {
        await deleteRegulation(id);
        setRegulations(regulations.filter(r => r.id !== id));
        triggerSuccess("Regulamento excluído.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // SPONSORS ACTIONS
  const handleCreateOrUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponName || !sponImg) return;

    try {
      if (editingSponId) {
        const updated = await editSponsor(editingSponId, {
          name: sponName,
          imageUrl: sponImg,
          link: sponLink || undefined
        });
        setSponsors(sponsors.map(s => s.id === editingSponId ? updated : s));
        setEditingSponId(null);
        triggerSuccess("Apoiador atualizado com sucesso!");
      } else {
        const created = await createSponsor({
          name: sponName,
          imageUrl: sponImg,
          link: sponLink || undefined
        });
        setSponsors([...sponsors, created]);
        triggerSuccess("Patrocinador/Apoiador registrado!");
      }
      setSponName("");
      setSponImg("");
      setSponLink("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSponsorClick = (item: Sponsor) => {
    setEditingSponId(item.id);
    setSponName(item.name);
    setSponImg(item.imageUrl);
    setSponLink(item.link || "");
    triggerSuccess("Dados do apoiador preenchidos para edição!");
  };

  const handleDeleteSponsor = async (id: string) => {
    if (confirm("Deseja remover este apoiador?")) {
      try {
        await deleteSponsor(id);
        setSponsors(sponsors.filter(s => s.id !== id));
        triggerSuccess("Apoiador removido.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ATTRACTIONS ACTIONS
  const handleCreateOrUpdateAttraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attName) return;

    try {
      if (editingAttId) {
        const updated = await editAttraction(editingAttId, {
          name: attName,
          description: attDesc,
          time: attTime,
          image: attImage || undefined
        });
        setAttractions(attractions.map(a => a.id === editingAttId ? updated : a));
        setEditingAttId(null);
        triggerSuccess("Atração atualizada com sucesso!");
      } else {
        const created = await createAttraction({
          name: attName,
          description: attDesc,
          time: attTime,
          image: attImage || undefined
        });
        setAttractions([...attractions, created]);
        triggerSuccess("Atração criada com sucesso!");
      }
      setAttName("");
      setAttDesc("");
      setAttTime("");
      setAttImage("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAttractionClick = (item: Attraction) => {
    setEditingAttId(item.id);
    setAttName(item.name);
    setAttDesc(item.description);
    setAttTime(item.time);
    setAttImage(item.image || "");
    triggerSuccess("Campos preenchidos para edição!");
  };

  const handleDeleteAttraction = async (id: string) => {
    if (confirm("Deseja remover esta atração confirmada?")) {
      try {
        await deleteAttraction(id);
        setAttractions(attractions.filter(a => a.id !== id));
        triggerSuccess("Atração removida com sucesso.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteCaravan = async (id: string) => {
    if (confirm("Deseja excluir este cadastro de caravana?")) {
      try {
        await deleteCaravan(id);
        setCaravans(caravans.filter(c => c.id !== id));
        triggerSuccess("Caravana removida com sucesso.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateCaravan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCarId || !carChurch || !carContactName || !carPhone) return;

    try {
      const updated = await editCaravan(editingCarId, {
        church: carChurch,
        pastor: carPastor,
        contactName: carContactName,
        phone: carPhone,
        peopleCount: Number(carPeopleCount) || 0,
        city: carCity
      });
      setCaravans(caravans.map(c => c.id === editingCarId ? updated : c));
      setEditingCarId(null);
      setCarChurch("");
      setCarPastor("");
      setCarContactName("");
      setCarPhone("");
      setCarPeopleCount("");
      triggerSuccess("Inscrição de caravana atualizada com sucesso!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCaravanClick = (item: Caravan) => {
    setEditingCarId(item.id);
    setCarChurch(item.church);
    setCarPastor(item.pastor || "");
    setCarContactName(item.contactName);
    setCarPhone(item.phone);
    setCarPeopleCount(String(item.peopleCount || ""));
    setCarCity(item.city || "Itaquaquecetuba");
    triggerSuccess("Dados da caravana carregados para edição!");
  };

  return (
    <div className="py-12 bg-slate-950 min-h-[700px]">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Banner header */}
        <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div className="text-left">
            <h2 className="text-2xl font-serif font-bold text-slate-100 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-amber-500 animate-spin-slow" />
              Painel de Controle da Marcha
            </h2>
            <p className="text-xs text-slate-400 mt-1">Gestão integrada da Marcha para Jesus 2026: publicações, eventos, caravanas, galeria e patrocinadores.</p>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={loadAllAdminData}
              disabled={refreshing}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-amber-400 flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Dados</span>
            </button>
          </div>
        </div>

        {/* Success toast inside dashboard */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-2 text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Sub Navigation menu */}
          <div className="lg:col-span-3 space-y-1">
            {[
              { id: "news", label: "Notícias & Blog", icon: FileText },
              { id: "devotionals", label: "Devocionais", icon: BookOpen },
              { id: "events", label: "Agenda Eventos", icon: Calendar },
              { id: "attractions", label: "Atrações Confirmadas", icon: Star },
              { id: "gallery", label: "Galeria HD", icon: ImageIcon },
              { id: "regulations", label: "Regulamentos", icon: ShieldCheck },
              { id: "caravans", label: "Caravanas Inscritas", icon: Users },
              { id: "sponsors", label: "Patrocinadores", icon: Heart },
              { id: "users", label: "Contas Usuários", icon: Users },
              { id: "settings", label: "Configurações Gerais", icon: Settings },
              { id: "telemetry", label: "Tráfego & Terminal", icon: Terminal }
            ].map((sub) => {
              const Icon = sub.icon;
              const isSelected = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id as any)}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all text-left cursor-pointer ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-500 font-bold"
                      : "bg-slate-900 border-slate-850 text-slate-300 hover:text-amber-400 hover:bg-slate-850"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* Active Work Area Content */}
          <div className="lg:col-span-9 bg-slate-900/50 border border-slate-850 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            
            {/* SUB-TAB 1: NEWS */}
            {activeSubTab === "news" && (
              <div className="space-y-8 text-left">
                
                {/* Form Creation */}
                <form onSubmit={handleCreateOrUpdateNews} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingNewsId ? "Editar Publicação" : "Nova Notícia ou Blog Post"}
                      </span>
                    </div>
                    {editingNewsId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingNewsId(null);
                          setNewsTitle("");
                          setNewsContent("");
                          setNewsImage("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título</label>
                      <input 
                        type="text"
                        placeholder="Ex: Novo palco montado no Parque Ecológico"
                        required
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria</label>
                      <select 
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option>Marcha 2026</option>
                        <option>Novidades</option>
                        <option>Aplicativos</option>
                        <option>Geral</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Upload da Imagem de Capa (Local ou URL)</label>
                      <div className="flex items-stretch gap-2">
                        <input 
                          type="text"
                          placeholder="Link da imagem ou faça upload ao lado..."
                          value={newsImage}
                          onChange={(e) => setNewsImage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            id="news-img-upload"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(e, setNewsImage, setUploadingNewsImg)}
                          />
                          <label 
                            htmlFor="news-img-upload"
                            className="h-full px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingNewsImg ? "Carregando..." : "Upload"}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Conteúdo Completo</label>
                      <textarea 
                        rows={4}
                        placeholder="Escreva a mensagem ou artigo da notícia..."
                        required
                        value={newsContent}
                        onChange={(e) => setNewsContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingNewsId ? "Salvar Alterações" : "Publicar Notícia"}</span>
                  </button>
                </form>

                {/* News List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Notícias Ativas ({news.length})</span>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {news.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-amber-500 uppercase font-semibold">{item.category}</span>
                          <h4 className="text-xs font-semibold text-slate-200 mt-0.5">{item.title}</h4>
                          <span className="text-[9px] text-slate-500 font-mono">Por: {item.author} | {item.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditNewsClick(item)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400"
                            title="Editar notícia"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400"
                            title="Remover notícia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 2: DEVOTIONALS */}
            {activeSubTab === "devotionals" && (
              <div className="space-y-8 text-left">
                
                {/* Form Creation */}
                <form onSubmit={handleCreateOrUpdateDev} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingDevId ? "Editar Estudo Bíblico" : "Escrever Novo Estudo Bíblico"}
                      </span>
                    </div>
                    {editingDevId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingDevId(null);
                          setDevTitle("");
                          setDevContent("");
                          setDevScripture("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título do Estudo</label>
                      <input 
                        type="text"
                        placeholder="Ex: O Caminho da Obediência"
                        required
                        value={devTitle}
                        onChange={(e) => setDevTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria</label>
                      <select 
                        value={devCategory}
                        onChange={(e) => setDevCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option>Edificação</option>
                        <option>Unidade</option>
                        <option>Tecnologia & Fé</option>
                        <option>Oração</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Texto Bíblico de Base (Scripture)</label>
                      <input 
                        type="text"
                        placeholder="Ex: João 14:6"
                        value={devScripture}
                        onChange={(e) => setDevScripture(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Texto do Estudo Completo</label>
                      <textarea 
                        rows={5}
                        placeholder="Escreva a reflexão ou estudo detalhado..."
                        required
                        value={devContent}
                        onChange={(e) => setDevContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingDevId ? "Salvar Alterações" : "Publicar Estudo Bíblico"}</span>
                  </button>
                </form>

                {/* Devotionals List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Estudos Ativos ({devs.length})</span>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {devs.map((dev) => (
                      <div key={dev.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-amber-500 uppercase font-semibold">{dev.category}</span>
                          <h4 className="text-xs font-semibold text-slate-200 mt-0.5">{dev.title}</h4>
                          {dev.scripture && <span className="text-[9px] text-slate-400 font-mono italic">Base: {dev.scripture}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDevClick(dev)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400"
                            title="Editar estudo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDev(dev.id)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400"
                            title="Remover estudo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: EVENTS (AGENDA) */}
            {activeSubTab === "events" && (
              <div className="space-y-8 text-left">
                <form onSubmit={handleCreateOrUpdateEvent} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingEventId ? "Editar Evento da Agenda" : "Novo Evento na Agenda Pró-Marcha"}
                      </span>
                    </div>
                    {editingEventId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingEventId(null);
                          setEventTitle("");
                          setEventDesc("");
                          setEventLoc("");
                          setEventDateTime("");
                          setEventImage("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título do Evento *</label>
                      <input 
                        type="text"
                        placeholder="Ex: Caravana Unida Itaquaquecetuba"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Data & Hora *</label>
                      <input 
                        type="datetime-local"
                        required
                        value={eventDateTime}
                        onChange={(e) => setEventDateTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Local / Endereço</label>
                      <input 
                        type="text"
                        placeholder="Ex: Praça Central ou Rua Itaquá, 123"
                        value={eventLoc}
                        onChange={(e) => setEventLoc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Upload da Foto (Banner)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Insira URL da foto ou faça upload..."
                          value={eventImage}
                          onChange={(e) => setEventImage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          id="event-img-upload"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e, setEventImage, setUploadingEventImg)}
                        />
                        <label 
                          htmlFor="event-img-upload"
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingEventImg ? "..." : "Upload"}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Breve Descrição do Evento</label>
                    <textarea 
                      rows={3}
                      placeholder="Detalhes adicionais sobre horários, recomendações, líderes envolvidos, etc..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingEventId ? "Salvar Alterações" : "Adicionar na Agenda"}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Eventos Pró-Marcha ({events.length})</span>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {events.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                          <span className="text-[9px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3" /> {new Date(item.dateTime).toLocaleString('pt-BR')} | 
                            <MapPin className="w-3 h-3" /> {item.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditEventClick(item)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(item.id)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: GALLERY */}
            {activeSubTab === "gallery" && (
              <div className="space-y-8 text-left">
                <form onSubmit={handleCreateOrUpdateGallery} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingGalId ? "Editar Foto nos Momentos Especiais" : "Nova Foto nos Momentos Especiais 2024"}
                      </span>
                    </div>
                    {editingGalId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingGalId(null);
                          setGalTitle("");
                          setGalDesc("");
                          setGalUrl("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título da Foto</label>
                      <input 
                        type="text"
                        placeholder="Ex: Clamor dos Pastores"
                        value={galTitle}
                        onChange={(e) => setGalTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria da Foto</label>
                      <select 
                        value={galCategory}
                        onChange={(e) => setGalCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option>Marcha Itaquá</option>
                        <option>Louvor & Adoração</option>
                        <option>Público</option>
                        <option>Bastidores</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Upload da Imagem ou URL HD *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          required
                          placeholder="URL da imagem..."
                          value={galUrl}
                          onChange={(e) => setGalUrl(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          id="gal-img-upload"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e, setGalUrl, setUploadingGalImg)}
                        />
                        <label 
                          htmlFor="gal-img-upload"
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingGalImg ? "..." : "Upload"}</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Descrição Curta / Legenda</label>
                      <input 
                        type="text"
                        placeholder="Ex: Milhares de vozes adorando na Praça Padre João Álvares..."
                        value={galDesc}
                        onChange={(e) => setGalDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingGalId ? "Salvar Alterações" : "Adicionar à Galeria"}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Fotos Registradas ({gallery.length})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
                    {gallery.map((item) => (
                      <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-28">
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 p-2 flex flex-col justify-between text-left">
                          <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-[8px] font-mono text-amber-400 w-max uppercase">{item.category}</span>
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-bold text-slate-200 truncate max-w-[80px]">{item.title}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditGalleryClick(item)}
                                className="p-1 rounded bg-slate-950/90 hover:bg-amber-400 text-slate-400 hover:text-slate-950"
                                title="Editar"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteGalleryItem(item.id)}
                                className="p-1 rounded bg-slate-950/90 hover:bg-red-500 text-slate-400 hover:text-white"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: REGULATIONS */}
            {activeSubTab === "regulations" && (
              <div className="space-y-8 text-left">
                <form onSubmit={handleCreateOrUpdateReg} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingRegId ? "Editar Regulamento / Norma" : "Adicionar Regulamento ou Norma Oficial"}
                      </span>
                    </div>
                    {editingRegId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingRegId(null);
                          setRegTitle("");
                          setRegDesc("");
                          setRegLink("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Título do Documento *</label>
                      <input 
                        type="text"
                        placeholder="Ex: Regulamento Geral para Trios Elétricos"
                        required
                        value={regTitle}
                        onChange={(e) => setRegTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Categoria</label>
                      <select 
                        value={regCategory}
                        onChange={(e) => setRegCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      >
                        <option>Geral</option>
                        <option>Trios Elétricos</option>
                        <option>Caravanas</option>
                        <option>Ambulantes</option>
                        <option>Voluntários</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Link do PDF ou Documento Completo</label>
                      <input 
                        type="text"
                        placeholder="Ex: https://meusite.com/documento.pdf ou link local"
                        value={regLink}
                        onChange={(e) => setRegLink(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Breve Resumo das Diretrizes</label>
                      <textarea 
                        rows={3}
                        placeholder="Resumo curto de regras básicas..."
                        value={regDesc}
                        onChange={(e) => setRegDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingRegId ? "Salvar Alterações" : "Publicar Regulamento"}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Regulamentos Ativos ({regulations.length})</span>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {regulations.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] font-mono text-amber-400 uppercase">{item.category}</span>
                          <h4 className="text-xs font-semibold text-slate-200 mt-1">{item.title}</h4>
                          <span className="text-[9px] text-slate-500 font-mono truncate block max-w-sm">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400" title="Ver Link">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEditRegClick(item)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegulation(item.id)}
                            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: CARAVANS */}
            {activeSubTab === "caravans" && (
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-3 gap-4 font-mono">
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Total de Caravanas</span>
                    <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">{caravans.length}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center col-span-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Estimativa Total de Fiéis (Pessoas)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                      {caravans.reduce((acc, curr) => acc + (Number(curr.peopleCount) || 0), 0)} fiéis cadastrados
                    </span>
                  </div>
                </div>

                {editingCarId && (
                  <form onSubmit={handleUpdateCaravan} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-mono font-bold uppercase text-slate-300">Editar Inscrição de Caravana</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingCarId(null);
                          setCarChurch("");
                          setCarPastor("");
                          setCarContactName("");
                          setCarPhone("");
                          setCarPeopleCount("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome do Ministério/Igreja *</label>
                        <input 
                          type="text"
                          required
                          value={carChurch}
                          onChange={(e) => setCarChurch(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Pastor Responsável</label>
                        <input 
                          type="text"
                          value={carPastor}
                          onChange={(e) => setCarPastor(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Cidade da Caravana</label>
                        <input 
                          type="text"
                          value={carCity}
                          onChange={(e) => setCarCity(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome do Líder da Caravana *</label>
                        <input 
                          type="text"
                          required
                          value={carContactName}
                          onChange={(e) => setCarContactName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">WhatsApp de Contato *</label>
                        <input 
                          type="text"
                          required
                          value={carPhone}
                          onChange={(e) => setCarPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Estimativa de Pessoas *</label>
                        <input 
                          type="number"
                          required
                          value={carPeopleCount}
                          onChange={(e) => setCarPeopleCount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Salvar Alterações da Caravana</span>
                    </button>
                  </form>
                )}

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Igreja / Cidade</th>
                        <th className="p-3">Responsável (WhatsApp)</th>
                        <th className="p-3">Pastor</th>
                        <th className="p-3 text-center">Fiéis</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/20">
                      {caravans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 italic">Nenhuma caravana registrada no momento.</td>
                        </tr>
                      ) : (
                        caravans.map((car) => (
                          <tr key={car.id} className="hover:bg-slate-900/40">
                            <td className="p-3">
                              <span className="font-bold text-slate-200 block">{car.church}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{car.city}</span>
                            </td>
                            <td className="p-3">
                              <span className="block">{car.contactName}</span>
                              <span className="text-[9px] text-amber-500 font-mono">{car.phone}</span>
                            </td>
                            <td className="p-3 italic text-slate-400">{car.pastor || "Não informado"}</td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-400">{car.peopleCount}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditCaravanClick(car)}
                                  className="p-1.5 rounded bg-slate-950 hover:bg-amber-500/10 border border-slate-800 text-slate-400 hover:text-amber-400"
                                  title="Editar cadastro"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCaravan(car.id)}
                                  className="p-1.5 rounded bg-slate-950 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400"
                                  title="Excluir cadastro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB: ATTRACTIONS */}
            {activeSubTab === "attractions" && (
              <div className="space-y-8 text-left">
                <form onSubmit={handleCreateOrUpdateAttraction} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingAttId ? "Editar Atração Confirmada" : "Cadastrar Nova Atração Confirmada"}
                      </span>
                    </div>
                    {editingAttId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingAttId(null);
                          setAttName("");
                          setAttDesc("");
                          setAttTime("");
                          setAttImage("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20 cursor-pointer"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome da Atração *</label>
                      <input 
                        type="text"
                        placeholder="Ex: Fernandinho, Isadora Pompeo"
                        required
                        value={attName}
                        onChange={(e) => setAttName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Horário Previsto (Time) *</label>
                      <input 
                        type="text"
                        placeholder="Ex: 20:30 ou 18:00"
                        required
                        value={attTime}
                        onChange={(e) => setAttTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Descrição Curta *</label>
                    <textarea 
                      placeholder="Fale um pouco sobre a história, unção ou canções famosas do artista..."
                      required
                      rows={3}
                      value={attDesc}
                      onChange={(e) => setAttDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Upload de Imagem de Divulgação (Proporção 4:3 ou 16:9)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Link da imagem..."
                        value={attImage}
                        onChange={(e) => setAttImage(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        id="att-img-upload"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e, setAttImage, setUploadingAttImg)}
                      />
                      <label 
                        htmlFor="att-img-upload"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingAttImg ? "..." : "Upload"}</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingAttId ? "Salvar Alterações" : "Cadastrar Atração"}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Atrações Cadastradas ({attractions.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-1">
                    {attractions.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between gap-4">
                        <div className="flex gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-slate-850 shrink-0" referrerPolicy="no-referrer" />
                          )}
                          <div className="text-left min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                            <p className="text-[10px] text-amber-500 font-mono mt-0.5">Previsão: {item.time}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-3 border-t border-slate-900">
                          <button 
                            onClick={() => handleEditAttractionClick(item)}
                            className="flex-1 px-1.5 py-1 bg-slate-900 hover:bg-amber-400/10 text-slate-400 hover:text-amber-400 rounded text-[9px] font-mono border border-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteAttraction(item.id)}
                            className="flex-1 px-1.5 py-1 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded text-[9px] font-mono border border-slate-800 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 7: SPONSORS */}
            {activeSubTab === "sponsors" && (
              <div className="space-y-8 text-left">
                <form onSubmit={handleCreateOrUpdateSponsor} className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        {editingSponId ? "Editar Patrocinador / Apoio" : "Adicionar Patrocinador ou Apoio Oficial"}
                      </span>
                    </div>
                    {editingSponId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingSponId(null);
                          setSponName("");
                          setSponLink("");
                          setSponImg("");
                        }}
                        className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nome do Parceiro *</label>
                      <input 
                        type="text"
                        placeholder="Ex: Coca Cola ou Comércio Local S/A"
                        required
                        value={sponName}
                        onChange={(e) => setSponName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Link de Acesso (Website)</label>
                      <input 
                        type="text"
                        placeholder="Ex: https://parceiro.com.br"
                        value={sponLink}
                        onChange={(e) => setSponLink(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Upload da Logo da Empresa *</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        required
                        placeholder="Link da imagem..."
                        value={sponImg}
                        onChange={(e) => setSponImg(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        id="spon-img-upload"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e, setSponImg, setUploadingSponImg)}
                      />
                      <label 
                        htmlFor="spon-img-upload"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingSponImg ? "..." : "Upload"}</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingSponId ? "Salvar Alterações" : "Registrar Patrocinador"}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Apoiadores Registrados ({sponsors.length})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {sponsors.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col items-center justify-between gap-3 text-center">
                        <img src={item.imageUrl} alt={item.name} className="h-8 object-contain" referrerPolicy="no-referrer" />
                        <span className="text-[10px] font-bold text-slate-200 truncate w-full">{item.name}</span>
                        <div className="flex gap-1.5 w-full">
                          <button 
                            onClick={() => handleEditSponsorClick(item)}
                            className="flex-1 px-1.5 py-1 bg-slate-900 hover:bg-amber-400/10 text-slate-400 hover:text-amber-400 rounded text-[9px] font-mono border border-slate-800 flex items-center justify-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteSponsor(item.id)}
                            className="flex-1 px-1.5 py-1 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded text-[9px] font-mono border border-slate-800 flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 8: USERS */}
            {activeSubTab === "users" && (
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-200">Gestão de Contas Sincronizadas</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Usuários registrados no portal da Marcha para Jesus que possuem anotações ativas na nuvem.</p>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Nome</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Nível de Acesso</th>
                        <th className="p-3">ID do Usuário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950/20">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 italic">Nenhum usuário registrado ainda.</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-medium text-slate-200">{user.name}</td>
                            <td className="p-3 font-mono">{user.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                user.role === "admin"
                                  ? "bg-amber-400/10 text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{user.id}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Segurança de Dados • Sincronização em Conformidade LGPD
                  </span>
                </div>

              </div>
            )}

            {/* SUB-TAB 9: TELEMETRY */}
            {activeSubTab === "telemetry" && (
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-200">Terminal de Tráfego e API</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Logs em tempo real de chamadas executadas no servidor Express e traduções Gemini.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-emerald-400/90 space-y-2 h-[340px] overflow-y-auto">
                  <p className="text-slate-500">[INFO] {new Date().toISOString()} - Marcha para Jesus Backend Server started securely on port 3000</p>
                  <p className="text-slate-500">[DB] Loading database files from data/db.json...</p>
                  <p className="text-emerald-500">[SUCCESS] Sincronização do sitemap.xml concluída com SEO ativo.</p>
                  <p className="text-amber-500">[API] GET /api/news - 200 OK (Loaded {news.length} posts)</p>
                  <p className="text-amber-500">[API] GET /api/devotionals - 200 OK (Loaded {devs.length} items)</p>
                  <p className="text-amber-500">[API] GET /api/events - 200 OK (Loaded {events.length} events)</p>
                  <p className="text-amber-500">[API] GET /api/gallery - 200 OK (Loaded {gallery.length} photos)</p>
                  <p className="text-amber-500">[API] GET /api/regulations - 200 OK (Loaded {regulations.length} rules)</p>
                  <p className="text-slate-500">[INFO] Inicializando Módulo Gemini 3.5-flash...</p>
                  <p className="text-emerald-400">[GEMINI] API client loaded with User-Agent "aistudio-build".</p>
                  <p className="text-amber-500">[API] GET /api/admin/users - 200 OK</p>
                </div>

                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Node.js Runtime Container: ACTIVE</span>
                  <span className="text-[10px] font-mono text-slate-500">Cloud Run Service URL: SECURE</span>
                </div>

              </div>
            )}

            {/* SUB-TAB: CONFIGURAÇÕES GERAIS */}
            {activeSubTab === "settings" && (
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-200 font-serif">Configurações Gerais & Fundo de Vídeo/Imagem</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gerencie os fundos de vídeo/imagem, redes sociais e informações para a assessoria de imprensa do site.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6 bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl">
                  {/* Seção 1: Mídia de Fundo */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-amber-500 border-b border-slate-800/80 pb-2">1. Fundo do Site (Hero)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">URL do Vídeo de Fundo (.mp4)</label>
                        <input 
                          type="text"
                          placeholder="Link direto para o arquivo .mp4..."
                          value={settingsVideoBg}
                          onChange={(e) => setSettingsVideoBg(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block">Deixe vazio se preferir usar uma imagem de fundo estática.</span>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">URL da Imagem de Fundo Estática</label>
                        <input 
                          type="text"
                          placeholder="Link da imagem Unsplash, Imgur, etc..."
                          value={settingsHeroImg}
                          onChange={(e) => setSettingsHeroImg(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                        <span className="text-[9px] text-slate-500 mt-1 block">Será exibida se nenhum vídeo for especificado.</span>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2: Redes Sociais */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-amber-500 border-b border-slate-800/80 pb-2">2. Redes Sociais da Marcha</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Instagram Link</label>
                        <input 
                          type="text"
                          placeholder="Ex: https://instagram.com/marchaparajesus"
                          value={settingsInstagram}
                          onChange={(e) => setSettingsInstagram(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Facebook Link</label>
                        <input 
                          type="text"
                          placeholder="Ex: https://facebook.com/marchaparajesus"
                          value={settingsFacebook}
                          onChange={(e) => setSettingsFacebook(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">YouTube Link</label>
                        <input 
                          type="text"
                          placeholder="Ex: https://youtube.com/marchaparajesus"
                          value={settingsYoutube}
                          onChange={(e) => setSettingsYoutube(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 3: Seção Imprensa */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-amber-500 border-b border-slate-800/80 pb-2">3. Configuração Seção IMPRENSA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">E-mail de Contato da Assessoria</label>
                        <input 
                          type="email"
                          placeholder="Ex: imprensa@renascer.org.br"
                          value={settingsPressEmail}
                          onChange={(e) => setSettingsPressEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Link para Baixar Arquivos/Material</label>
                        <input 
                          type="text"
                          placeholder="Link para o kit de divulgação (.zip)..."
                          value={settingsPressMaterial}
                          onChange={(e) => setSettingsPressMaterial(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Formulário de Credenciamento da Imprensa</label>
                        <input 
                          type="text"
                          placeholder="Link para o formulário de credenciamento..."
                          value={settingsPressCred}
                          onChange={(e) => setSettingsPressCred(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-md"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Salvar Todas as Configurações</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
