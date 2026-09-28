import { 
  NewsPost, Devotional, PersonalNote, User, DailyVerse, AgendaEvent, GalleryItem, 
  Regulation, Caravan, Sponsor, SiteSettings, Attraction,
  VideoYoutube, ProductCategory, Product, ClosedLesson,
  Member, FinancialTransaction, StoreOrder, FinancialDashboardData, PublicTransparencyData,
  MediaList, MediaUsage
} from "../types";

// Token CSRF para requisições de escrita (POST/PUT/DELETE) via fetch
function csrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? (meta as HTMLMetaElement).content : "";
}

async function jsonRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (options.method && options.method !== "GET") {
    headers["X-CSRF-TOKEN"] = csrfToken();
  }
  return fetch(url, { ...options, headers });
}

// Desembrulha o envelope padrão dos API Resources ({ data: ... } -> ...)
async function unwrap<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Expected JSON but got ${contentType} from ${res.url}`);
  }
  const data = await res.json();
  if (data && typeof data === "object" && "data" in data) {
    return data.data as T;
  }
  return data as T;
}

export async function fetchNews(): Promise<NewsPost[]> {
  try {
    const res = await jsonRequest("/api/noticias");
    if (!res.ok) throw new Error("Failed to fetch news");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createNews(post: Partial<NewsPost>): Promise<NewsPost> {
  const res = await jsonRequest("/admin/noticias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: post.title,
      conteudo: post.content,
      categoria: post.category,
      imagem: post.image || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create news");
  return await unwrap(res);
}

export async function deleteNews(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/noticias/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function likeNews(id: string): Promise<number> {
  const res = await jsonRequest(`/api/noticias/${id}/curtir`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like news");
  const data = await res.json();
  return data.curtidas ?? data.likes;
}

export async function addNewsComment(id: string, comment: { author: string; content: string }): Promise<any> {
  const res = await jsonRequest(`/api/noticias/${id}/comentar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ autor: comment.author, conteudo: comment.content }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  const data = await res.json();
  return {
    id: data.id,
    author: data.autor,
    content: data.conteudo,
    date: data.created_at,
  };
}

export async function fetchDevotionals(): Promise<Devotional[]> {
  try {
    const res = await jsonRequest("/api/devocionais");
    if (!res.ok) throw new Error("Failed to fetch devotionals");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createDevotional(devotional: Partial<Devotional>): Promise<Devotional> {
  const res = await jsonRequest("/admin/devocionais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: devotional.title,
      conteudo: devotional.content,
      escritura: devotional.scripture,
      categoria: devotional.category,
    }),
  });
  if (!res.ok) throw new Error("Failed to create devotional");
  return await unwrap(res);
}

