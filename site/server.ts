import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { NewsPost, Devotional, PersonalNote, User, RadioStatus, DailyVerse } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Default initial database content
const defaultDb = {
  news: [
    {
      id: "news-1",
      title: "Marcha para Jesus Itaquaquecetuba 2025: Mobilização Histórica Confirmada!",
      content: `A cidade de Itaquaquecetuba está se preparando para uma das maiores manifestações de fé, paz e união de sua história. A Marcha para Jesus 2025 acontecerá sob o tema "Pela Família e pela Vida", reunindo dezenas de igrejas e milhares de cristãos em um grande ato profético pelas ruas da cidade.

Concentração e Percurso:
A concentração principal começará a partir das 14h na Praça Padre João Álvares, no coração do Centro da cidade. O trajeto seguirá em um percurso com trios elétricos de última geração e segurança reforçada em direção ao Parque Ecológico de Itaquaquecetuba, onde uma megaestrutura de palco estará montada para receber as atrações e as apresentações especiais.

Shows e Atrações Confirmadas:
Estão confirmadas grandes vozes e bandas do cenário cristão nacional, como Fernandinho, Isadora Pompeo, Renascer Praise, Kemuel, Soraya Moraes e Marcus Salles, além de ministérios locais de Itaquá. 

Parceria Tecnológica:
Neste ano, a organização (COPEI - Conselho de Pastores de Itaquaquecetuba) firmou uma parceria exclusiva com a HolyHub para integrar transmissão ao vivo de áudio por rádio digital, acompanhamento do percurso por GPS integrado, e distribuição de devocionais oficiais para os participantes.

Venha fazer parte deste momento profético e celebrar a presença de Deus em nossa cidade!`,
      author: "Comissão COPEI & HolyHub",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      date: "2026-07-15",
      category: "Marcha 2025",
      likes: 384,
      comments: [
        { id: "c1", author: "Pastor Antonio Carlos", content: "Itaquaquecetuba viverá um tempo de milagres e restauração. Estaremos lá com toda a igreja!", date: "2026-07-15T09:30:00Z" },
        { id: "c2", author: "Mariana Souza", content: "Mal posso esperar pelos shows de Fernandinho e Isadora Pompeo! Evento lindo e abençoado.", date: "2026-07-15T10:15:00Z" }
      ],
      views: 1240
    },
    {
      id: "news-2",
      title: "Rádio HolyHub estreia Player Integrado de Alta Definição",
      content: `É com imensa alegria que lançamos o novo player integrado da Rádio HolyHub! Agora, nossos ouvintes podem desfrutar de louvores edificantes, mensagens inspiradoras e cobertura de eventos cristãos ao vivo diretamente do portal, sem interrupções.

A rádio conta com uma transmissão digital de alta fidelidade e baixa latência (AAC+ de 128kbps), otimizada para conexões de internet fixa ou móvel. Nosso principal propósito é levar a paz e a autoridade da Palavra de Deus em todos os momentos do seu dia, seja no trabalho, em casa ou em deslocamento.

Programação Especial Marcha 2025:
Fique ligado na nossa programação exclusiva com entrevistas com pastores locais, bastidores da Marcha para Jesus Itaquaquecetuba, testemunhos inspiradores e muito louvor instrumental para seus momentos de oração diária.`,
      author: "HolyHub Tech Team",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      date: "2026-07-14",
      category: "Novidades",
      likes: 198,
      comments: [
        { id: "c3", author: "Thiago Mendes", content: "O som está espetacular! Ouço todos os dias pela manhã no escritório.", date: "2026-07-14T11:00:00Z" }
      ],
      views: 742
    },
    {
      id: "news-3",
      title: "Aplicativo HolyHub Bíblia lança Novo Módulo de Anotações Sincronizadas",
      content: `A equipe de tecnologia da HolyHub orgulhosamente anuncia a atualização do app da Bíblia Sagrada! A nova versão traz o avançado recurso de anotações sincronizadas em nuvem e leitura bíblica completa em modo offline.

Com essa funcionalidade, você pode marcar versículos prediletos, registrar revelações durante os cultos ou momentos de estudo pessoal e garantir que suas anotações estarão seguras e acessíveis em qualquer dispositivo.

Para celebrar este lançamento, preparamos uma integração direta com o nosso portal. Ao logar na sua conta HolyHub, você poderá ver e atualizar suas anotações instantaneamente através da nossa interface web limpa e minimalista.

Baixe o app oficial diretamente da Google Play e Apple App Store pelo link holyhub.com.br/biblia.`,
      author: "Rede Máximo Tech",
      image: "https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=1200&q=80",
      date: "2026-07-13",
      category: "Aplicativos",
      likes: 245,
      comments: [
        { id: "c4", author: "Ana Clara Lima", content: "Parabéns, Rede Máximo! O app da bíblia está maravilhoso, muito útil para organizar meus devocionais.", date: "2026-07-13T15:20:00Z" }
      ],
      views: 935
    }
  ],
  devotionals: [
    {
      id: "dev-1",
      title: "Edificando sobre a Rocha Inabalável",
      content: `Nesta jornada terrena, somos frequentemente cercados por ventos de incerteza, tempestades de provações e as pressões de uma sociedade que muda a cada instante. Mas a Palavra de Deus nos oferece uma âncora inabalável. Jesus compara aquele que ouve Suas palavras e as pratica a um homem prudente que edificou sua casa sobre a rocha. 

Quando as tempestades vêm — e elas certamente virão — a casa firme não cai, pois está firmemente fundada na Verdade eterna. Edificar sobre a rocha significa tomar decisões diárias baseadas nos princípios de Cristo, moldando nosso caráter de acordo com as Escrituras e submetendo nossa vontade à Dele. 

Hoje, pergunte-se: em quais fundamentos você tem apoiado suas decisões? Que possamos investir tempo precioso na oração, na leitura da Palavra e na prática do amor cristão, assentando cada tijolo de nossas vidas sobre o único fundamento seguro, Jesus Cristo.`,
      scripture: "Mateus 7:24-25",
      date: "2026-07-15",
      category: "Edificação",
      reads: 432
    },
    {
      id: "dev-2",
      title: "A Força da Unidade na Marcha para Jesus",
      content: `A Marcha para Jesus não é meramente um evento festivo ou uma data no calendário civil; é um clamor profético de unidade cristã. Quando milhares de vozes se unem em uma só canção pelas ruas de Itaquaquecetuba, as barreiras denominacionais caem e o Corpo de Cristo se manifesta de forma visível e unificada.

A bíblia declara em Salmos 133 quão bom e agradável é que os irmãos vivam em união. Ali, o Senhor ordena a bênção e a vida para sempre. A nossa marcha é um testemunho vivo para aqueles que ainda não conhecem a verdade, provando que somos um por meio do amor e da redenção de Cristo.

Que possamos marchar com o coração alinhado, intercedendo pelas famílias de Itaquaquecetuba, pelas nossas lideranças e pela paz social, sabendo que a igreja de Cristo é a luz deste mundo.`,
      scripture: "Salmos 133:1-3",
      date: "2026-07-12",
      category: "Unidade",
      reads: 312
    },
    {
      id: "dev-3",
      title: "Navegando no Mundo Digital com Coração Celestial",
      content: `A tecnologia é uma dádiva incrível que nos permite conectar, aprender e espalhar o evangelho de maneiras antes inimagináveis. No entanto, o ambiente digital também apresenta desafios significativos ao nosso foco espiritual, alimentando a comparação, a distração constante e a vaidade.

Como cristãos na era digital, somos desafiados a usar a tecnologia de forma redentora. Paulo nos instrui a fazer tudo para a glória de Deus, quer comamos ou bebamos (ou usemos nossas redes sociais). 

Isso envolve estabelecer limites saudáveis, cultivar silêncio de qualidade para ouvir a voz do Espírito Santo e garantir que o nosso tempo de tela não eclipse o nosso tempo no altar com o Senhor. Que a nossa presença online seja sal e luz, comunicando paz, encorajamento e fé.`,
      scripture: "1 Coríntios 10:31",
      date: "2026-07-10",
      category: "Tecnologia & Fé",
      reads: 289
    }
  ],
  notes: [] as PersonalNote[],
  users: [
    { id: "admin-1", email: "maximoemsolucoes@gmail.com", name: "Rede Máximo", role: "admin" },
    { id: "user-test", email: "user@holyhub.com", name: "Irmão Assistido", role: "user" }
  ] as User[],
  dailyVerses: [
    {
      verse: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
      reference: "Salmo 119:105",
      reflection: "A Palavra de Deus não apenas ilumina o nosso destino final, mas nos dá clareza para cada pequeno passo diário, evitando que tropecemos nas pedras do caminho."
    },
    {
      verse: "Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore, nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.",
      reference: "Josué 1:9",
      reflection: "A coragem do cristão não reside na ausência de perigo, mas na presença constante do Deus Todo-Poderoso, que caminha ao nosso lado em qualquer percurso."
    },
    {
      verse: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
      reference: "João 3:16",
      reflection: "O maior ato de amor e entrega da história. A nossa fé está ancorada nesse sacrifício perfeito que nos concede reconciliação e vida abundante."
    }
  ] as DailyVerse[],
  events: [
    {
      id: "event-1",
      title: "Grande Clamor de Unidade - Centro",
      description: "Primeiro encontro de oração unificada com todos os pastores e igrejas de Itaquá na Praça Central.",
      location: "Praça Padre João Álvares, Centro - Itaquaquecetuba",
      dateTime: "2026-08-15T19:30",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "event-2",
      title: "Vigília de Unção Pró Marcha 2025",
      description: "Uma noite clamando pela segurança do percurso, pelas autoridades da cidade e pelas famílias que participarão.",
      location: "Arena de Eventos Parque Ecológico",
      dateTime: "2026-09-05T22:00",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Clamor pela Cidade no Altar Central",
      description: "Pastores do COPEI clamando de joelhos por restauração espiritual na Praça Padre João Álvares.",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      category: "Marcha Itaquá"
    },
    {
      id: "gal-2",
      title: "Adoração e Louvor com Fernandinho",
      description: "Milhares de vozes louvando ao Senhor sob um lindo pôr do sol no Parque Ecológico de Itaquá.",
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      category: "Louvor & Adoração"
    },
    {
      id: "gal-3",
      title: "Multidão Unida em uma Só Canção",
      description: "Vista panorâmica da multidão de fiéis carregando bandeiras e louvando pelas ruas de Itaquá.",
      url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      category: "Público"
    },
    {
      id: "gal-4",
      title: "Transmissão Digital nos Bastidores",
      description: "Equipe de comunicação da HolyHub e Rede Máximo coordenando a rádio online ao vivo de Itaquá.",
      url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      category: "Bastidores"
    }
  ],
  regulations: [
    {
      id: "reg-1",
      title: "Manual Geral e Regulamento de Trios Elétricos",
      description: "Normas de decibéis, segurança, altura limite, vistoria do corpo de bombeiros e trajeto oficial para condutores de Trios Elétricos credenciados.",
      category: "Trios & Som",
      link: "https://www.holyhub.com.br/docs/manual-trios-2025.pdf"
    },
    {
      id: "reg-2",
      title: "Guia Completo para Cadastro de Caravanas Oficiais",
      description: "Instruções para líderes e pastores sobre estacionamento exclusivo de ônibus, crachás de identificação e área VIP frontal das caravanas.",
      category: "Caravanas",
      link: "https://www.holyhub.com.br/docs/guia-caravanas-2025.pdf"
    },
    {
      id: "reg-3",
      title: "Normas de Segurança e Credenciamento de Ambulantes",
      description: "Diretrizes estabelecidas pela prefeitura e pelo COPEI para venda autorizada de águas, alimentos e camisetas oficiais da Marcha.",
      category: "Comércio",
      link: "https://www.holyhub.com.br/docs/regras-comercio-marcha.pdf"
    }
  ],
  caravans: [] as any[],
  sponsors: [
    {
      id: "spon-1",
      name: "Prefeitura Municipal de Itaquaquecetuba",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
      link: "https://itaquaquecetuba.sp.gov.br/"
    },
    {
      id: "spon-2",
      name: "Rede Máximo em Soluções",
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=300&q=80",
      link: "https://maximoprotecoes.com.br"
    }
  ],
  attractions: [
    { id: "art-1", name: "Fernandinho", description: "Grande ícone da adoração e louvor nacional", time: "20:30", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80" },
    { id: "art-2", name: "Isadora Pompeo", description: "Líder de louvor jovem de destaque no país", time: "19:15", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80" },
    { id: "art-3", name: "Kemuel", description: "Maior coral vocal contemporâneo do Brasil", time: "18:00", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80" },
    { id: "art-4", name: "Renascer Praise", description: "Pioneiros da música gospel orquestrada", time: "17:00", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=500&q=80" },
    { id: "art-5", name: "Soraya Moraes", description: "Voz clássica e ungida com grandes hinos", time: "16:00", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=80" },
    { id: "art-6", name: "Marcus Salles", description: "Ministração profética de restauração", time: "15:00", image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80" }
  ],
  settings: {
    videoBackgroundUrl: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c025f73d485c20130d2e8d356fae40a1&profile_id=139&oauth2_token_id=57447761",
    heroImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    instagramUrl: "https://instagram.com/marchaparajesus",
    facebookUrl: "https://facebook.com/marchaparajesus",
    youtubeUrl: "https://youtube.com/marchaparajesus",
    pressEmail: "imprensa@renascer.org.br",
    pressMaterialLink: "https://www.holyhub.com.br/docs/marcha-2025-kit-imprensa.zip",
    pressCredLink: "https://forms.gle/credenciamento"
  }
};

// Ensure database file exists
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf8");
    console.log("Database initialized with seed data.");
  }
}

initDb();

function getDb() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    let updated = false;
    for (const key of Object.keys(defaultDb)) {
      if (parsed[key] === undefined) {
        parsed[key] = (defaultDb as any)[key];
        updated = true;
      }
    }
    if (updated) {
      saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file, returning default:", err);
    return defaultDb;
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// REST API Routes

// SEO / XML Sitemap
app.get("/sitemap.xml", (req, res) => {
  const db = getDb();
  res.header("Content-Type", "application/xml");
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://holyhub.com.br/</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://holyhub.com.br/radio</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>always</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://holyhub.com.br/biblia</loc>
    <lastmod>2026-07-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  // Dynamic news pages
  db.news.forEach((post: NewsPost) => {
    sitemap += `
  <url>
    <loc>https://holyhub.com.br/noticias/${post.id}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Dynamic devotionals
  db.devotionals.forEach((dev: Devotional) => {
    sitemap += `
  <url>
    <loc>https://holyhub.com.br/devocionais/${dev.id}</loc>
    <lastmod>${dev.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;
  res.send(sitemap);
});

// Translation Endpoint using Gemini
app.post("/api/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Text and targetLanguage are required" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Offline fallback translations
      if (targetLanguage.toLowerCase() === "en") {
        if (text.includes("Lâmpada para os meus pés")) {
          return res.json({ translatedText: "Your word is a lamp for my feet, a light on my path. (Psalm 119:105)" });
        }
        return res.json({ translatedText: `[EN Translation Fallback] ${text}` });
      } else if (targetLanguage.toLowerCase() === "es") {
        if (text.includes("Lâmpada para os meus pés")) {
          return res.json({ translatedText: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino. (Salmo 119:105)" });
        }
        return res.json({ translatedText: `[ES Translation Fallback] ${text}` });
      }
      return res.json({ translatedText: text });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following Portuguese text to ${targetLanguage}. Return ONLY the direct translation text with no comments, introductory notes, or surrounding quotes. Keep Christian terminology appropriate for that language.
Text: "${text}"`,
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    res.status(500).json({ error: "Failed to translate text", details: error.message });
  }
});

// Daily Verse endpoint
app.get("/api/daily-verse", (req, res) => {
  const db = getDb();
  // Return daily verse based on day of month
  const day = new Date().getDate();
  const index = day % db.dailyVerses.length;
  res.json(db.dailyVerses[index]);
});

// Auth Routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body; // In this simple beautiful setup we allow simple login
  const db = getDb();
  
  // Find user by email or let them log in as user
  let user = db.users.find((u: User) => u.email === email);
  if (!user) {
    if (email === "maximoemsolucoes@gmail.com") {
      user = { id: "admin-1", email, name: "Rede Máximo", role: "admin" };
      db.users.push(user);
      saveDb(db);
    } else {
      user = { id: "user-" + Date.now(), email, name: email.split("@")[0], role: "user" };
      db.users.push(user);
      saveDb(db);
    }
  }
  
  res.json({ success: true, user });
});

// News API
app.get("/api/news", (req, res) => {
  const db = getDb();
  res.json(db.news);
});

app.post("/api/news", (req, res) => {
  const { title, content, author, image, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const db = getDb();
  const newPost: NewsPost = {
    id: "news-" + Date.now(),
    title,
    content,
    author: author || "HolyHub Editorial",
    image: image || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    date: new Date().toISOString().split("T")[0],
    category: category || "Geral",
    likes: 0,
    comments: [],
    views: 1
  };

  db.news.unshift(newPost);
  saveDb(db);
  res.status(201).json(newPost);
});

app.delete("/api/news/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = db.news.length;
  db.news = db.news.filter((n: NewsPost) => n.id !== id);
  
  if (db.news.length === initialLength) {
    return res.status(404).json({ error: "News not found" });
  }
  
  saveDb(db);
  res.json({ success: true });
});

app.put("/api/news/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, image, category } = req.body;
  const db = getDb();
  const postIndex = db.news.findIndex((n: NewsPost) => n.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "News not found" });
  }
  db.news[postIndex] = {
    ...db.news[postIndex],
    title: title || db.news[postIndex].title,
    content: content || db.news[postIndex].content,
    image: image !== undefined ? image : db.news[postIndex].image,
    category: category || db.news[postIndex].category,
  };
  saveDb(db);
  res.json(db.news[postIndex]);
});

// Image Upload Endpoint (Saves to public/uploads)
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

app.post("/api/upload", (req, res) => {
  const { base64, filename } = req.body;
  if (!base64 || !filename) {
    return res.status(400).json({ error: "base64 and filename are required" });
  }
  try {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid base64 string format" });
    }
    const buffer = Buffer.from(matches[2], "base64");
    const safeName = Date.now() + "-" + filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);
    res.json({ url: `/uploads/${safeName}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image", details: error.message });
  }
});

// Agenda Events API
app.get("/api/events", (req, res) => {
  const db = getDb();
  res.json(db.events || []);
});

app.post("/api/events", (req, res) => {
  const { title, description, location, dateTime, image } = req.body;
  if (!title || !dateTime) {
    return res.status(400).json({ error: "Title and dateTime are required" });
  }
  const db = getDb();
  if (!db.events) db.events = [];
  const newEvent = {
    id: "event-" + Date.now(),
    title,
    description: description || "",
    location: location || "",
    dateTime,
    image: image || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
  };
  db.events.unshift(newEvent);
  saveDb(db);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, location, dateTime, image } = req.body;
  const db = getDb();
  const eventIndex = db.events?.findIndex((e: any) => e.id === id);
  if (eventIndex === -1 || eventIndex === undefined) {
    return res.status(404).json({ error: "Event not found" });
  }
  db.events[eventIndex] = {
    ...db.events[eventIndex],
    title: title || db.events[eventIndex].title,
    description: description !== undefined ? description : db.events[eventIndex].description,
    location: location || db.events[eventIndex].location,
    dateTime: dateTime || db.events[eventIndex].dateTime,
    image: image !== undefined ? image : db.events[eventIndex].image,
  };
  saveDb(db);
  res.json(db.events[eventIndex]);
});

app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.events) db.events = [];
  db.events = db.events.filter((e: any) => e.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Gallery API (Momentos Especiais 2024)
app.get("/api/gallery", (req, res) => {
  const db = getDb();
  res.json(db.gallery || []);
});

app.post("/api/gallery", (req, res) => {
  const { title, description, url, category } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Image URL is required" });
  }
  const db = getDb();
  if (!db.gallery) db.gallery = [];
  const newItem = {
    id: "gal-" + Date.now(),
    title: title || "Momento Especial 2024",
    description: description || "Lembranças abençoadas da Marcha para Jesus.",
    url,
    category: category || "Marcha Itaquá"
  };
  db.gallery.unshift(newItem);
  saveDb(db);
  res.status(201).json(newItem);
});

app.delete("/api/gallery/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.gallery) db.gallery = [];
  db.gallery = db.gallery.filter((g: any) => g.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Regulations API
app.get("/api/regulations", (req, res) => {
  const db = getDb();
  res.json(db.regulations || []);
});

app.post("/api/regulations", (req, res) => {
  const { title, description, category, link } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const db = getDb();
  if (!db.regulations) db.regulations = [];
  const newReg = {
    id: "reg-" + Date.now(),
    title,
    description: description || "",
    category: category || "Geral",
    link: link || "#"
  };
  db.regulations.unshift(newReg);
  saveDb(db);
  res.status(201).json(newReg);
});

app.delete("/api/regulations/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.regulations) db.regulations = [];
  db.regulations = db.regulations.filter((r: any) => r.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Caravans API
app.get("/api/caravans", (req, res) => {
  const db = getDb();
  res.json(db.caravans || []);
});

app.post("/api/caravans", (req, res) => {
  const { church, pastor, contactName, phone, peopleCount, city } = req.body;
  if (!church || !contactName || !phone) {
    return res.status(400).json({ error: "church, contactName, and phone are required" });
  }
  const db = getDb();
  if (!db.caravans) db.caravans = [];
  const newCaravan = {
    id: "car-" + Date.now(),
    church,
    pastor: pastor || "",
    contactName,
    phone,
    peopleCount: Number(peopleCount) || 0,
    city: city || "Itaquaquecetuba",
    dateAdded: new Date().toISOString()
  };
  db.caravans.push(newCaravan);
  saveDb(db);
  res.status(201).json(newCaravan);
});

app.delete("/api/caravans/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.caravans) db.caravans = [];
  db.caravans = db.caravans.filter((c: any) => c.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Sponsors API
app.get("/api/sponsors", (req, res) => {
  const db = getDb();
  res.json(db.sponsors || []);
});

app.post("/api/sponsors", (req, res) => {
  const { name, imageUrl, link } = req.body;
  if (!name || !imageUrl) {
    return res.status(400).json({ error: "name and imageUrl are required" });
  }
  const db = getDb();
  if (!db.sponsors) db.sponsors = [];
  const newSponsor = {
    id: "spon-" + Date.now(),
    name,
    imageUrl,
    link: link || "#"
  };
  db.sponsors.push(newSponsor);
  saveDb(db);
  res.status(201).json(newSponsor);
});

app.delete("/api/sponsors/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.sponsors) db.sponsors = [];
  db.sponsors = db.sponsors.filter((s: any) => s.id !== id);
  saveDb(db);
  res.json({ success: true });
});

app.post("/api/news/:id/like", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const post = db.news.find((n: NewsPost) => n.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  post.likes += 1;
  saveDb(db);
  res.json({ likes: post.likes });
});

app.post("/api/news/:id/comments", (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required" });
  }

  const db = getDb();
  const post = db.news.find((n: NewsPost) => n.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const newComment = {
    id: "c-" + Date.now(),
    author,
    content,
    date: new Date().toISOString()
  };

  post.comments.push(newComment);
  saveDb(db);
  res.status(201).json(newComment);
});

// Devotionals API
app.get("/api/devotionals", (req, res) => {
  const db = getDb();
  res.json(db.devotionals);
});

app.post("/api/devotionals", (req, res) => {
  const { title, content, scripture, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const db = getDb();
  const newDev: Devotional = {
    id: "dev-" + Date.now(),
    title,
    content,
    scripture: scripture || "",
    date: new Date().toISOString().split("T")[0],
    category: category || "Edificação",
    reads: 0
  };

  db.devotionals.unshift(newDev);
  saveDb(db);
  res.status(201).json(newDev);
});

app.delete("/api/devotionals/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const initialLength = db.devotionals.length;
  db.devotionals = db.devotionals.filter((d: Devotional) => d.id !== id);
  
  if (db.devotionals.length === initialLength) {
    return res.status(404).json({ error: "Devotional not found" });
  }
  
  saveDb(db);
  res.json({ success: true });
});

// Personal Notes API (Sincronização em Nuvem)
app.get("/api/notes/:userId", (req, res) => {
  const { userId } = req.params;
  const db = getDb();
  const userNotes = db.notes.filter((note: PersonalNote) => note.userId === userId);
  res.json(userNotes);
});

app.post("/api/notes", (req, res) => {
  const { id, userId, title, content } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ error: "userId and title are required" });
  }

  const db = getDb();
  const noteId = id || "note-" + Date.now();
  const existingIndex = db.notes.findIndex((n: PersonalNote) => n.id === noteId && n.userId === userId);

  const updatedNote: PersonalNote = {
    id: noteId,
    userId,
    title,
    content: content || "",
    lastUpdated: new Date().toISOString()
  };

  if (existingIndex > -1) {
    db.notes[existingIndex] = updatedNote;
  } else {
    db.notes.push(updatedNote);
  }

  saveDb(db);
  res.json(updatedNote);
});

app.delete("/api/notes/:userId/:noteId", (req, res) => {
  const { userId, noteId } = req.params;
  const db = getDb();
  const initialLength = db.notes.length;
  db.notes = db.notes.filter((n: PersonalNote) => !(n.id === noteId && n.userId === userId));

  if (db.notes.length === initialLength) {
    return res.status(404).json({ error: "Note not found" });
  }

  saveDb(db);
  res.json({ success: true });
});

// Settings Endpoints
app.get("/api/settings", (req, res) => {
  const db = getDb();
  res.json(db.settings || defaultDb.settings);
});

app.put("/api/settings", (req, res) => {
  const db = getDb();
  db.settings = {
    ...(db.settings || defaultDb.settings),
    ...req.body
  };
  saveDb(db);
  res.json(db.settings);
});

// Edit Devotional Endpoint
app.put("/api/devotionals/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, scripture, category } = req.body;
  const db = getDb();
  const index = db.devotionals.findIndex((d: any) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Devotional not found" });
  }
  db.devotionals[index] = {
    ...db.devotionals[index],
    title: title || db.devotionals[index].title,
    content: content || db.devotionals[index].content,
    scripture: scripture !== undefined ? scripture : db.devotionals[index].scripture,
    category: category || db.devotionals[index].category
  };
  saveDb(db);
  res.json(db.devotionals[index]);
});

// Edit Gallery Endpoint
app.put("/api/gallery/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, url, category } = req.body;
  const db = getDb();
  const index = db.gallery.findIndex((g: any) => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Gallery item not found" });
  }
  db.gallery[index] = {
    ...db.gallery[index],
    title: title || db.gallery[index].title,
    description: description || db.gallery[index].description,
    url: url || db.gallery[index].url,
    category: category || db.gallery[index].category
  };
  saveDb(db);
  res.json(db.gallery[index]);
});

// Edit Regulation Endpoint
app.put("/api/regulations/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, category, link } = req.body;
  const db = getDb();
  const index = db.regulations.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Regulation not found" });
  }
  db.regulations[index] = {
    ...db.regulations[index],
    title: title || db.regulations[index].title,
    description: description || db.regulations[index].description,
    category: category || db.regulations[index].category,
    link: link || db.regulations[index].link
  };
  saveDb(db);
  res.json(db.regulations[index]);
});

// Edit Caravan Endpoint
app.put("/api/caravans/:id", (req, res) => {
  const { id } = req.params;
  const { church, pastor, contactName, phone, peopleCount, city } = req.body;
  const db = getDb();
  const index = db.caravans.findIndex((c: any) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Caravan not found" });
  }
  db.caravans[index] = {
    ...db.caravans[index],
    church: church || db.caravans[index].church,
    pastor: pastor !== undefined ? pastor : db.caravans[index].pastor,
    contactName: contactName || db.caravans[index].contactName,
    phone: phone || db.caravans[index].phone,
    peopleCount: peopleCount !== undefined ? Number(peopleCount) : db.caravans[index].peopleCount,
    city: city || db.caravans[index].city
  };
  saveDb(db);
  res.json(db.caravans[index]);
});

// Edit Sponsor Endpoint
app.put("/api/sponsors/:id", (req, res) => {
  const { id } = req.params;
  const { name, imageUrl, link } = req.body;
  const db = getDb();
  const index = db.sponsors.findIndex((s: any) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Sponsor not found" });
  }
  db.sponsors[index] = {
    ...db.sponsors[index],
    name: name || db.sponsors[index].name,
    imageUrl: imageUrl || db.sponsors[index].imageUrl,
    link: link || db.sponsors[index].link
  };
  saveDb(db);
  res.json(db.sponsors[index]);
});

// Attractions API
app.get("/api/attractions", (req, res) => {
  const db = getDb();
  res.json(db.attractions || []);
});

app.post("/api/attractions", (req, res) => {
  const { name, description, time, image } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const db = getDb();
  if (!db.attractions) db.attractions = [];
  const newAttraction = {
    id: "art-" + Date.now(),
    name,
    description: description || "",
    time: time || "",
    image: image || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
  };
  db.attractions.push(newAttraction);
  saveDb(db);
  res.status(201).json(newAttraction);
});

app.put("/api/attractions/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, time, image } = req.body;
  const db = getDb();
  const index = db.attractions?.findIndex((a: any) => a.id === id);
  if (index === -1 || index === undefined) {
    return res.status(404).json({ error: "Attraction not found" });
  }
  db.attractions[index] = {
    ...db.attractions[index],
    name: name || db.attractions[index].name,
    description: description !== undefined ? description : db.attractions[index].description,
    time: time || db.attractions[index].time,
    image: image !== undefined ? image : db.attractions[index].image,
  };
  saveDb(db);
  res.json(db.attractions[index]);
});

app.delete("/api/attractions/:id", (req, res) => {
  const { id } = req.params;
  const db = getDb();
  if (!db.attractions) db.attractions = [];
  db.attractions = db.attractions.filter((a: any) => a.id !== id);
  saveDb(db);
  res.json({ success: true });
});

// Users admin route
app.get("/api/admin/users", (req, res) => {
  const db = getDb();
  res.json(db.users);
});

async function startServer() {
  // Vite setup for development, Static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HolyHub Server] Running securely on port ${PORT}`);
  });
}

startServer();
