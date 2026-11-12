import React from 'react';
import { Play, RotateCcw, Heart, ArrowRight } from 'lucide-react';
import { AudioTrack, BookProgress } from '../types/index.ts';
import { formatTime } from '../utils/catalogLogic.ts';

interface QuickAccessProps {
  lastTrack: AudioTrack | null;
  latestBookProgress: { bookTitle: string; progress: BookProgress } | null;
  favoriteCount: number;
  onPlayTrack: (track: AudioTrack) => void;
  onResumeBook: (bookTitle: string) => void;
  onOpenFavorites: () => void;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({
  lastTrack,
  latestBookProgress,
  favoriteCount,
  onPlayTrack,
  onResumeBook,
  onOpenFavorites
}) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A7A8AD]">
          Acceso Rápido
        </h3>
        <button
          onClick={onOpenFavorites}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6A45E] hover:underline cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Ver Favoritos ({favoriteCount})</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tarjeta: Último Reproducido */}
        {lastTrack ? (
          <div className="bg-[#1B1D22] border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A45E] block mb-0.5">
                Último reproducido
              </span>
              <h4 className="text-sm font-semibold text-[#F5F5F2] truncate">
                {lastTrack.titulo}
              </h4>
              <p className="text-xs text-[#A7A8AD] truncate">
                {lastTrack.categoria} {lastTrack.genero ? `• ${lastTrack.genero}` : ''}
              </p>
            </div>
            <button
              onClick={() => onPlayTrack(lastTrack)}
              className="w-10 h-10 rounded-full bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform active:scale-95"
              aria-label={`Reproducir ${lastTrack.titulo}`}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        ) : (
          <div className="bg-[#1B1D22]/60 border border-dashed border-white/5 rounded-xl p-3.5 flex items-center gap-3 text-[#A7A8AD]">
            <Play className="w-5 h-5 text-white/20" />
            <span className="text-xs">Comienza a escuchar para guardar tu última pista.</span>
          </div>
        )}

        {/* Tarjeta: Continuar Audiolibro */}
        {latestBookProgress ? (
          <div className="bg-[#1B1D22] border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A45E] block mb-0.5">
                Continuar audiolibro
              </span>
              <h4 className="text-sm font-semibold text-[#F5F5F2] truncate">
                {latestBookProgress.bookTitle}
              </h4>
              <p className="text-xs text-[#A7A8AD] truncate">
                Capítulo {latestBookProgress.progress.chapter || 1} en {formatTime(latestBookProgress.progress.seconds)}
              </p>
            </div>
            <button
              onClick={() => onResumeBook(latestBookProgress.bookTitle)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#24272E] hover:bg-[#C6A45E]/20 text-[#C6A45E] border border-[#C6A45E]/30 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
              aria-label={`Reanudar ${latestBookProgress.bookTitle}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reanudar</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#1B1D22]/60 border border-dashed border-white/5 rounded-xl p-3.5 flex items-center gap-3 text-[#A7A8AD]">
            <RotateCcw className="w-5 h-5 text-white/20" />
            <span className="text-xs">Los audiolibros recuerdan tu segundo exacto de lectura.</span>
          </div>
        )}
      </div>
    </section>
  );
};
