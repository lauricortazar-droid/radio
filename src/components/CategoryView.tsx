import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Play, Shuffle, Heart, Download, ExternalLink, Music2 } from 'lucide-react';
import { AudioTrack, CategoryType } from '../types/index.ts';
import { filterTracks } from '../utils/catalogLogic.ts';

interface CategoryViewProps {
  category: CategoryType;
  tracks: AudioTrack[];
  currentTrackId?: string;
  isPlaying: boolean;
  favorites: string[];
  onBack: () => void;
  onPlayTrack: (track: AudioTrack, list: AudioTrack[]) => void;
  onPlayList: (tracks: AudioTrack[], shuffle: boolean) => void;
  onToggleFavorite: (trackId: string) => void;
  onDownloadTrack: (track: AudioTrack) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  tracks,
  currentTrackId,
  isPlaying,
  favorites,
  onBack,
  onPlayTrack,
  onPlayList,
  onToggleFavorite,
  onDownloadTrack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Extraer géneros únicos si es categoría Música
  const genres = useMemo(() => {
    if (category !== 'Música') return [];
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.genero) set.add(t.genero);
    });
    return Array.from(set);
  }, [category, tracks]);

  // Filtrar pistas
  const filteredTracks = useMemo(() => {
    return filterTracks(tracks, category, selectedGenre, searchQuery);
  }, [tracks, category, selectedGenre, searchQuery]);

  return (
    <section className="animate-fadeIn">
      {/* Barra superior con volver */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1B1D22] hover:bg-[#24272E] text-[#A7A8AD] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Volver a la pantalla principal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F2]">{category}</h2>
          <span className="text-xs text-[#C6A45E]">
            {filteredTracks.length} {filteredTracks.length === 1 ? 'audio' : 'audios'} disponibles
          </span>
        </div>
      </div>

      {/* Buscador de pistas */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A7A8AD]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar en ${category}... (ignora acentos y mayúsculas)`}
          className="w-full bg-[#1B1D22] border border-white/5 focus:border-[#C6A45E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F5F5F2] placeholder-[#A7A8AD]/60 focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A7A8AD] hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Chips de géneros para Música */}
      {genres.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all cursor-pointer ${
              selectedGenre === null
                ? 'bg-[#C6A45E]/20 border-[#C6A45E] text-[#C6A45E]'
                : 'bg-[#1B1D22] border-white/5 text-[#A7A8AD] hover:text-white'
            }`}
          >
            Todos
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-[#C6A45E]/20 border-[#C6A45E] text-[#C6A45E]'
                  : 'bg-[#1B1D22] border-white/5 text-[#A7A8AD] hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* Botones de acción grupal */}
      <div className="flex gap-2.5 mb-4">
        <button
          onClick={() => onPlayList(filteredTracks, false)}
          disabled={filteredTracks.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-semibold text-[#F5F5F2] hover:text-[#C6A45E] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 text-[#C6A45E] fill-current" />
          <span>Reproducir Todo</span>
        </button>
        <button
          onClick={() => onPlayList(filteredTracks, true)}
          disabled={filteredTracks.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-semibold text-[#F5F5F2] hover:text-[#C6A45E] disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Shuffle className="w-4 h-4 text-[#C6A45E]" />
          <span>Aleatorio</span>
        </button>
      </div>

      {/* Lista de Pistas */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#1B1D22]/40 rounded-xl border border-dashed border-white/5">
          <Music2 className="w-10 h-10 text-[#A7A8AD]/40 mx-auto mb-2" />
          <p className="text-sm text-[#A7A8AD]">
            No se encontraron audios coincidentes en esta selección.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTracks.map((track, index) => {
            const isCurrent = currentTrackId === track.id;
            const isFav = favorites.includes(track.id);

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#C6A45E]/10 border-[#C6A45E]/40'
                    : 'bg-[#1B1D22] hover:bg-[#24272E] border-white/5'
                }`}
              >
                {/* Número / Icono estado */}
                <div
                  onClick={() => onPlayTrack(track, filteredTracks)}
                  className="w-8 text-center shrink-0 cursor-pointer"
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex items-center justify-center gap-0.5 h-4">
                      <span className="w-1 h-3 bg-[#C6A45E] animate-pulse" />
                      <span className="w-1 h-4 bg-[#C6A45E] animate-bounce" />
                      <span className="w-1 h-2 bg-[#C6A45E] animate-pulse" />
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-[#A7A8AD] group-hover:text-white">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Info de la pista */}
                <div
                  onClick={() => onPlayTrack(track, filteredTracks)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? 'text-[#C6A45E]' : 'text-[#F5F5F2]'
                    }`}
                  >
                    {track.titulo}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#A7A8AD] truncate">
                    <span>{track.categoria}</span>
                    {track.genero && <span>• {track.genero}</span>}
                    {track.isDriveFile && (
                      <span className="text-[10px] text-emerald-400 font-medium">Drive</span>
                    )}
                  </div>
                </div>

                {/* Acciones de la pista */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isFav
                        ? 'text-[#C6A45E] hover:text-[#C6A45E]'
                        : 'text-[#A7A8AD] hover:text-white'
                    }`}
                    aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onDownloadTrack(track)}
                    className="p-2 rounded-lg text-[#A7A8AD] hover:text-[#C6A45E] transition-colors cursor-pointer"
                    aria-label="Descargar o abrir en Google Drive"
                    title="Descargar o abrir en Drive"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
