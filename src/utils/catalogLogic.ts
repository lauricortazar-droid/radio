import { AudioTrack, CategoryType } from '../types/index.ts';

/**
 * Normaliza nombres de categoría tolerando mayúsculas y acentos
 */
export function normalizeCategory(name: string): CategoryType | null {
  if (!name) return null;
  const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (clean === 'musica') return 'Música';
  if (clean === 'compartimientos' || clean === 'compartimiento') return 'Compartimientos';
  if (clean === 'audiolibros' || clean === 'audiolibro') return 'Audiolibros';
  if (clean === 'alabanzas' || clean === 'alabanza') return 'Alabanzas';
  return null;
}

/**
 * Limpia la extensión y caracteres de orden numérico inicial
 * Ejemplos: "01 - Sigo Aquí.mp3" -> "Sigo Aquí", "Track 02_Soltar.mp3" -> "Soltar"
 */
export function cleanTrackTitle(fileName: string): string {
  if (!fileName) return '';
  let clean = fileName.replace(/\.[a-zA-Z0-9]{2,5}$/, '').trim();
  clean = clean.replace(/^(?:track\s*)?(\d{1,3}[\s\-._]+)+/i, '').trim() || clean;
  return clean;
}

/**
 * Extrae el número de capítulo de patrones como "01 - Intro", "Capítulo 3", "Cap 12"
 */
export function extractChapterNumber(fileName: string): number | null {
  if (!fileName) return null;
  // Primero remover extensión para no capturar el '3' de '.mp3'
  const withoutExt = fileName.replace(/\.[a-zA-Z0-9]{2,5}$/, '').trim();
  
  // 1. Buscar patrón explícito como "Capítulo 3", "Cap 12", "Parte 2"
  const explicitMatch = withoutExt.match(/(?:cap[íi]tulo|cap|parte)\s*[:.\-]?\s*(\d{1,3})/i);
  if (explicitMatch && explicitMatch[1]) {
    return parseInt(explicitMatch[1], 10);
  }

  // 2. O número al inicio: "01 - Nombre", "02. Capitulo"
  const leadingMatch = withoutExt.match(/^(\d{1,3})[\s\-._]+/);
  if (leadingMatch && leadingMatch[1]) {
    return parseInt(leadingMatch[1], 10);
  }

  return null;
}

/**
 * Normaliza un string removiendo acentos y pasando a minúsculas
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Filtra audios por categoría, género y texto de búsqueda
 */
export function filterTracks(
  tracks: AudioTrack[],
  category: string | null,
  genre: string | null,
  query: string
): AudioTrack[] {
  const normQuery = normalizeSearchString(query);

  return tracks.filter((track) => {
    if (category && track.categoria !== category) return false;
    if (genre && track.genero !== genre) return false;
    if (normQuery) {
      const matchTitle = normalizeSearchString(track.titulo).includes(normQuery);
      const matchGenre = track.genero ? normalizeSearchString(track.genero).includes(normQuery) : false;
      const matchBook = track.libro ? normalizeSearchString(track.libro).includes(normQuery) : false;
      if (!matchTitle && !matchGenre && !matchBook) return false;
    }
    return true;
  });
}

/**
 * Fisher-Yates shuffle inmutable
 */
export function shuffleTracks<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Formatea segundos a MM:SS o HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Calcula el siguiente índice según el modo de repetición
 */
export function getNextTrackIndex(
  currentIndex: number,
  queueLength: number,
  repeatMode: 'off' | 'all' | 'one'
): number {
  if (queueLength === 0) return -1;
  if (repeatMode === 'one') return currentIndex;
  if (currentIndex < queueLength - 1) return currentIndex + 1;
  if (repeatMode === 'all') return 0;
  return -1; // Fin de la cola
}

/**
 * Agrupa audios por audiolibro ordenando sus capítulos
 */
export function groupAudiobooks(tracks: AudioTrack[]): Record<string, AudioTrack[]> {
  const map: Record<string, AudioTrack[]> = {};
  tracks
    .filter((t) => t.categoria === 'Audiolibros' && t.libro)
    .forEach((t) => {
      const book = t.libro!;
      if (!map[book]) map[book] = [];
      map[book].push(t);
    });

  // Ordenar cada libro por número de capítulo
  Object.keys(map).forEach((book) => {
    map[book].sort((a, b) => (a.capitulo || 0) - (b.capitulo || 0));
  });

  return map;
}
