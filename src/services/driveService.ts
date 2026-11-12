import { AudioTrack, CategoryType } from '../types/index.ts';
import { normalizeCategory, cleanTrackTitle, extractChapterNumber } from '../utils/catalogLogic.ts';

export interface DriveFolderInfo {
  id: string;
  name: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
  modifiedTime?: string;
}

/**
 * Busca carpetas en Google Drive por nombre
 */
export async function searchDriveFolders(token: string, folderName?: string): Promise<DriveFolderInfo[]> {
  const queryParts = ["mimeType = 'application/vnd.google-apps.folder'", "trashed = false"];
  if (folderName) {
    queryParts.push(`name contains '${folderName.replace(/'/g, "\\'")}'`);
  }
  const q = encodeURIComponent(queryParts.join(' and '));
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=30`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar carpetas de Google Drive.`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Escanea recursivamente la estructura de Radio Guerreros desde el Drive del usuario
 */
export async function scanDriveAudioLibrary(token: string, rootFolderId: string): Promise<AudioTrack[]> {
  // 1. Obtener subcarpetas directas de la raíz
  const subFoldersQuery = encodeURIComponent(`'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const subRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${subFoldersQuery}&fields=files(id,name)&pageSize=50`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!subRes.ok) {
    throw new Error(`Error ${subRes.status} al leer la carpeta seleccionada en Drive.`);
  }

  const subFoldersData = await subRes.json();
  const subFolders: DriveFolderInfo[] = subFoldersData.files || [];

  const foundTracks: AudioTrack[] = [];

  // Si la carpeta raíz contiene subcarpetas de categorías
  for (const folder of subFolders) {
    const category = normalizeCategory(folder.name);
    if (!category) continue;

    if (category === 'Música') {
      await scanMusicCategory(token, folder.id, foundTracks);
    } else if (category === 'Audiolibros') {
      await scanAudiobooksCategory(token, folder.id, foundTracks);
    } else {
      await scanFlatCategory(token, folder.id, category, foundTracks);
    }
  }

  // Si no se encontraron subcarpetas normalizadas, escanear todos los audios directos de esta carpeta
  if (foundTracks.length === 0) {
    const directAudioQuery = encodeURIComponent(`'${rootFolderId}' in parents and mimeType contains 'audio/' and trashed = false`);
    const directRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${directAudioQuery}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (directRes.ok) {
      const directData = await directRes.json();
      const directFiles: DriveFileInfo[] = directData.files || [];
      for (const file of directFiles) {
        foundTracks.push(createTrackFromDriveFile(file, 'Música', 'General', null, null));
      }
    }
  }

  return foundTracks;
}

async function scanMusicCategory(token: string, musicFolderId: string, list: AudioTrack[]) {
  // Archivos sueltos en Música
  await fetchAudioFilesInFolder(token, musicFolderId, (file) => {
    list.push(createTrackFromDriveFile(file, 'Música', 'General', null, null));
  });

  // Subcarpetas como géneros
  const genres = await getSubfolders(token, musicFolderId);
  for (const genre of genres) {
    await fetchAudioFilesInFolder(token, genre.id, (file) => {
      list.push(createTrackFromDriveFile(file, 'Música', genre.name, null, null));
    });
  }
}

async function scanAudiobooksCategory(token: string, audiobooksFolderId: string, list: AudioTrack[]) {
  const books = await getSubfolders(token, audiobooksFolderId);
  for (const book of books) {
    await fetchAudioFilesInFolder(token, book.id, (file) => {
      const chapter = extractChapterNumber(file.name);
      list.push(createTrackFromDriveFile(file, 'Audiolibros', null, book.name, chapter));
    });
  }
}

async function scanFlatCategory(token: string, folderId: string, category: CategoryType, list: AudioTrack[]) {
  await fetchAudioFilesInFolder(token, folderId, (file) => {
    list.push(createTrackFromDriveFile(file, category, null, null, null));
  });

  const subs = await getSubfolders(token, folderId);
  for (const sub of subs) {
    await fetchAudioFilesInFolder(token, sub.id, (file) => {
      list.push(createTrackFromDriveFile(file, category, sub.name, null, null));
    });
  }
}

async function getSubfolders(token: string, parentId: string): Promise<DriveFolderInfo[]> {
  const q = encodeURIComponent(`'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=50`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.files || [];
}

async function fetchAudioFilesInFolder(token: string, parentId: string, onFile: (file: DriveFileInfo) => void) {
  const q = encodeURIComponent(`'${parentId}' in parents and trashed = false and (mimeType contains 'audio/' or name contains '.mp3' or name contains '.m4a' or name contains '.wav')`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return;
  const data = await res.json();
  const files: DriveFileInfo[] = data.files || [];
  files.forEach(onFile);
}

function createTrackFromDriveFile(
  file: DriveFileInfo,
  categoria: CategoryType,
  genero: string | null,
  libro: string | null,
  capitulo: number | null
): AudioTrack {
  const cleanTitle = cleanTrackTitle(file.name);
  const directPlaybackUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;
  const alternateDownloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
  const webViewUrl = `https://drive.google.com/file/d/${file.id}/view`;

  return {
    id: `drive_${file.id}`,
    titulo: cleanTitle,
    nombreArchivo: file.name,
    categoria,
    genero,
    libro,
    capitulo,
    tamanoBytes: file.size ? parseInt(file.size, 10) : undefined,
    mimeType: file.mimeType || 'audio/mpeg',
    actualizado: file.modifiedTime,
    url: directPlaybackUrl,
    urlDescarga: alternateDownloadUrl,
    urlVista: webViewUrl,
    isDriveFile: true,
    driveId: file.id
  };
}

/**
 * Descarga el contenido binario autenticado de Google Drive y produce un Blob URL local
 * permitiendo streaming fluido en navegadores incluso para archivos no públicos
 */
export async function fetchAuthenticatedAudioBlobUrl(token: string, driveFileId: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`No se pudo obtener el audio autenticado (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
