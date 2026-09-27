import { NewsPost, Devotional, PersonalNote, User, DailyVerse, AgendaEvent, GalleryItem, Regulation, Caravan, Sponsor, SiteSettings, Attraction } from "../types";

export async function fetchNews(): Promise<NewsPost[]> {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("Failed to fetch news");
    return await res.json();
  } catch (error) {
    console.error(error);
    // Return empty array or local fallback in case of errors
    return [];
  }
}

export async function createNews(post: Partial<NewsPost>): Promise<NewsPost> {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });
  if (!res.ok) throw new Error("Failed to create news");
  return await res.json();
}

export async function deleteNews(id: string): Promise<boolean> {
  const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function likeNews(id: string): Promise<number> {
  const res = await fetch(`/api/news/${id}/like`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to like news");
  const data = await res.json();
  return data.likes;
}

export async function addNewsComment(id: string, comment: { author: string; content: string }): Promise<any> {
  const res = await fetch(`/api/news/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comment)
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return await res.json();
}

export async function fetchDevotionals(): Promise<Devotional[]> {
  try {
    const res = await fetch("/api/devotionals");
    if (!res.ok) throw new Error("Failed to fetch devotionals");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createDevotional(devotional: Partial<Devotional>): Promise<Devotional> {
  const res = await fetch("/api/devotionals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(devotional)
  });
  if (!res.ok) throw new Error("Failed to create devotional");
  return await res.json();
}

export async function deleteDevotional(id: string): Promise<boolean> {
  const res = await fetch(`/api/devotionals/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function fetchNotes(userId: string): Promise<PersonalNote[]> {
  try {
    const res = await fetch(`/api/notes/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function saveNote(note: Partial<PersonalNote>): Promise<PersonalNote> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note)
  });
  if (!res.ok) throw new Error("Failed to save note");
  return await res.json();
}

export async function deleteNote(userId: string, noteId: string): Promise<boolean> {
  const res = await fetch(`/api/notes/${userId}/${noteId}`, { method: "DELETE" });
  return res.ok;
}

export async function fetchDailyVerse(): Promise<DailyVerse> {
  try {
    const res = await fetch("/api/daily-verse");
    if (!res.ok) throw new Error("Failed to fetch daily verse");
    return await res.json();
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
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage })
    });
    if (!res.ok) throw new Error("Failed to translate text");
    const data = await res.json();
    return data.translatedText;
  } catch (error) {
    console.error("Translation failed, returning original:", error);
    return text;
  }
}

export async function loginUser(email: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Failed to login");
  const data = await res.json();
  return data.user;
}

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const res = await fetch("/api/admin/users");
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function editNews(id: string, post: Partial<NewsPost>): Promise<NewsPost> {
  const res = await fetch(`/api/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });
  if (!res.ok) throw new Error("Failed to edit news");
  return await res.json();
}

export async function uploadImage(base64: string, filename: string): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, filename })
  });
  if (!res.ok) throw new Error("Failed to upload image");
  const data = await res.json();
  return data.url;
}

// Events (Agenda)
export async function fetchEvents(): Promise<AgendaEvent[]> {
  try {
    const res = await fetch("/api/events");
    if (!res.ok) throw new Error("Failed to fetch events");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createEvent(event: Partial<AgendaEvent>): Promise<AgendaEvent> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  if (!res.ok) throw new Error("Failed to create event");
  return await res.json();
}

export async function editEvent(id: string, event: Partial<AgendaEvent>): Promise<AgendaEvent> {
  const res = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  if (!res.ok) throw new Error("Failed to edit event");
  return await res.json();
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
  return res.ok;
}

// Gallery
export async function fetchGallery(): Promise<GalleryItem[]> {
  try {
    const res = await fetch("/api/gallery");
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to create gallery item");
  return await res.json();
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
  return res.ok;
}

// Regulations
export async function fetchRegulations(): Promise<Regulation[]> {
  try {
    const res = await fetch("/api/regulations");
    if (!res.ok) throw new Error("Failed to fetch regulations");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createRegulation(reg: Partial<Regulation>): Promise<Regulation> {
  const res = await fetch("/api/regulations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reg)
  });
  if (!res.ok) throw new Error("Failed to create regulation");
  return await res.json();
}

export async function deleteRegulation(id: string): Promise<boolean> {
  const res = await fetch(`/api/regulations/${id}`, { method: "DELETE" });
  return res.ok;
}

// Caravans
export async function fetchCaravans(): Promise<Caravan[]> {
  try {
    const res = await fetch("/api/caravans");
    if (!res.ok) throw new Error("Failed to fetch caravans");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCaravan(car: Partial<Caravan>): Promise<Caravan> {
  const res = await fetch("/api/caravans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(car)
  });
  if (!res.ok) throw new Error("Failed to create caravan");
  return await res.json();
}

export async function deleteCaravan(id: string): Promise<boolean> {
  const res = await fetch(`/api/caravans/${id}`, { method: "DELETE" });
  return res.ok;
}

// Sponsors
export async function fetchSponsors(): Promise<Sponsor[]> {
  try {
    const res = await fetch("/api/sponsors");
    if (!res.ok) throw new Error("Failed to fetch sponsors");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createSponsor(spon: Partial<Sponsor>): Promise<Sponsor> {
  const res = await fetch("/api/sponsors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spon)
  });
  if (!res.ok) throw new Error("Failed to create sponsor");
  return await res.json();
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
  return res.ok;
}

// Settings APIs
export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return await res.json();
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return await res.json();
}

// Edit Devotional
export async function editDevotional(id: string, dev: Partial<Devotional>): Promise<Devotional> {
  const res = await fetch(`/api/devotionals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dev)
  });
  if (!res.ok) throw new Error("Failed to edit devotional");
  return await res.json();
}

// Edit Gallery Item
export async function editGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to edit gallery item");
  return await res.json();
}

// Edit Regulation
export async function editRegulation(id: string, reg: Partial<Regulation>): Promise<Regulation> {
  const res = await fetch(`/api/regulations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reg)
  });
  if (!res.ok) throw new Error("Failed to edit regulation");
  return await res.json();
}

// Edit Caravan
export async function editCaravan(id: string, car: Partial<Caravan>): Promise<Caravan> {
  const res = await fetch(`/api/caravans/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(car)
  });
  if (!res.ok) throw new Error("Failed to edit caravan");
  return await res.json();
}

// Edit Sponsor
export async function editSponsor(id: string, spon: Partial<Sponsor>): Promise<Sponsor> {
  const res = await fetch(`/api/sponsors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spon)
  });
  if (!res.ok) throw new Error("Failed to edit sponsor");
  return await res.json();
}

// Attractions
export async function fetchAttractions(): Promise<Attraction[]> {
  try {
    const res = await fetch("/api/attractions");
    if (!res.ok) throw new Error("Failed to fetch attractions");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createAttraction(attraction: Partial<Attraction>): Promise<Attraction> {
  const res = await fetch("/api/attractions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attraction)
  });
  if (!res.ok) throw new Error("Failed to create attraction");
  return await res.json();
}

export async function editAttraction(id: string, attraction: Partial<Attraction>): Promise<Attraction> {
  const res = await fetch(`/api/attractions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attraction)
  });
  if (!res.ok) throw new Error("Failed to edit attraction");
  return await res.json();
}

export async function deleteAttraction(id: string): Promise<boolean> {
  const res = await fetch(`/api/attractions/${id}`, { method: "DELETE" });
  return res.ok;
}
