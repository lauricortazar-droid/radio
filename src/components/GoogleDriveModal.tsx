import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  HardDrive,
  FolderSearch,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Folder,
  Link,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { searchDriveFolders, scanDriveAudioLibrary, DriveFolderInfo } from '../services/driveService.ts';
import { AudioTrack } from '../types/index.ts';

interface GoogleDriveModalProps {
  isOpen: boolean;
  currentUser: User | null;
  accessToken: string | null;
  customScriptUrl?: string;
  onClose: () => void;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onTracksImported: (tracks: AudioTrack[]) => void;
  onSaveScriptUrl: (url: string) => void;
  onShowToast: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  currentUser,
  accessToken,
  customScriptUrl = '',
  onClose,
  onSignIn,
  onSignOut,
  onTracksImported,
  onSaveScriptUrl,
  onShowToast
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [folderQuery, setFolderQuery] = useState('Radio Guerreros');
  const [foundFolders, setFoundFolders] = useState<DriveFolderInfo[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [scriptUrlInput, setScriptUrlInput] = useState(customScriptUrl);
  const [isTestingScript, setIsTestingScript] = useState(false);

  if (!isOpen) return null;

  // Buscar carpetas en Google Drive
  const handleSearchFolders = async () => {
    if (!accessToken) {
      onShowToast('Inicia sesión con Google para buscar carpetas en tu Drive.');
      return;
    }
    setIsScanning(true);
    try {
      const folders = await searchDriveFolders(accessToken, folderQuery);
      setFoundFolders(folders);
      if (folders.length > 0) {
        setSelectedFolderId(folders[0].id);
        onShowToast(`Se encontraron ${folders.length} carpetas.`);
      } else {
        onShowToast('No se encontró ninguna carpeta con ese nombre.');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Error al buscar en Drive.');
    } finally {
      setIsScanning(false);
    }
  };

  // Escanear e importar audios de la carpeta seleccionada
  const handleScanSelectedFolder = async (folderId: string) => {
    if (!accessToken || !folderId) return;
    setIsScanning(true);
    onShowToast('Escaneando subcarpetas y pistas en Drive...');
    try {
      const tracks = await scanDriveAudioLibrary(accessToken, folderId);
      if (tracks.length > 0) {
        onTracksImported(tracks);
        onShowToast(`¡Éxito! Se importaron ${tracks.length} audios de tu Google Drive.`);
        onClose();
      } else {
        onShowToast('No se encontraron archivos de audio compatibles en esta carpeta.');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Error al escanear audios en Drive.');
    } finally {
      setIsScanning(false);
    }
  };

  // Probar endpoint de Google Apps Script
  const handleTestAndSaveScript = async () => {
    if (!scriptUrlInput.trim()) {
      onSaveScriptUrl('');
      onShowToast('URL de Apps Script desvinculada.');
      return;
    }

    setIsTestingScript(true);
    try {
      const res = await fetch(scriptUrlInput.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.audios)) {
        onSaveScriptUrl(scriptUrlInput.trim());
        onTracksImported(data.audios);
        onShowToast(`¡Conectado! Se indexaron ${data.audios.length} audios desde Apps Script.`);
        onClose();
      } else {
        throw new Error('El JSON devuelto no contiene un array de "audios".');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(`Fallo de conexión: ${err.message}`);
    } finally {
      setIsTestingScript(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Conexión con Google Drive"
    >
      <div className="bg-[#1B1D22] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C6A45E]/15 border border-[#C6A45E]/30 text-[#C6A45E] flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Drive y Catálogo</h3>
              <p className="text-xs text-[#A7A8AD]">Sincroniza tus audios desde la nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#24272E] text-[#A7A8AD] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sección 1: Conexión con Cuenta de Google Workspace */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C6A45E]">
            1. Cuenta de Google Drive
          </h4>

          {currentUser ? (
            <div className="bg-[#24272E] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'G'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conectado</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">
                    {currentUser.displayName || 'Usuario Google'}
                  </p>
                  <p className="text-xs text-[#A7A8AD] truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-[#A7A8AD] hover:text-rose-400 transition-colors cursor-pointer"
                title="Desconectar cuenta"
                aria-label="Cerrar sesión de Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#24272E] border border-white/5 rounded-xl p-4 text-center space-y-3">
              <p className="text-xs text-[#A7A8AD]">
                Inicia sesión con tu cuenta de Google para leer y reproducir directamente los audios de tus carpetas de Google Drive con permisos autorizados.
              </p>
              {/* Official Sign in with Google Button Style */}
              <button
                onClick={onSignIn}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-slate-100 text-gray-800 text-sm font-medium shadow transition-transform active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Acceder con Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Sección 2: Escanear Carpeta en Drive */}
        {currentUser && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C6A45E]">
              2. Explorar y Escanear Carpeta
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={folderQuery}
                onChange={(e) => setFolderQuery(e.target.value)}
                placeholder="Nombre de la carpeta (ej. Radio Guerreros)"
                className="flex-1 bg-[#24272E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7A8AD]/50 focus:outline-none focus:border-[#C6A45E]"
              />
              <button
                onClick={handleSearchFolders}
                disabled={isScanning}
                className="px-3 py-2 bg-[#24272E] hover:bg-[#2e323b] border border-[#C6A45E]/30 text-[#C6A45E] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FolderSearch className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>

            {foundFolders.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {foundFolders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#24272E]/70 border border-white/5 hover:border-[#C6A45E]/40 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-[#C6A45E] shrink-0" />
                      <span className="text-white truncate">{f.name}</span>
                    </div>
                    <button
                      onClick={() => handleScanSelectedFolder(f.id)}
                      disabled={isScanning}
                      className="px-2.5 py-1 rounded bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] text-[11px] font-bold shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? 'Escaneando...' : 'Importar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sección 3: Conectar mediante Google Apps Script URL */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C6A45E]">
              3. Endpoint Google Apps Script (Opcional)
            </h4>
            <span className="text-[10px] text-[#A7A8AD]">Entregable B</span>
          </div>
          <p className="text-xs text-[#A7A8AD]">
            Si desplegaste el script backend <code className="text-[#C6A45E]">Code.gs</code> en tu Drive, pega aquí la URL Web App generada (terminada en <code className="text-white">/exec</code>) para sincronizar en vivo.
          </p>

          <div className="flex gap-2">
            <input
              type="url"
              value={scriptUrlInput}
              onChange={(e) => setScriptUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-[#24272E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A7A8AD]/50 focus:outline-none focus:border-[#C6A45E]"
            />
            <button
              onClick={handleTestAndSaveScript}
              disabled={isTestingScript}
              className="px-3 py-2 bg-[#C6A45E] hover:bg-[#D4B36D] text-[#101114] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTestingScript ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Link className="w-3.5 h-3.5" />
              )}
              <span>Conectar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
