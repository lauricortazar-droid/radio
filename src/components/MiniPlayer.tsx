import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Disc } from 'lucide-react';
import { AudioTrack } from '../types/index.ts';

interface MiniPlayerProps {
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenExpanded: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrevious,
  onOpenExpanded
}) => {
  if (!track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      onClick={onOpenExpanded}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B1D22]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 shadow-2xl cursor-pointer"
      role="region"
      aria-label="Reproductor persistente compacto"
    >
      {/* Barra de progreso sutil superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-[#C6A45E] transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Info y Disco giratorio */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#24272E] border border-[#C6A45E]/40 flex items-center justify-center text-[#C6A45E] shrink-0">
            <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-[#F5F5F2] truncate">
              {track.titulo}
            </h4>
            <p className="text-xs text-[#C6A45E] truncate">
              {track.categoria}
              {track.genero ? ` • ${track.genero}` : ''}
              {track.libro ? ` • ${track.libro}` : ''}
            </p>
          </div>
        </div>

        {/* Controles del mini reproductor */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onPrevious}
            className="p-2 text-[#A7A8AD] hover:text-white transition-colors cursor-pointer"
            aria-label="Pista anterior"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] flex items-center justify-center transition-transform active:scale-95 shadow-md cursor-pointer"
            aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-[#A7A8AD] hover:text-white transition-colors cursor-pointer"
            aria-label="Pista siguiente"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </aside>
  );
};
