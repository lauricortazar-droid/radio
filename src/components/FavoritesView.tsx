import React from 'react';
import { ArrowLeft, Heart, Play, Shuffle, Download } from 'lucide-react';
import { AudioTrack } from '../types/index.ts';

interface FavoritesViewProps {
  tracks: AudioTrack[];
  favorites: string[];
  currentTrackId?: string;
  isPlaying: boolean;
  onBack: () => void;
  onPlayTrack: (track: AudioTrack, list: AudioTrack[]) => void;
  onPlayList: (tracks: AudioTrack[], shuffle: boolean) => void;
  onToggleFavorite: (trackId: string) => void;
  onDownloadTrack: (track: AudioTrack) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  tracks,
  favorites,
  currentTrackId,
  isPlaying,
  onBack,
  onPlayTrack,
  onPlayList,
  onToggleFavorite,
  onDownloadTrack
}) => {
  const favoriteTracks = tracks.filter((t) => favorites.includes(t.id));

  return (
    <section className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1B1D22] hover:bg-[#24272E] text-[#A7A8AD] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Volver a la pantalla principal"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F2]">Mis Favoritos</h2>
          <span className="text-xs text-[#C6A45E]">
            {favoriteTracks.length} {favoriteTracks.length === 1 ? 'audio guardado' : 'audios guardados'}
          </span>
        </div>
      </div>

      {favoriteTracks.length > 0 && (
        <div className="flex gap-2.5 mb-4">
          <button
            onClick={() => onPlayList(favoriteTracks, false)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-semibold text-[#F5F5F2] hover:text-[#C6A45E] transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#C6A45E] fill-current" />
            <span>Reproducir Todo</span>
          </button>
          <button
            onClick={() => onPlayList(favoriteTracks, true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-semibold text-[#F5F5F2] hover:text-[#C6A45E] transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-[#C6A45E]" />
            <span>Aleatorio</span>
          </button>
        </div>
      )}

      {favoriteTracks.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#1B1D22]/40 rounded-2xl border border-dashed border-white/5">
          <Heart className="w-12 h-12 text-[#A7A8AD]/30 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Aún no tienes favoritos</h3>
          <p className="text-xs text-[#A7A8AD] max-w-sm mx-auto">
            Toca el corazón en cualquier canción, compartimiento o audiolibro para guardarlo aquí y tener acceso instantáneo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {favoriteTracks.map((track, index) => {
            const isCurrent = currentTrackId === track.id;

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#C6A45E]/10 border-[#C6A45E]/40'
                    : 'bg-[#1B1D22] hover:bg-[#24272E] border-white/5'
                }`}
              >
                <div
                  onClick={() => onPlayTrack(track, favoriteTracks)}
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

                <div
                  onClick={() => onPlayTrack(track, favoriteTracks)}
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
                    {track.libro && <span>• {track.libro}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className="p-2 rounded-lg text-[#C6A45E] hover:text-[#C6A45E]/70 transition-colors cursor-pointer"
                    aria-label="Quitar de favoritos"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => onDownloadTrack(track)}
                    className="p-2 rounded-lg text-[#A7A8AD] hover:text-[#C6A45E] transition-colors cursor-pointer"
                    aria-label="Descargar o abrir en Google Drive"
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