export async function deleteDevotional(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/devocionais/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function fetchNotes(userId: string): Promise<PersonalNote[]> {
  try {
    const res = await jsonRequest("/api/notas");
    if (!res.ok) throw new Error("Failed to fetch notes");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function saveNote(note: Partial<PersonalNote>): Promise<PersonalNote> {
  const payload = JSON.stringify({ 
    titulo: note.title, 
    conteudo: note.content,
    categoria: note.category,
    cor: note.color,
    fixado: note.isPinned
  });
  if (note.id) {
    const res = await jsonRequest(`/api/notas/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    if (!res.ok) throw new Error("Failed to update note");
    return await unwrap(res);
  }
  const res = await jsonRequest("/api/notas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });
  if (!res.ok) throw new Error("Failed to save note");
  return await unwrap(res);
}

export async function deleteNote(userId: string, noteId: string): Promise<boolean> {
  const res = await jsonRequest(`/api/notas/${noteId}`, { method: "DELETE" });
  return res.ok;
}

export async function fetchDailyVerse(): Promise<DailyVerse> {
  try {
    const res = await jsonRequest("/api/daily-verse");
    if (!res.ok) throw new Error("Failed to fetch daily verse");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return {
      verse: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
      reference: "Salmo 119:105",
      reflection: "A Palavra de Deus nos guia a cada passo precioso de nossa jornada espiritual."
    };
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const res = await jsonRequest("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage }),
    });
    if (!res.ok) throw new Error("Failed to translate text");
    const data = await res.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translation failed, returning original:", error);
    return text;
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const res = await jsonRequest("/admin/usuarios");
    if (!res.ok) throw new Error("Failed to fetch users");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateUser(
  id: string | number, 
  data: { role?: string; name?: string; email?: string; password?: string }
): Promise<User> {
  const res = await jsonRequest(`/admin/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await unwrap(res);
}

export async function deleteUser(id: string | number): Promise<boolean> {
  const res = await jsonRequest(`/admin/usuarios/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function editNews(id: string, post: Partial<NewsPost>): Promise<NewsPost> {
  const res = await jsonRequest(`/admin/noticias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: post.title,
      conteudo: post.content,
      categoria: post.category,
      imagem: post.image ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit news");
  return await unwrap(res);
}

export async function uploadImage(base64: string, filename: string, pasta?: string): Promise<string> {
  const res = await jsonRequest("/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, nome: filename, pasta }),
  });
  if (!res.ok) throw new Error("Failed to upload image");
  const data = await res.json();
  return data.url;
}

export async function uploadFile(file: File, pasta?: string): Promise<string> {
  const formData = new FormData();
  formData.append("arquivo", file);
  if (pasta) formData.append("pasta", pasta);

  const res = await fetch("/admin/upload", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": csrfToken()
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload file");
  const data = await res.json();
  return data.url;
}

export async function uploadMultipleFiles(files: File[], pasta?: string): Promise<string[]> {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("arquivos[]", files[i]);
  }
  if (pasta) formData.append("pasta", pasta);

  const res = await fetch("/admin/upload/lote", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": csrfToken()
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Falha no upload em lote");
  }

  const data = await res.json();
  return data.urls || [];
}

// Midias (gerenciador de midias do site)

// Lista as midias por pasta, com busca, paginacao e aviso de uso
export async function fetchMedias(pasta?: string, busca?: string, pagina: number = 1): Promise<MediaList> {
  const params = new URLSearchParams();
  if (pasta) params.append("pasta", pasta);
  if (busca) params.append("busca", busca);
  params.append("pagina", String(pagina));

  const res = await fetch(`/admin/midias?${params.toString()}`, {
    headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
  });

  if (!res.ok) throw new Error("Falha ao listar midias");
  return await res.json();
}

// Renomeia a midia (o backend corrige as URLs que apontam para ela)
export async function renameMedia(caminho: string, novoNome: string): Promise<{ message: string; url: string; referencias_atualizadas: number }> {
  const res = await jsonRequest("/admin/midias/renomear", {
    method: "PUT",
    body: JSON.stringify({ caminho, novo_nome: novoNome }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.errors?.novo_nome?.[0] || "Falha ao renomear midia");
  }
  return data;
}

// Apaga a midia (bloqueia se estiver em uso, a menos que confirme)
export async function deleteMedia(caminho: string, confirmar: boolean = false): Promise<{ message: string; em_uso: MediaUsage[]; sem_imagem: string[] }> {
  const res = await fetch("/admin/midias", {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-TOKEN": csrfToken()
    },
    body: JSON.stringify({ caminho, confirmar }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const erro: any = new Error(data?.error || "Falha ao excluir midia");
    erro.emUso = data?.em_uso || [];
    throw erro;
  }
  return data;
}

// Events (Agenda)
export async function fetchEvents(): Promise<AgendaEvent[]> {
  try {
    const res = await jsonRequest("/api/eventos");
    if (!res.ok) throw new Error("Failed to fetch events");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createEvent(event: Partial<AgendaEvent>): Promise<AgendaEvent> {
  const res = await jsonRequest("/admin/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: event.title,
      descricao: event.description,
      local: event.location,
      data_hora: event.dateTime,
      recorrencia: event.recurrence || "nenhuma",
      destaque_especial: event.isFeatured ?? false,
      imagem: event.image || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return await unwrap(res);
}

export async function editEvent(id: string, event: Partial<AgendaEvent>): Promise<AgendaEvent> {
  const res = await jsonRequest(`/admin/eventos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: event.title,
      descricao: event.description,
      local: event.location,
      data_hora: event.dateTime,
      recorrencia: event.recurrence,
      destaque_especial: event.isFeatured,
      imagem: event.image ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit event");
  return await unwrap(res);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/eventos/${id}`, { method: "DELETE" });
  return res.ok;
}

// Gallery
export async function fetchGallery(): Promise<GalleryItem[]> {
  try {
    const res = await jsonRequest("/api/galeria");
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await jsonRequest("/admin/galeria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: item.title,
      descricao: item.description,
      url: item.url,
      categoria: item.category,
    }),
  });
  if (!res.ok) throw new Error("Failed to create gallery item");
  return await unwrap(res);
}

export async function createGalleryBatch(data: {
  categoria: string;
  titulo_padrao?: string;
  descricao_padrao?: string;
  fotos: Array<{ url: string; titulo?: string; descricao?: string }>;
}): Promise<GalleryItem[]> {
  const res = await jsonRequest("/admin/galeria/lote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Falha ao criar fotos em lote");
  }

  const json = await res.json();
  return json.data || [];
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/galeria/${id}`, { method: "DELETE" });
  return res.ok;
}

// Regulations
export async function fetchRegulations(): Promise<Regulation[]> {
  try {
    const res = await jsonRequest("/api/regulamentos");
    if (!res.ok) throw new Error("Failed to fetch regulations");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createRegulation(reg: Partial<Regulation>): Promise<Regulation> {
  const res = await jsonRequest("/admin/regulamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: reg.title,
      descricao: reg.description,
      categoria: reg.category,
      link: reg.link || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create regulation");
  return await unwrap(res);
}

export async function deleteRegulation(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/regulamentos/${id}`, { method: "DELETE" });
  return res.ok;
}

// Caravans
export async function fetchCaravans(): Promise<Caravan[]> {
  try {
    const res = await jsonRequest("/admin/caravanas");
    if (!res.ok) throw new Error("Failed to fetch caravans");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCaravan(car: Partial<Caravan>): Promise<Caravan> {
  const res = await jsonRequest("/api/caravanas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      igreja: car.church,
      pastor: car.pastor,
      nome_responsavel: car.contactName,
      telefone: car.phone,
      quantidade_pessoas: car.peopleCount || 0,
      cidade: car.city,
    }),
  });
  if (!res.ok) throw new Error("Failed to create caravan");
  return await unwrap(res);
}

export async function deleteCaravan(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/caravanas/${id}`, { method: "DELETE" });
  return res.ok;
}

// Sponsors
export async function fetchSponsors(): Promise<Sponsor[]> {
  try {
    const res = await jsonRequest("/api/patrocinadores");
    if (!res.ok) throw new Error("Failed to fetch sponsors");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createSponsor(spon: Partial<Sponsor>): Promise<Sponsor> {
  const res = await jsonRequest("/admin/patrocinadores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: spon.name,
      url_imagem: spon.imageUrl,
      link: spon.link || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create sponsor");
  return await unwrap(res);
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/patrocinadores/${id}`, { method: "DELETE" });
  return res.ok;
}

// Settings APIs
export async function fetchSettings(): Promise<SiteSettings> {
  const res = await jsonRequest("/api/configuracoes");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return await unwrap(res);
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await jsonRequest("/admin/configuracoes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url_video_fundo: settings.videoBackgroundUrl,
      url_imagem_hero: settings.heroImageUrl,
      fundo_tamanho: settings.backgroundSize,
      fundo_posicao: settings.backgroundPosition,
      fundo_opacidade: settings.backgroundOpacity,
      fundo_escala: settings.backgroundScale,
      fundo_escurecimento: settings.backgroundDarkness,
      logo_url: settings.logoUrl,
      secoes_ativas: settings.activeSections,
      url_instagram: settings.instagramUrl,
      url_facebook: settings.facebookUrl,
      url_youtube: settings.youtubeUrl,
      whatsapp_loja: settings.whatsappLoja,
      whatsapp_flutuante: settings.whatsappFlutuante,
      mensagem_whatsapp_flutuante: settings.mensagemWhatsappFlutuante,
      email_imprensa: settings.pressEmail,
      link_material_imprensa: settings.pressMaterialLink,
      link_credencial_imprensa: settings.pressCredLink,
      titulo_site: settings.seoTitle,
      meta_description: settings.seoDescription,
      palavras_chave: settings.seoKeywords,
      imagem_og: settings.seoOgImage,
      twitter_site: settings.seoTwitterSite,
      noticias_api_url: settings.noticiasApiUrl,
      noticias_api_key: settings.noticiasApiKey,
      telefone: settings.contactPhone,
      endereco_rua: settings.addressStreet,
      endereco_numero: settings.addressNumber,
      endereco_bairro: settings.addressNeighborhood,
      endereco_cidade: settings.addressCity,
      endereco_estado: settings.addressState,
      endereco_cep: settings.addressZip,
    }),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return await unwrap(res);
}

// Edit Devotional
export async function editDevotional(id: string, dev: Partial<Devotional>): Promise<Devotional> {
  const res = await jsonRequest(`/admin/devocionais/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: dev.title,
      conteudo: dev.content,
      escritura: dev.scripture,
      categoria: dev.category,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit devotional");
  return await unwrap(res);
}

// Edit Gallery Item
export async function editGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await jsonRequest(`/admin/galeria/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: item.title,
      descricao: item.description,
      url: item.url,
      categoria: item.category,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit gallery item");
  return await unwrap(res);
}

// Edit Regulation
export async function editRegulation(id: string, reg: Partial<Regulation>): Promise<Regulation> {
  const res = await jsonRequest(`/admin/regulamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: reg.title,
      descricao: reg.description,
      categoria: reg.category,
      link: reg.link ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit regulation");
  return await unwrap(res);
}

// Edit Caravan
export async function editCaravan(id: string, car: Partial<Caravan>): Promise<Caravan> {
  const res = await jsonRequest(`/admin/caravanas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      igreja: car.church,
      pastor: car.pastor,
      nome_responsavel: car.contactName,
      telefone: car.phone,
      quantidade_pessoas: car.peopleCount || 0,
      cidade: car.city,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit caravan");
  return await unwrap(res);
}

// Edit Sponsor
export async function editSponsor(id: string, spon: Partial<Sponsor>): Promise<Sponsor> {
  const res = await jsonRequest(`/admin/patrocinadores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: spon.name,
      url_imagem: spon.imageUrl,
      link: spon.link ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit sponsor");
  return await unwrap(res);
}

// Attractions
export async function fetchAttractions(): Promise<Attraction[]> {
  try {
    const res = await jsonRequest("/api/atracoes");
    if (!res.ok) throw new Error("Failed to fetch attractions");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createAttraction(attraction: Partial<Attraction>): Promise<Attraction> {
  const res = await jsonRequest("/admin/atracoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: attraction.name,
      descricao: attraction.description,
      horario: attraction.time,
      imagem: attraction.image || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create attraction");
  return await unwrap(res);
}

export async function editAttraction(id: string, attraction: Partial<Attraction>): Promise<Attraction> {
  const res = await jsonRequest(`/admin/atracoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: attraction.name,
      descricao: attraction.description,
      horario: attraction.time,
      imagem: attraction.image ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to edit attraction");
  return await unwrap(res);
}

export async function deleteAttraction(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/atracoes/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// YOUTUBE VIDEOS APIs
// ==========================================
export async function fetchYoutubeVideos(): Promise<VideoYoutube[]> {
  try {
    const res = await jsonRequest("/api/videos-youtube");
    if (!res.ok) throw new Error("Failed to fetch youtube videos");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createYoutubeVideo(video: Partial<VideoYoutube>): Promise<VideoYoutube> {
  const res = await jsonRequest("/admin/videos-youtube", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: video.title,
      url_ou_id: video.urlOrId,
      descricao: video.description,
      categoria: video.category || "Geral",
      destaque: video.isFeatured ?? false,
      ordem: video.order ?? 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to create youtube video");
  return await unwrap(res);
}

export async function updateYoutubeVideo(id: string, video: Partial<VideoYoutube>): Promise<VideoYoutube> {
  const res = await jsonRequest(`/admin/videos-youtube/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: video.title,
      url_ou_id: video.urlOrId,
      descricao: video.description,
      categoria: video.category,
      destaque: video.isFeatured,
      ordem: video.order,
    }),
  });
  if (!res.ok) throw new Error("Failed to update youtube video");
  return await unwrap(res);
}

export async function deleteYoutubeVideo(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/videos-youtube/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// STORE (LOJA) APIs
// ==========================================
export async function fetchProducts(params?: { category_id?: string; featured?: boolean }): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category_id) query.append("categoria_id", params.category_id);
    if (params?.featured) query.append("destaque", "1");
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await jsonRequest(`/api/produtos${qs}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  try {
    const res = await jsonRequest("/api/categorias-produtos");
    if (!res.ok) throw new Error("Failed to fetch product categories");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createProductCategory(cat: { nome: string; descricao?: string }): Promise<ProductCategory> {
  const res = await jsonRequest("/admin/categorias-produtos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cat),
  });
  if (!res.ok) throw new Error("Failed to create product category");
  return await unwrap(res);
}

export async function deleteProductCategory(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/categorias-produtos/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function createProduct(prod: Partial<Product>): Promise<Product> {
  const res = await jsonRequest("/admin/produtos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: prod.name,
      categoria_id: prod.categoryId ? Number(prod.categoryId) : null,
      descricao: prod.description,
      detalhes: prod.details,
      imagem_url: prod.imageUrl,
      imagens_galeria: prod.galleryImages,
      preco: prod.price,
      preco_desconto: prod.discountPrice,
      informacoes_frete: prod.shippingInfo,
      link_compra: prod.purchaseUrl,
      em_estoque: prod.inStock ?? true,
      destaque: prod.isFeatured ?? false,
    }),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return await unwrap(res);
}

export async function updateProduct(id: string, prod: Partial<Product>): Promise<Product> {
  const res = await jsonRequest(`/admin/produtos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: prod.name,
      categoria_id: prod.categoryId ? Number(prod.categoryId) : null,
      descricao: prod.description,
      detalhes: prod.details,
      imagem_url: prod.imageUrl,
      imagens_galeria: prod.galleryImages,
      preco: prod.price,
      preco_desconto: prod.discountPrice,
      informacoes_frete: prod.shippingInfo,
      link_compra: prod.purchaseUrl,
      em_estoque: prod.inStock,
      destaque: prod.isFeatured,
    }),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return await unwrap(res);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/produtos/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// CLOSED LESSONS (AULAS FECHADAS) APIs
// ==========================================
export async function fetchClosedLessons(): Promise<ClosedLesson[]> {
  try {
    const res = await jsonRequest("/api/aulas");
    if (!res.ok) throw new Error("Failed to fetch closed lessons");
    return await unwrap(res);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createClosedLesson(lesson: Partial<ClosedLesson>): Promise<ClosedLesson> {
  const res = await jsonRequest("/admin/aulas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modulo: lesson.module || "Módulo 1 - Discipulado & Fundamentos",
      titulo: lesson.title,
      descricao: lesson.description,
      url_video: lesson.videoUrl,
      duracao: lesson.duration,
      material_url: lesson.materialUrl,
      ordem: lesson.order ?? 0,
      ativo: lesson.active ?? true,
    }),
  });
  if (!res.ok) throw new Error("Failed to create closed lesson");
  return await unwrap(res);
}

export async function updateClosedLesson(id: string, lesson: Partial<ClosedLesson>): Promise<ClosedLesson> {
  const res = await jsonRequest(`/admin/aulas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modulo: lesson.module,
      titulo: lesson.title,
      descricao: lesson.description,
      url_video: lesson.videoUrl,
      duracao: lesson.duration,
      material_url: lesson.materialUrl,
      ordem: lesson.order,
      ativo: lesson.active,
    }),
  });
  if (!res.ok) throw new Error("Failed to update closed lesson");
  return await unwrap(res);
}

export async function deleteClosedLesson(id: string): Promise<boolean> {
  const res = await jsonRequest(`/admin/aulas/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// MEMBROS (CHURCH MEMBERS) APIs
// ==========================================
export async function fetchMembers(filters?: { busca?: string; cargo?: string; status?: string }): Promise<Member[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.busca) params.append("busca", filters.busca);
    if (filters?.cargo) params.append("cargo", filters.cargo);
    if (filters?.status) params.append("status", filters.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await jsonRequest(`/admin/membros${query}`);
    if (!res.ok) throw new Error("Failed to fetch members");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMemberDetails(id: number): Promise<{ membro: Member; totais: { dizimos: number; ofertas: number; geral: number } } | null> {
  try {
    const res = await jsonRequest(`/admin/membros/${id}`);
    if (!res.ok) throw new Error("Failed to fetch member details");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createMember(member: Partial<Member>): Promise<Member> {
  const res = await jsonRequest("/admin/membros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error("Failed to create member");
  return await res.json();
}

export async function updateMember(id: number, member: Partial<Member>): Promise<Member> {
  const res = await jsonRequest(`/admin/membros/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return await res.json();
}

export async function deleteMember(id: number): Promise<boolean> {
  const res = await jsonRequest(`/admin/membros/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// GESTÃO FINANCEIRA (ENTRADAS, SAÍDAS, DÍZIMOS, OFERTAS)
// ==========================================
export async function fetchFinancialDashboard(periodo: 'mes_atual' | 'ano_atual' | 'tudo' = 'ano_atual'): Promise<FinancialDashboardData> {
  const res = await jsonRequest(`/admin/financeiro/dashboard?periodo=${periodo}`);
  if (!res.ok) throw new Error("Failed to fetch financial dashboard");
  return await res.json();
}

export async function fetchFinancialTransactions(filters?: {
  tipo?: string;
  categoria?: string;
  membro_id?: number;
  status?: string;
  busca?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
}): Promise<any> {
  const params = new URLSearchParams();
  if (filters?.tipo) params.append("tipo", filters.tipo);
  if (filters?.categoria) params.append("categoria", filters.categoria);
  if (filters?.membro_id) params.append("membro_id", String(filters.membro_id));
  if (filters?.status) params.append("status", filters.status);
  if (filters?.busca) params.append("busca", filters.busca);
  if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
  if (filters?.data_fim) params.append("data_fim", filters.data_fim);
  if (filters?.page) params.append("page", String(filters.page));

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await jsonRequest(`/admin/financeiro/transacoes${query}`);
  if (!res.ok) throw new Error("Failed to fetch financial transactions");
  return await res.json();
}

export async function createFinancialTransaction(transacao: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
  const res = await jsonRequest("/admin/financeiro/transacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error("Failed to create financial transaction");
  return await res.json();
}

export async function updateFinancialTransaction(id: number, transacao: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
  const res = await jsonRequest(`/admin/financeiro/transacoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transacao),
  });
  if (!res.ok) throw new Error("Failed to update financial transaction");
  return await res.json();
}

export async function deleteFinancialTransaction(id: number): Promise<boolean> {
  const res = await jsonRequest(`/admin/financeiro/transacoes/${id}`, { method: "DELETE" });
  return res.ok;
}

// ==========================================
// PEDIDOS / CLIQUES DE VENDAS DA LOJA
// ==========================================
export async function fetchStoreOrders(filters?: { status?: string; busca?: string; page?: number }): Promise<any> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.busca) params.append("busca", filters.busca);
  if (filters?.page) params.append("page", String(filters.page));
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await jsonRequest(`/admin/financeiro/pedidos-loja${query}`);
  if (!res.ok) throw new Error("Failed to fetch store orders");
  return await res.json();
}

export async function updateStoreOrderStatus(id: number, data: { status: 'pendente' | 'concluido' | 'cancelado'; membro_id?: number | null; observacoes?: string }): Promise<StoreOrder> {
  const res = await jsonRequest(`/admin/financeiro/pedidos-loja/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update store order status");
  return await res.json();
}

export async function registerStoreOrderClick(data: {
  produto_id: number;
  nome_cliente?: string;
  telefone_cliente?: string;
  origem_checkout?: string;
  quantidade?: number;
}): Promise<{ success: boolean; pedido_id: number }> {
  try {
    const res = await jsonRequest("/api/loja/pedidos/registrar-clique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to register order click");
    return await res.json();
  } catch (error) {
    console.error("Falha ao registrar clique de pedido:", error);
    return { success: false, pedido_id: 0 };
  }
}

// ==========================================
// TRANSPARÊNCIA PÚBLICA
// ==========================================
export async function fetchTransparencyData(): Promise<PublicTransparencyData> {
  const res = await jsonRequest("/api/transparencia");
  if (!res.ok) throw new Error("Failed to fetch transparency data");
  return await res.json();
}

// ==========================================
// YOUTUBE METADATA (AUTOCOMPLETE)
// ==========================================
export interface YoutubeVideoInfo {
  success: boolean;
  videoId: string;
  title: string;
  description: string;
  author?: string;
  thumbnail?: string;
  canonicalUrl?: string;
}

export async function fetchYoutubeVideoInfo(urlOrId: string): Promise<YoutubeVideoInfo | null> {
  try {
    const res = await jsonRequest(`/api/youtube/info?url=${encodeURIComponent(urlOrId)}`);
    if (!res.ok) throw new Error("Failed to fetch YouTube info");
    return await res.json();
  } catch (error) {
    console.error("Erro ao puxar dados do YouTube:", error);
    return null;
  }
}


