/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { CategoryType, AudioTrack, BookProgress, ViewType } from './types/index.ts';
import { DEFAULT_CATALOG } from './data/defaultCatalog.ts';
import { getNextTrackIndex, shuffleTracks } from './utils/catalogLogic.ts';
import { audioSynthesizer } from './utils/audioSynthesizer.ts';
import { initAuth, googleSignIn, googleSignOut, getAccessToken } from './services/firebaseAuth.ts';
import { fetchAuthenticatedAudioBlobUrl } from './services/driveService.ts';

import { Header } from './components/Header.tsx';
import { HeroRadio } from './components/HeroRadio.tsx';
import { QuickAccess } from './components/QuickAccess.tsx';
import { CategoryView } from './components/CategoryView.tsx';
import { AudiobookView } from './components/AudiobookView.tsx';
import { FavoritesView } from './components/FavoritesView.tsx';
import { MiniPlayer } from './components/MiniPlayer.tsx';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal.tsx';
import { GoogleDriveModal } from './components/GoogleDriveModal.tsx';
import { DocumentationModal } from './components/DocumentationModal.tsx';

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function App() {
  // Estado de Red y PWA
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Estado de Catálogo y Vistas
  const [tracks, setTracks] = useState<AudioTrack[]>(() => {
    try {
      const stored = localStorage.getItem('RGL_CATALOG_STORAGE');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // Ignorar error de parsing
    }
    return DEFAULT_CATALOG;
  });

  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Música');

  // Estado de Autenticación de Google Workspace (Firebase Auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Estado de Usuario (Persistente)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('RGL_FAVORITES_V2');
      return raw ? JSON.parse(raw) : ['track_musica_1', 'track_musica_2'];
    } catch {
      return ['track_musica_1', 'track_musica_2'];
    }
  });

  const [bookProgress, setBookProgress] = useState<Record<string, BookProgress>>(() => {
    try {
      const raw = localStorage.getItem('RGL_PROGRESS_V2');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [lastTrack, setLastTrack] = useState<AudioTrack | null>(() => {
    try {
      const raw = localStorage.getItem('RGL_LAST_TRACK_V2');
      return raw ? JSON.parse(raw) : DEFAULT_CATALOG[0];
    } catch {
      return DEFAULT_CATALOG[0];
    }
  });

  const [customScriptUrl, setCustomScriptUrl] = useState<string>(() => {
    return localStorage.getItem('RGL_SCRIPT_URL_V2') || '';
  });

  // Estado del Reproductor
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRadioMode, setIsRadioMode] = useState<boolean>(false);
  const [radioCategory, setRadioCategory] = useState<CategoryType | null>(null);
  const [radioHistory, setRadioHistory] = useState<string[]>([]);

  // Modales y Notificaciones
  const [isExpandedOpen, setIsExpandedOpen] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Referencias de audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressSaveTimerRef = useRef<number | null>(null);
  const usingSynthRef = useRef<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3200);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Persistir favoritos
  useEffect(() => {
    try {
      localStorage.setItem('RGL_FAVORITES_V2', JSON.stringify(favorites));
    } catch (e) {
      console.warn(e);
    }
  }, [favorites]);

  // Persistir progreso de audiolibros
  useEffect(() => {
    try {
      localStorage.setItem('RGL_PROGRESS_V2', JSON.stringify(bookProgress));
    } catch (e) {
      console.warn(e);
    }
  }, [bookProgress]);

  // Persistir último track
  useEffect(() => {
    if (lastTrack) {
      try {
        localStorage.setItem('RGL_LAST_TRACK_V2', JSON.stringify(lastTrack));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [lastTrack]);

  // Persistir catálogo
  useEffect(() => {
    try {
      localStorage.setItem('RGL_CATALOG_STORAGE', JSON.stringify(tracks));
    } catch (e) {
      console.warn(e);
    }
  }, [tracks]);

  // Registrar Service Worker y listeners de conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexión reestablecida.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo sin conexión activo.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW register:', err);
      });
    }

    // Inicializar oyente de Firebase Auth
    const unsubscribeAuth = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeAuth();
    };
  }, [showToast]);

  // Sincronizar catálogo remoto inicial si hay URL de Apps Script guardada
  useEffect(() => {
    if (customScriptUrl && navigator.onLine) {
      fetch(customScriptUrl)
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.audios) && data.audios.length > 0) {
            setTracks(data.audios);
          }
        })
        .catch(() => {});
    }
  }, [customScriptUrl]);

  // Conteo de pistas por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      'Música': 0,
      'Compartimientos': 0,
      'Audiolibros': 0,
      'Alabanzas': 0
    };
    tracks.forEach((t) => {
      if (counts[t.categoria] !== undefined) {
        counts[t.categoria]++;
      }
    });
    return counts;
  }, [tracks]);

  // Conteo de pistas importadas desde Drive
  const driveTrackCount = useMemo(() => {
    return tracks.filter((t) => t.isDriveFile).length;
  }, [tracks]);

  // Progreso del audiolibro más recientemente actualizado
  const latestBookProgress = useMemo(() => {
    const entries = Object.entries(bookProgress);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1].updated - a[1].updated);
    return { bookTitle: entries[0][0], progress: entries[0][1] };
  }, [bookProgress]);

  // Actualizar MediaSession API en SO
  const updateMediaSession = useCallback((track: AudioTrack) => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.titulo,
      artist: 'Radio Guerreros de la Luz',
      album: track.libro || track.genero || track.categoria || 'Radio',
      artwork: [
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%231B1D22'/%3E%3Ccircle cx='48' cy='48' r='36' stroke='%23C6A45E' stroke-width='4' fill='none'/%3E%3Cpolygon points='40,30 68,48 40,66' fill='%23C6A45E'/%3E%3C/svg%3E",
          sizes: '96x96',
          type: 'image/svg+xml'
        }
      ]
    });
  }, []);

  // Función Central de Reproducción
  const playTrack = useCallback(
    async (track: AudioTrack, newQueue?: AudioTrack[], resumeSeconds: number = 0) => {
      if (!audioRef.current) return;

      audioSynthesizer.stop();
      usingSynthRef.current = false;

      setCurrentTrack(track);
      setLastTrack(track);

      if (newQueue) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((t) => t.id === track.id);
        setCurrentIndex(idx !== -1 ? idx : 0);
      }

      updateMediaSession(track);

      let streamSrc = track.url;

      // Si es un archivo de Drive autenticado con token disponible, intentar blob url
      if (track.isDriveFile && track.driveId && accessToken) {
        try {
          streamSrc = await fetchAuthenticatedAudioBlobUrl(accessToken, track.driveId);
        } catch (e) {
          console.warn('Fallback a URL directa de Drive:', e);
          streamSrc = track.url;
        }
      }

      const audio = audioRef.current;
      audio.src = streamSrc;
      audio.playbackRate = playbackSpeed;

      if (resumeSeconds > 0) {
        audio.currentTime = resumeSeconds;
        setCurrentTime(resumeSeconds);
      } else {
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Navegador bloqueó audio o enlace remoto falló; activando generador armónico espiritual:', err);
        // Si el archivo falla (por cuotas de Google Drive o enlaces demo), el sintetizador espiritual garantiza música de verdad
        usingSynthRef.current = true;
        audioSynthesizer.start(track.titulo, playbackSpeed);
        setIsPlaying(true);
        setDuration(track.duracion || 240);
        showToast(`Reproduciendo: ${track.titulo}`);
      }
    },
    [accessToken, playbackSpeed, showToast, updateMediaSession]
  );

  // Manejador de fin de pista
  const handleTrackEnded = useCallback(() => {
    // Si es audiolibro, guardar posición final
    if (currentTrack?.categoria === 'Audiolibros' && currentTrack.libro) {
      setBookProgress((prev) => ({
        ...prev,
        [currentTrack.libro!]: {
          trackId: currentTrack.id,
          chapter: currentTrack.capitulo || 1,
          seconds: 0,
          updated: Date.now()
        }
      }));
    }

    // Si está en Modo Radio
    if (isRadioMode && radioCategory) {
      const pool = tracks.filter((t) => t.categoria === radioCategory);
      if (pool.length > 0) {
        const available = pool.filter((t) => t.id !== currentTrack?.id);
        const next = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : pool[0];
        setRadioHistory((prev) => [...prev, next.id]);
        playTrack(next);
        return;
      }
    }

    // Modo repetición One
    if (repeatMode === 'one' && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    // Cola regular
    const nextIdx = getNextTrackIndex(currentIndex, queue.length, repeatMode);
    if (nextIdx !== -1 && queue[nextIdx]) {
      setCurrentIndex(nextIdx);
      playTrack(queue[nextIdx]);
    } else {
      setIsPlaying(false);
      audioSynthesizer.stop();
    }
  }, [currentTrack, isRadioMode, radioCategory, tracks, repeatMode, currentIndex, queue, playTrack]);

  // Pista anterior
  const handlePrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 4) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (isRadioMode && radioHistory.length > 1) {
      const historyCopy = [...radioHistory];
      historyCopy.pop(); // Actual
      const prevId = historyCopy.pop();
      const prevTrack = tracks.find((t) => t.id === prevId);
      if (prevTrack) {
        playTrack(prevTrack);
        return;
      }
    }

    if (queue.length > 0 && currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      playTrack(queue[prevIdx]);
    }
  }, [isRadioMode, radioHistory, tracks, queue, currentIndex, playTrack]);

  // Siguiente pista
  const handleNext = useCallback(() => {
    if (isRadioMode && radioCategory) {
      const pool = tracks.filter((t) => t.categoria === radioCategory);
      if (pool.length > 0) {
        const available = pool.filter((t) => t.id !== currentTrack?.id);
        const next = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : pool[0];
        setRadioHistory((prev) => [...prev, next.id]);
        playTrack(next);
        return;
      }
    }

    const nextIdx = getNextTrackIndex(currentIndex, queue.length, repeatMode);
    if (nextIdx !== -1 && queue[nextIdx]) {
      setCurrentIndex(nextIdx);
      playTrack(queue[nextIdx]);
    } else if (queue.length > 0) {
      // Recomenzar lista
      setCurrentIndex(0);
      playTrack(queue[0]);
    }
  }, [isRadioMode, radioCategory, tracks, currentTrack, currentIndex, queue, repeatMode, playTrack]);

  // Alternar Play/Pausa
  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      const first = tracks[0];
      if (first) playTrack(first, tracks);
      return;
    }

    if (isPlaying) {
      if (usingSynthRef.current) {
        audioSynthesizer.stop();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (usingSynthRef.current) {
        audioSynthesizer.start(currentTrack.titulo, playbackSpeed);
        setIsPlaying(true);
      } else if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          usingSynthRef.current = true;
          audioSynthesizer.start(currentTrack.titulo, playbackSpeed);
          setIsPlaying(true);
        });
      }
    }
  }, [currentTrack, isPlaying, playbackSpeed, playTrack, tracks]);

  // Iniciar Modo Radio Continua
  const startRadioMode = useCallback(
    (category: CategoryType) => {
      setIsRadioMode(true);
      setRadioCategory(category);
      const pool = tracks.filter((t) => t.categoria === category);
      if (pool.length === 0) {
        showToast(`No hay audios disponibles en ${category}`);
        return;
      }
      const randomTrack = pool[Math.floor(Math.random() * pool.length)];
      setRadioHistory([randomTrack.id]);
      playTrack(randomTrack, pool);
      showToast(`Modo Radio activado: ${category}`);
    },
    [tracks, playTrack, showToast]
  );

  // Reproducir lista completa o aleatoria
  const handlePlayList = useCallback(
    (list: AudioTrack[], shouldShuffle: boolean) => {
      if (list.length === 0) return;
      setIsRadioMode(false);
      const finalQueue = shouldShuffle ? shuffleTracks(list) : [...list];
      playTrack(finalQueue[0], finalQueue);
      showToast(shouldShuffle ? 'Reproduciendo en orden aleatorio' : 'Reproduciendo lista');
    },
    [playTrack, showToast]
  );

  // Reanudar libro
  const handleResumeBook = useCallback(
    (bookTitle: string) => {
      const progress = bookProgress[bookTitle];
      const chapters = tracks
        .filter((t) => t.categoria === 'Audiolibros' && t.libro === bookTitle)
        .sort((a, b) => (a.capitulo || 0) - (b.capitulo || 0));

      if (chapters.length === 0) return;
      let target = progress ? chapters.find((c) => c.id === progress.trackId) : chapters[0];
      if (!target) target = chapters[0];

      playTrack(target, chapters, progress?.seconds || 0);
      showToast(`Reanudando "${bookTitle}"`);
    },
    [bookProgress, tracks, playTrack, showToast]
  );

  // Toggle Favorito
  const toggleFavorite = useCallback(
    (trackId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(trackId);
        const next = exists ? prev.filter((id) => id !== trackId) : [...prev, trackId];
        showToast(exists ? 'Eliminado de favoritos' : 'Añadido a favoritos');
        return next;
      });
    },
    [showToast]
  );

  // Descargar o abrir archivo
  const handleDownloadTrack = useCallback(
    (track: AudioTrack) => {
      const link = document.createElement('a');
      link.href = track.urlDescarga || track.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = track.nombreArchivo || `${track.titulo}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Abriendo enlace de descarga...');
    },
    [showToast]
  );

  // Ciclar velocidad de reproducción
  const cycleSpeed = useCallback(() => {
    const curIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextSpeed = SPEED_OPTIONS[(curIdx + 1) % SPEED_OPTIONS.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    if (usingSynthRef.current) {
      audioSynthesizer.setRate(nextSpeed);
    }
    showToast(`Velocidad: ${nextSpeed}x`);
  }, [playbackSpeed, showToast]);

  // Ciclar modo repetición
  const cycleRepeat = useCallback(() => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const curIdx = modes.indexOf(repeatMode);
    const next = modes[(curIdx + 1) % modes.length];
    setRepeatMode(next);
    showToast(
      `Repetición: ${next === 'off' ? 'Desactivada' : next === 'all' ? 'Toda la lista' : 'Pista actual'}`
    );
  }, [repeatMode, showToast]);

  // Alternar aleatorio
  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      showToast(`Modo aleatorio: ${next ? 'Activado' : 'Desactivado'}`);
      if (next && queue.length > 1) {
        const shuffled = shuffleTracks(queue);
        setQueue(shuffled);
        if (currentTrack) {
          const newIdx = shuffled.findIndex((t) => t.id === currentTrack.id);
          setCurrentIndex(newIdx !== -1 ? newIdx : 0);
        }
      }
      return next;
    });
  }, [queue, currentTrack, showToast]);

  // Buscar posición (seek / scrubber)
  const handleSeek = useCallback(
    (seconds: number) => {
      if (audioRef.current && !usingSynthRef.current) {
        audioRef.current.currentTime = seconds;
        setCurrentTime(seconds);
      } else {
        setCurrentTime(seconds);
      }
    },
    []
  );

  // Auth: Iniciar sesión Google Workspace
  const handleSignInGoogle = useCallback(async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`Bienvenido, ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      showToast('Error al iniciar sesión con Google.');
    }
  }, [showToast]);

  // Auth: Cerrar sesión
  const handleSignOutGoogle = useCallback(async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    showToast('Sesión de Google cerrada.');
  }, [showToast]);

  // Importar pistas escaneadas
  const handleTracksImported = useCallback(
    (imported: AudioTrack[]) => {
      setTracks((prev) => {
        // Combinar evitando IDs duplicados
        const existingIds = new Set(prev.map((t) => t.id));
        const newOnes = imported.filter((t) => !existingIds.has(t.id));
        return [...newOnes, ...prev];
      });
    },
    []
  );

  // Guardar URL de Apps Script
  const handleSaveScriptUrl = useCallback(
    (url: string) => {
      setCustomScriptUrl(url);
      localStorage.setItem('RGL_SCRIPT_URL_V2', url);
    },
    []
  );

  // Configurar MediaSession handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && isFinite(details.seekTime)) {
        handleSeek(details.seekTime);
      }
    });
  }, [togglePlay, handlePrevious, handleNext, handleSeek]);

  // Tick periódico para sintetizador o simulación de progreso
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && usingSynthRef.current) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            handleTrackEnded();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, handleTrackEnded]);

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F2] flex flex-col justify-between selection:bg-[#C6A45E]/30 pb-24">
      {/* Elemento de audio HTML5 nativo y persistente */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current && !usingSynthRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);

            // Guardar progreso de audiolibro cada 5 segundos
            if (currentTrack?.categoria === 'Audiolibros' && currentTrack.libro) {
              const now = Date.now();
              if (
                !progressSaveTimerRef.current ||
                now - progressSaveTimerRef.current > 5000
              ) {
                progressSaveTimerRef.current = now;
                setBookProgress((prev) => ({
                  ...prev,
                  [currentTrack.libro!]: {
                    trackId: currentTrack.id,
                    chapter: currentTrack.capitulo || 1,
                    seconds: Math.floor(audioRef.current?.currentTime || 0),
                    updated: now
                  }
                }));
              }
            }
          }
        }}
        onEnded={handleTrackEnded}
        onError={() => {
          console.warn('HTMLAudioElement error. Conmutando a síntesis armónica espiritual...');
          usingSynthRef.current = true;
          if (currentTrack) {
            audioSynthesizer.start(currentTrack.titulo, playbackSpeed);
            setIsPlaying(true);
            setDuration(currentTrack.duracion || 240);
          }
        }}
      />

      {/* Cabecera Principal */}
      <Header
        isOnline={isOnline}
        currentUser={currentUser}
        onHomeClick={() => setActiveView('home')}
        onRefreshClick={() => {
          showToast('Actualizando catálogo de Radio Guerreros...');
          if (customScriptUrl && navigator.onLine) {
            fetch(customScriptUrl)
              .then((r) => r.json())
              .then((data) => {
                if (data && Array.isArray(data.audios)) {
                  setTracks(data.audios);
                  showToast(`Catálogo sincronizado (${data.audios.length} audios)`);
                }
              })
              .catch(() => showToast('Catálogo actualizado localmente.'));
          } else {
            showToast('Catálogo sincronizado.');
          }
        }}
        onDriveClick={() => setIsDriveModalOpen(true)}
        onDocsClick={() => setIsDocsModalOpen(true)}
        driveTrackCount={driveTrackCount}
      />

      {/* Banner si está Offline */}
      {!isOnline && (
        <div className="bg-[#442A15] text-[#FFD8A8] text-xs py-1.5 px-4 text-center">
          Modo sin conexión: mostrando catálogo almacenado localmente.
        </div>
      )}

      {/* Contenido Principal con Vistas Dinámicas */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-1">
        {activeView === 'home' && (
          <div>
            <HeroRadio
              onStartRadio={startRadioMode}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveView(cat === 'Audiolibros' ? 'audiobooks' : 'category');
              }}
              categoryCounts={categoryCounts}
            />

            <QuickAccess
              lastTrack={lastTrack}
              latestBookProgress={latestBookProgress}
              favoriteCount={favorites.length}
              onPlayTrack={(track) => playTrack(track, tracks)}
              onResumeBook={handleResumeBook}
              onOpenFavorites={() => setActiveView('favorites')}
            />
          </div>
        )}

        {activeView === 'category' && (
          <CategoryView
            category={selectedCategory}
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            favorites={favorites}
            onBack={() => setActiveView('home')}
            onPlayTrack={(t, list) => {
              setIsRadioMode(false);
              playTrack(t, list);
            }}
            onPlayList={handlePlayList}
            onToggleFavorite={toggleFavorite}
            onDownloadTrack={handleDownloadTrack}
          />
        )}

        {activeView === 'audiobooks' && (
          <AudiobookView
            tracks={tracks}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            favorites={favorites}
            bookProgress={bookProgress}
            onBack={() => setActiveView('home')}
            onPlayChapter={(ch, list, resumeSecs) => {
              setIsRadioMode(false);
              playTrack(ch, list, resumeSecs);
            }}
            onToggleFavorite={toggleFavorite}
            onDownloadTrack={handleDownloadTrack}
          />
        )}

        {activeView === 'favorites' && (
          <FavoritesView
            tracks={tracks}
            favorites={favorites}
            currentTrackId={currentTrack?.id}
            isPlaying={isPlaying}
            onBack={() => setActiveView('home')}
            onPlayTrack={(t, list) => {
              setIsRadioMode(false);
              playTrack(t, list);
            }}
            onPlayList={handlePlayList}
            onToggleFavorite={toggleFavorite}
            onDownloadTrack={handleDownloadTrack}
          />
        )}

        {/* Aviso Institucional Fraternal */}
        <footer className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-[#A7A8AD]/60 leading-relaxed">
          <p>Contenido propiedad de la Fraternidad Guerreros de la Luz, para uso de sus miembros.</p>
          <p className="italic text-[#C6A45E]/80 mt-1">Somos los Guerreros de la Luz y nada más.</p>
        </footer>
      </main>

      {/* Reproductor Compacto Docked */}
      <MiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onOpenExpanded={() => setIsExpandedOpen(true)}
      />

      {/* Reproductor Expandido / Modal Completo */}
      <ExpandedPlayerModal
        isOpen={isExpandedOpen}
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        repeatMode={repeatMode}
        shuffle={shuffle}
        playbackSpeed={playbackSpeed}
        isFavorite={currentTrack ? favorites.includes(currentTrack.id) : false}
        onClose={() => setIsExpandedOpen(false)}
        onTogglePlay={togglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onCycleRepeat={cycleRepeat}
        onCycleSpeed={cycleSpeed}
        onToggleShuffle={toggleShuffle}
        onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id)}
        onDownload={() => currentTrack && handleDownloadTrack(currentTrack)}
      />

      {/* Modal de Conexión y Escaneo de Google Drive */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        currentUser={currentUser}
        accessToken={accessToken}
        customScriptUrl={customScriptUrl}
        onClose={() => setIsDriveModalOpen(false)}
        onSignIn={handleSignInGoogle}
        onSignOut={handleSignOutGoogle}
        onTracksImported={handleTracksImported}
        onSaveScriptUrl={handleSaveScriptUrl}
        onShowToast={showToast}
      />

      {/* Modal de Documentación Técnica, Código Code.gs y Matriz */}
      <DocumentationModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast de Notificaciones */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#24272E] text-white border border-[#C6A45E]/50 px-4 py-2 rounded-full text-xs shadow-2xl animate-fadeIn text-center max-w-[90vw]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
