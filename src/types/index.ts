export type CategoryType = 'Música' | 'Compartimientos' | 'Audiolibros' | 'Alabanzas';

export interface AudioTrack {
  id: string;
  titulo: string;
  nombreArchivo?: string;
  categoria: CategoryType;
  genero?: string | null;
  libro?: string | null;
  capitulo?: number | null;
  duracion?: number | null; // en segundos
  tamanoBytes?: number;
  mimeType?: string;
  actualizado?: string;
  url: string;
  urlDescarga?: string;
  urlVista?: string;
  isDriveFile?: boolean;
  driveId?: string;
  isSynthesizedFallback?: boolean;
}

export interface BookProgress {
  trackId: string;
  chapter: number;
  seconds: number;
  updated: number;
}

export interface StoredAppState {
  version: number;
  favorites: string[];
  bookProgress: Record<string, BookProgress>;
  lastTrack: AudioTrack | null;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  playbackSpeed: number;
  customScriptUrl?: string;
}

export type ViewType = 'home' | 'category' | 'audiobooks' | 'bookDetail' | 'favorites';
