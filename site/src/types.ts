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

export interface SiteSettings {
  videoBackgroundUrl: string;
  heroImageUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  pressEmail: string;
  pressMaterialLink: string;
  pressCredLink: string;
}

