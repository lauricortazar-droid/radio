import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Play, RotateCcw, Heart, Download } from 'lucide-react';
import { AudioTrack, BookProgress } from '../types/index.ts';
import { groupAudiobooks, formatTime } from '../utils/catalogLogic.ts';

interface AudiobookViewProps {
  tracks: AudioTrack[];
  currentTrackId?: string;
  isPlaying: boolean;
  favorites: string[];
  bookProgress: Record<string, BookProgress>;
  onBack: () => void;
  onPlayChapter: (track: AudioTrack, bookChapters: AudioTrack[], resumeSeconds?: number) => void;
  onToggleFavorite: (trackId: string) => void;
  onDownloadTrack: (track: AudioTrack) => void;
}

export const AudiobookView: React.FC<AudiobookViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  favorites,
  bookProgress,
  onBack,
  onPlayChapter,
  onToggleFavorite,
  onDownloadTrack
}) => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Agrupar audiolibros
  const groupedBooks = groupAudiobooks(tracks);
  const bookTitles = Object.keys(groupedBooks);

  // Si se seleccionó un libro específico, mostrar sus capítulos
  if (selectedBook && groupedBooks[selectedBook]) {
    const chapters = groupedBooks[selectedBook];
    const progress = bookProgress[selectedBook];

    return (
      <section className="animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedBook(null)}
            className="w-10 h-10 rounded-full bg-[#1B1D22] hover:bg-[#24272E] text-[#A7A8AD] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Volver a la biblioteca de audiolibros"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F2]">{selectedBook}</h2>
            <span className="text-xs text-[#C6A45E]">{chapters.length} capítulos</span>
          </div>
        </div>

        {/* Banner de reanudación si hay progreso guardado */}
        {progress && (
          <div className="mb-4 bg-gradient-to-r from-[#1B1D22] to-[#24272E] border border-[#C6A45E]/30 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A45E] block mb-0.5">
                Punto de lectura guardado
              </span>
              <p className="text-sm font-semibold text-white">
                Capítulo {progress.chapter || 1} en {formatTime(progress.seconds)}
              </p>
            </div>
            <button
              onClick={() => {
                const targetChapter = chapters.find((c) => c.id === progress.trackId) || chapters[0];
                onPlayChapter(targetChapter, chapters, progress.seconds);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] text-xs font-bold transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reanudar Lectura</span>
            </button>
          </div>
        )}

        {/* Lista de Capítulos */}
        <div className="flex flex-col gap-2">
          {chapters.map((chapter, index) => {
            const isCurrent = currentTrackId === chapter.id;
            const isFav = favorites.includes(chapter.id);
            const chapterNum = chapter.capitulo || index + 1;

            return (
              <div
                key={chapter.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#C6A45E]/10 border-[#C6A45E]/40'
                    : 'bg-[#1B1D22] hover:bg-[#24272E] border-white/5'
                }`}
              >
                <div
                  onClick={() => onPlayChapter(chapter, chapters)}
                  className="w-10 text-center shrink-0 cursor-pointer"
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex items-center justify-center gap-0.5 h-4">
                      <span className="w-1 h-3 bg-[#C6A45E] animate-pulse" />
                      <span className="w-1 h-4 bg-[#C6A45E] animate-bounce" />
                      <span className="w-1 h-2 bg-[#C6A45E] animate-pulse" />
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-[#A7A8AD] group-hover:text-white">
                      Cap. {chapterNum}
                    </span>
                  )}
                </div>

                <div
                  onClick={() => onPlayChapter(chapter, chapters)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <h4
                    className={`text-sm font-semibold truncate ${
                      isCurrent ? 'text-[#C6A45E]' : 'text-[#F5F5F2]'
                    }`}
                  >
                    {chapter.titulo}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#A7A8AD]">
                    {chapter.duracion && <span>{formatTime(chapter.duracion)}</span>}
                    {chapter.isDriveFile && (
                      <span className="text-[10px] text-emerald-400 font-medium">Drive</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(chapter.id)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isFav
                        ? 'text-[#C6A45E] hover:text-[#C6A45E]'
                        : 'text-[#A7A8AD] hover:text-white'
                    }`}
                    aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => onDownloadTrack(chapter)}
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
      </section>
    );
  }

  // Vista General de Libros en Biblioteca
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
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F2]">Biblioteca de Audiolibros</h2>
          <span className="text-xs text-[#C6A45E]">{bookTitles.length} títulos disponibles</span>
        </div>
      </div>

      {bookTitles.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#1B1D22]/40 rounded-xl border border-dashed border-white/5">
          <BookOpen className="w-10 h-10 text-[#A7A8AD]/40 mx-auto mb-2" />
          <p className="text-sm text-[#A7A8AD]">No hay audiolibros disponibles actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookTitles.map((title) => {
            const chapters = groupedBooks[title];
            const progress = bookProgress[title];

            return (
              <div
                key={title}
                className="bg-[#1B1D22] border border-white/5 hover:border-[#C6A45E]/40 rounded-2xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#C6A45E]/10 text-[#C6A45E] flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F5F5F2] mb-1">{title}</h3>
                  <p className="text-xs text-[#A7A8AD] mb-3">{chapters.length} capítulos</p>

                  {progress && (
                    <div className="inline-block bg-[#C6A45E]/15 border border-[#C6A45E]/30 rounded-lg px-2.5 py-1 text-xs text-[#C6A45E] font-medium mb-4">
                      Progreso: Cap. {progress.chapter || 1} • {formatTime(progress.seconds)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedBook(title)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#24272E] hover:bg-[#C6A45E] text-[#F5F5F2] hover:text-[#101114] text-xs font-bold transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{progress ? 'Continuar Audiolibro' : 'Explorar Capítulos'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
