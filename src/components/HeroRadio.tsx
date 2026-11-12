import React from 'react';
import { Play, Music, MessageSquare, BookOpen, Sun, Radio, Sparkles } from 'lucide-react';
import { CategoryType } from '../types/index.ts';

interface HeroRadioProps {
  onStartRadio: (category: CategoryType) => void;
  onSelectCategory: (category: CategoryType) => void;
  categoryCounts: Record<CategoryType, number>;
}

export const HeroRadio: React.FC<HeroRadioProps> = ({
  onStartRadio,
  onSelectCategory,
  categoryCounts
}) => {
  return (
    <section className="mb-8">
      {/* Hero Banner */}
      <div className="text-center py-6 px-4 sm:py-8 mb-6 bg-gradient-to-b from-[#1B1D22]/60 to-transparent rounded-2xl border border-white/5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6A45E]/10 border border-[#C6A45E]/30 text-[#C6A45E] text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Emisión Fraternal 24/7</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-[#F5F5F2] uppercase mb-2">
          Radio Guerreros de la Luz
        </h2>
        <p className="text-sm sm:text-base text-[#A7A8AD] italic max-w-lg mx-auto mb-6">
          Música, compartimientos y mensajes para acompañar tu camino.
        </p>

        <button
          onClick={() => onStartRadio('Música')}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#C6A45E] to-[#A88642] text-[#101114] font-bold text-sm sm:text-base tracking-wider uppercase shadow-lg shadow-[#C6A45E]/20 hover:shadow-[#C6A45E]/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          aria-label="Iniciar modo radio continua"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Escuchar Radio</span>
        </button>
      </div>

      {/* Grid de 4 Categorías Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Categoría: Música */}
        <div
          onClick={() => onSelectCategory('Música')}
          className="group relative bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 hover:border-[#C6A45E]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-sm"
          role="button"
          tabIndex={0}
          aria-label="Abrir sección de Música"
          onKeyDown={(e) => e.key === 'Enter' && onSelectCategory('Música')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#C6A45E]/10 group-hover:bg-[#C6A45E]/20 text-[#C6A45E] flex items-center justify-center mb-3 transition-colors">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#C6A45E] transition-colors">
                Música
              </h3>
              <span className="text-xs text-[#A7A8AD] bg-black/30 px-2 py-0.5 rounded-full">
                {categoryCounts['Música'] || 0}
              </span>
            </div>
            <p className="text-xs text-[#A7A8AD] line-clamp-2">
              Canciones y géneros reflexivos y acústicos.
            </p>
          </div>
        </div>

        {/* Categoría: Compartimientos */}
        <div
          onClick={() => onSelectCategory('Compartimientos')}
          className="group relative bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 hover:border-[#C6A45E]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-sm"
          role="button"
          tabIndex={0}
          aria-label="Abrir sección de Compartimientos"
          onKeyDown={(e) => e.key === 'Enter' && onSelectCategory('Compartimientos')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#C6A45E]/10 group-hover:bg-[#C6A45E]/20 text-[#C6A45E] flex items-center justify-center mb-3 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#C6A45E] transition-colors">
                Compartimientos
              </h3>
              <span className="text-xs text-[#A7A8AD] bg-black/30 px-2 py-0.5 rounded-full">
                {categoryCounts['Compartimientos'] || 0}
              </span>
            </div>
            <p className="text-xs text-[#A7A8AD] line-clamp-2">
              Experiencias, mensajes fraternales y fe viva.
            </p>
          </div>
        </div>

        {/* Categoría: Audiolibros */}
        <div
          onClick={() => onSelectCategory('Audiolibros')}
          className="group relative bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 hover:border-[#C6A45E]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-sm"
          role="button"
          tabIndex={0}
          aria-label="Abrir sección de Audiolibros"
          onKeyDown={(e) => e.key === 'Enter' && onSelectCategory('Audiolibros')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#C6A45E]/10 group-hover:bg-[#C6A45E]/20 text-[#C6A45E] flex items-center justify-center mb-3 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#C6A45E] transition-colors">
                Audiolibros
              </h3>
              <span className="text-xs text-[#A7A8AD] bg-black/30 px-2 py-0.5 rounded-full">
                {categoryCounts['Audiolibros'] || 0}
              </span>
            </div>
            <p className="text-xs text-[#A7A8AD] line-clamp-2">
              Lecturas completas con memoria de capítulo.
            </p>
          </div>
        </div>

        {/* Categoría: Alabanzas */}
        <div
          onClick={() => onSelectCategory('Alabanzas')}
          className="group relative bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 hover:border-[#C6A45E]/40 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer shadow-sm"
          role="button"
          tabIndex={0}
          aria-label="Abrir sección de Alabanzas"
          onKeyDown={(e) => e.key === 'Enter' && onSelectCategory('Alabanzas')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#C6A45E]/10 group-hover:bg-[#C6A45E]/20 text-[#C6A45E] flex items-center justify-center mb-3 transition-colors">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#F5F5F2] group-hover:text-[#C6A45E] transition-colors">
                Alabanzas
              </h3>
              <span className="text-xs text-[#A7A8AD] bg-black/30 px-2 py-0.5 rounded-full">
                {categoryCounts['Alabanzas'] || 0}
              </span>
            </div>
            <p className="text-xs text-[#A7A8AD] line-clamp-2">
              Música de exaltación, paz y adoración.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Modo Radio por Categoría */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={() => onStartRadio('Música')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-medium text-[#F5F5F2] hover:text-[#C6A45E] transition-colors cursor-pointer"
        >
          <Radio className="w-4 h-4 text-[#C6A45E]" />
          <span>Radio Continua de Música</span>
        </button>
        <button
          onClick={() => onStartRadio('Compartimientos')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1B1D22] hover:bg-[#24272E] border border-white/5 text-xs sm:text-sm font-medium text-[#F5F5F2] hover:text-[#C6A45E] transition-colors cursor-pointer"
        >
          <Radio className="w-4 h-4 text-[#C6A45E]" />
          <span>Radio Continua de Compartimientos</span>
        </button>
      </div>
    </section>
  );
};
