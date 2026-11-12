import React from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Download,
  Disc,
  Volume2
} from 'lucide-react';
import { AudioTrack } from '../types/index.ts';
import { formatTime } from '../utils/catalogLogic.ts';

interface ExpandedPlayerModalProps {
  isOpen: boolean;
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffle: boolean;
  playbackSpeed: number;
  isFavorite: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onCycleRepeat: () => void;
  onCycleSpeed: () => void;
  onToggleShuffle: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
}

export const ExpandedPlayerModal: React.FC<ExpandedPlayerModalProps> = ({
  isOpen,
  track,
  isPlaying,
  currentTime,
  duration,
  repeatMode,
  shuffle,
  playbackSpeed,
  isFavorite,
  onClose,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onCycleRepeat,
  onCycleSpeed,
  onToggleShuffle,
  onToggleFavorite,
  onDownload
}) => {
  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#101114]/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Reproductor expandido"
    >
      {/* Barra superior del modal */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto mb-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#1B1D22] text-[#A7A8AD] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Minimizar reproductor"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#C6A45E] block">
            Radio Guerreros de la Luz
          </span>
          <span className="text-xs text-[#A7A8AD]">Reproductor Oficial</span>
        </div>

        <button
          onClick={onToggleFavorite}
          className={`w-10 h-10 rounded-full bg-[#1B1D22] flex items-center justify-center transition-colors cursor-pointer ${
            isFavorite ? 'text-[#C6A45E]' : 'text-[#A7A8AD] hover:text-white'
          }`}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Arte del Álbum / Disco de Vinilo animado */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-md w-full mx-auto">
        <div
          className={`w-56 h-56 sm:w-72 sm:h-72 rounded-3xl bg-[#1B1D22] border-2 border-[#C6A45E]/30 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500 ${
            isPlaying ? 'shadow-[#C6A45E]/20 border-[#C6A45E]' : ''
          }`}
        >
          {/* Círculos concéntricos dorados de vinilo */}
          <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute inset-16 rounded-full border border-[#C6A45E]/20 pointer-events-none" />

          <Disc
            className={`w-28 h-28 sm:w-36 sm:h-36 text-[#C6A45E] transition-transform ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '8s' }}
          />

          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-black/60 text-[#C6A45E] border border-[#C6A45E]/30">
              {track.categoria}
            </span>
          </div>
        </div>

        {/* Título y metadatos */}
        <div className="text-center mt-6 w-full">
          <h3 className="text-lg sm:text-2xl font-bold text-[#F5F5F2] line-clamp-2 mb-1">
            {track.titulo}
          </h3>
          <p className="text-xs sm:text-sm text-[#C6A45E] font-medium">
            {track.libro || track.genero || 'Fraternidad Guerreros de la Luz'}
          </p>
        </div>
      </div>

      {/* Scrubber y controles inferiores */}
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Barra interactiva (scrubber) */}
        <div>
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#C6A45E] focus:outline-none"
              aria-label="Posición de reproducción"
            />
          </div>
          <div className="flex justify-between text-xs text-[#A7A8AD] font-mono mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Controles Principales */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onPrevious}
            className="w-12 h-12 rounded-full bg-[#1B1D22] hover:bg-[#24272E] text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            aria-label="Pista anterior"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] flex items-center justify-center shadow-lg shadow-[#C6A45E]/30 transition-transform active:scale-95 cursor-pointer"
            aria-label={isPlaying ? 'Pausar reproducción' : 'Iniciar reproducción'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-12 h-12 rounded-full bg-[#1B1D22] hover:bg-[#24272E] text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            aria-label="Pista siguiente"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Controles Secundarios: Repetir, Velocidad, Aleatorio, Descarga */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {/* Repetición */}
          <button
            onClick={onCycleRepeat}
            className={`p-2.5 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
              repeatMode !== 'off'
                ? 'text-[#C6A45E] bg-[#C6A45E]/10'
                : 'text-[#A7A8AD] hover:text-white'
            }`}
            title={`Repetición: ${
              repeatMode === 'off' ? 'Desactivada' : repeatMode === 'all' ? 'Toda la lista' : 'Pista actual'
            }`}
            aria-label="Cambiar modo de repetición"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            <span className="text-[10px] uppercase">
              {repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'Todo' : '1'}
            </span>
          </button>

          {/* Selector de velocidad */}
          <button
            onClick={onCycleSpeed}
            className="px-3 py-1.5 rounded-full bg-[#1B1D22] hover:bg-[#24272E] border border-white/10 text-xs font-bold text-[#F5F5F2] hover:text-[#C6A45E] transition-colors cursor-pointer"
            title="Velocidad de reproducción"
            aria-label={`Velocidad actual: ${playbackSpeed}x`}
          >
            {playbackSpeed}x
          </button>

          {/* Aleatorio */}
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
              shuffle ? 'text-[#C6A45E] bg-[#C6A45E]/10' : 'text-[#A7A8AD] hover:text-white'
            }`}
            title={shuffle ? 'Modo aleatorio activado' : 'Modo aleatorio desactivado'}
            aria-label="Alternar modo aleatorio"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Descarga o Drive */}
          <button
            onClick={onDownload}
            className="p-2.5 rounded-lg text-[#A7A8AD] hover:text-[#C6A45E] transition-colors cursor-pointer"
            title="Descargar o abrir en Drive"
            aria-label="Descargar pista de audio"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
