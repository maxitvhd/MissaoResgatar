export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  date: string;
  category: string;
  likes: number;
  comments: Comment[];
  views: number;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  date: string;
  category: string;
  reads: number;
}

export interface PersonalNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  color?: string;
  isPinned?: boolean;
  lastUpdated: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface RadioStatus {
  isPlaying: boolean;
  currentSong: string;
  viewers: number;
  streamUrl: string;
}

export interface DailyVerse {
  verse: string;
  reference: string;
  reflection: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

// Midias (gerenciador de midias do site)
export interface MediaUsage {
  tabela: string;
  coluna: string;
  rotulo: string;
  id: number | null;
  titulo: string;
}

export interface MediaFile {
  caminho: string;
  nome: string;
  pasta: string;
  url: string;
  tamanho: number;
  mime: string;
  data: string;
  em_uso: MediaUsage[];
}

export interface MediaList {
  pasta: string | null;
  busca: string;
  pagina: number;
  paginas: number;
  por_pagina: number;
  total: number;
  pastas: string[];
  contagem: Record<string, number>;
  arquivos: MediaFile[];
}

export interface Regulation {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
}

export interface Caravan {
  id: string;
  church: string;
  pastor: string;
  contactName: string;
  phone: string;
  peopleCount: number;
  city: string;
  dateAdded: string;
}

export interface Sponsor {
  id: string;
  name: string;
  imageUrl: string;
  link: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  time: string;
  image: string;
}

export interface VideoYoutube {
  id: string;
  title: string;
  urlOrId: string;
  description?: string;
  category?: string;
  isFeatured?: boolean;
  order?: number;
  createdAt?: string;
}

export interface ProductCategory {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  produtos_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
  categoryName?: string;
  description: string;
  details?: string;
  imageUrl?: string;
  galleryImages?: string[];
  price: number;
  discountPrice?: number | null;
  discountPercent?: number | null;
  shippingInfo?: string;
  purchaseUrl?: string | null;
  inStock: boolean;
  isFeatured: boolean;
  createdAt?: string;
}

export interface ClosedLesson {
  id: string;
  module: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
  materialUrl?: string;
  order?: number;
  active?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  videoBackgroundUrl: string;
  heroImageUrl: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundOpacity?: number;
  backgroundScale?: number;
  backgroundDarkness?: number;
  logoUrl?: string;
  activeSections?: {
    hero?: boolean;
    agenda?: boolean;
    atracoes?: boolean;
    rota?: boolean;
    galeria?: boolean;
    caravanas?: boolean;
    regulamentos?: boolean;
    patrocinadores?: boolean;
    imprensa?: boolean;
    videos?: boolean;
    loja?: boolean;
    transparencia?: boolean;
    [key: string]: boolean | undefined;
  };
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  whatsappLoja?: string;
  whatsappFlutuante?: string;
  mensagemWhatsappFlutuante?: string;
  pressEmail: string;
  pressMaterialLink: string;
  pressCredLink: string;
}

export interface Member {
  id: number;
  user_id?: number | null;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cpf?: string | null;
  data_nascimento?: string | null;
  data_membro?: string | null;
  cargo_ministerio?: string | null;
  status: 'ativo' | 'inativo' | 'transferido';
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  foto_url?: string | null;
  observacoes?: string | null;
  transacoes_count?: number;
  dizimos_count?: number;
  ofertas_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialTransaction {
  id: number;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  data_culto_evento?: string | null;
  metodo_pagamento?: string | null;
  membro_id?: number | null;
  pedido_loja_id?: number | null;
  status: 'confirmado' | 'pendente' | 'cancelado';
  comprovante_url?: string | null;
  observacoes?: string | null;
  membro?: Member | null;
  pedido_loja?: StoreOrder | null;
  created_at?: string;
}

export interface StoreOrder {
  id: number;
  produto_id?: number | null;
  membro_id?: number | null;
  nome_cliente: string;
  telefone_cliente?: string | null;
  email_cliente?: string | null;
  origem_checkout: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: 'pendente' | 'concluido' | 'cancelado';
  observacoes?: string | null;
  created_at?: string;
  produto?: {
    id: number;
    nome: string;
    imagem_url?: string;
    preco: number;
  } | null;
  membro?: Member | null;
  transacao_financeira?: FinancialTransaction | null;
}

export interface CategoryBreakdown {
  categoria: string;
  total: number;
  quantidade: number;
  porcentagem: number;
  titulo?: string;
}

export interface FinancialDashboardData {
  totais: {
    entradas: number;
    saidas: number;
    saldo: number;
    pedidos_pendentes_count: number;
    pedidos_pendentes_valor: number;
  };
  entradas_por_categoria: CategoryBreakdown[];
  saidas_por_categoria: CategoryBreakdown[];
  evolucao_mensal: {
    mes: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }[];
  ultimas_transacoes: FinancialTransaction[];
}

export interface PublicTransparencyData {
  ano: number;
  total_arrecadado: number;
  total_investido: number;
  saldo_reserva: number;
  destinacoes: {
    categoria: string;
    total: number;
    quantidade: number;
    porcentagem: number;
    titulo: string;
  }[];
  fontes: {
    categoria: string;
    total: number;
    porcentagem: number;
    titulo: string;
  }[];
  investimentos_recentes: {
    id: number;
    categoria: string;
    descricao: string;
    valor: number;
    data: string;
  }[];
}


