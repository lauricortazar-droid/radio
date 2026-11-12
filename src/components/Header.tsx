import React from 'react';
import { User } from 'firebase/auth';
import { Radio, RefreshCw, BookOpen, HardDrive, UserCheck, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  currentUser: User | null;
  onHomeClick: () => void;
  onRefreshClick: () => void;
  onDriveClick: () => void;
  onDocsClick: () => void;
  driveTrackCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  currentUser,
  onHomeClick,
  onRefreshClick,
  onDriveClick,
  onDocsClick,
  driveTrackCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101114]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo y título de marca */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio de Radio Guerreros"
          onKeyDown={(e) => e.key === 'Enter' && onHomeClick()}
        >
          <div className="w-10 h-10 rounded-full bg-[#1B1D22] border-2 border-[#C6A45E] flex items-center justify-center text-[#C6A45E] shadow-sm shadow-[#C6A45E]/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-[#C6A45E]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-white leading-none">
              Radio Guerreros
            </h1>
            <span className="text-[11px] text-[#C6A45E] font-medium tracking-wide">
              Fraternidad de la Luz
            </span>
          </div>
        </div>

        {/* Acciones de la barra */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Indicador de conexión */}
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#1B1D22] border border-white/5 text-[#A7A8AD]"
            title={isOnline ? 'Conexión a internet activa' : 'Sin conexión a internet'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">En línea</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Botón Google Drive */}
          <button
            onClick={onDriveClick}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              currentUser
                ? 'bg-[#C6A45E]/15 border-[#C6A45E] text-[#C6A45E]'
                : 'bg-[#1B1D22] hover:bg-[#24272E] border-white/10 text-[#F5F5F2]'
            }`}
            aria-label="Configurar Google Drive"
            title="Conectar o explorar Google Drive"
          >
            {currentUser ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[#C6A45E]" />
                <span className="max-w-[80px] sm:max-w-[130px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Drive'}
                </span>
                {driveTrackCount > 0 && (
                  <span className="bg-[#C6A45E] text-[#101114] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {driveTrackCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-[#C6A45E]" />
                <span className="hidden sm:inline">Google Drive</span>
              </>
            )}
          </button>

          {/* Botón Documentación y Apps Script */}
          <button
            onClick={onDocsClick}
            className="p-2 rounded-lg bg-[#1B1D22] hover:bg-[#24272E] text-[#A7A8AD] hover:text-[#C6A45E] transition-colors"
            aria-label="Abrir manual de configuración y código Apps Script"
            title="Guía de Google Drive, Apps Script y PWA"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Botón Sincronizar / Refrescar */}
          <button
            onClick={onRefreshClick}
            className="p-2 rounded-lg bg-[#1B1D22] hover:bg-[#24272E] text-[#A7A8AD] hover:text-white transition-colors"
            aria-label="Actualizar catálogo"
            title="Sincronizar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
