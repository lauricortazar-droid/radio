import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCategory,
  cleanTrackTitle,
  extractChapterNumber,
  normalizeSearchString,
  filterTracks,
  formatTime,
  getNextTrackIndex,
  groupAudiobooks
} from './catalogLogic.ts';
import { AudioTrack } from '../types/index.ts';

test('normalizeCategory handles accents, casing and plural forms', () => {
  assert.equal(normalizeCategory('música'), 'Música');
  assert.equal(normalizeCategory('MUSICA'), 'Música');
  assert.equal(normalizeCategory('musica'), 'Música');
  assert.equal(normalizeCategory('Compartimientos'), 'Compartimientos');
  assert.equal(normalizeCategory('compartimiento'), 'Compartimientos');
  assert.equal(normalizeCategory('audiolibros'), 'Audiolibros');
  assert.equal(normalizeCategory('Alabanzas'), 'Alabanzas');
  assert.equal(normalizeCategory('Carpeta Desconocida'), null);
});

test('cleanTrackTitle strips numeric prefixes and audio extensions', () => {
  assert.equal(cleanTrackTitle('01 - Sigo Aquí.mp3'), 'Sigo Aquí');
  assert.equal(cleanTrackTitle('02_Soltar.m4a'), 'Soltar');
  assert.equal(cleanTrackTitle('Track 03 - Guerrero de la Luz.wav'), 'Guerrero de la Luz');
  assert.equal(cleanTrackTitle('Paz en la Tormenta.aac'), 'Paz en la Tormenta');
});

test('extractChapterNumber parses digits correctly', () => {
  assert.equal(extractChapterNumber('Capitulo 1 - El Despertar.mp3'), 1);
  assert.equal(extractChapterNumber('05 - La Batalla.mp3'), 5);
  assert.equal(extractChapterNumber('Parte 12.m4a'), 12);
  assert.equal(extractChapterNumber('Sin Numero.mp3'), null);
});

test('formatTime outputs MM:SS and HH:MM:SS accurately', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(45), '0:45');
  assert.equal(formatTime(125), '2:05');
  assert.equal(formatTime(3665), '1:01:05');
});

test('filterTracks performs accent and case insensitive search', () => {
  const sampleTracks: AudioTrack[] = [
    {
      id: '1',
      titulo: 'Canción del Alba',
      categoria: 'Música',
      genero: 'Reflexiva',
      url: 'https://example.com/1.mp3'
    },
    {
      id: '2',
      titulo: 'Soltar el Pasado',
      categoria: 'Música',
      genero: 'Acústica',
      url: 'https://example.com/2.mp3'
    },
    {
      id: '3',
      titulo: 'Testimonio de Fe',
      categoria: 'Compartimientos',
      url: 'https://example.com/3.mp3'
    }
  ];

  // Searching "cancion" without accent matches "Canción del Alba"
  const res1 = filterTracks(sampleTracks, 'Música', null, 'cancion');
  assert.equal(res1.length, 1);
  assert.equal(res1[0].titulo, 'Canción del Alba');

  // Filtering by category and genre
  const res2 = filterTracks(sampleTracks, 'Música', 'Acústica', '');
  assert.equal(res2.length, 1);
  assert.equal(res2[0].id, '2');

  // Cross category check
  const res3 = filterTracks(sampleTracks, 'Compartimientos', null, '');
  assert.equal(res3.length, 1);
  assert.equal(res3[0].id, '3');
});

test('getNextTrackIndex manages playback queue with repeat modes', () => {
  // Normal mode: 0 -> 1 -> 2 -> -1
  assert.equal(getNextTrackIndex(0, 3, 'off'), 1);
  assert.equal(getNextTrackIndex(1, 3, 'off'), 2);
  assert.equal(getNextTrackIndex(2, 3, 'off'), -1);

  // Repeat All: 2 -> 0
  assert.equal(getNextTrackIndex(2, 3, 'all'), 0);

  // Repeat One: stays on same index
  assert.equal(getNextTrackIndex(1, 3, 'one'), 1);
});

test('groupAudiobooks correctly groups chapters by book title', () => {
  const sampleTracks: AudioTrack[] = [
    {
      id: 'c2',
      titulo: 'Capítulo 2',
      categoria: 'Audiolibros',
      libro: 'Guerrero de la Luz',
      capitulo: 2,
      url: '...'
    },
    {
      id: 'c1',
      titulo: 'Capítulo 1',
      categoria: 'Audiolibros',
      libro: 'Guerrero de la Luz',
      capitulo: 1,
      url: '...'
    },
    {
      id: 'm1',
      titulo: 'Música 1',
      categoria: 'Música',
      url: '...'
    }
  ];

  const grouped = groupAudiobooks(sampleTracks);
  assert.ok(grouped['Guerrero de la Luz']);
  assert.equal(grouped['Guerrero de la Luz'].length, 2);
  // Verify sorted order
  assert.equal(grouped['Guerrero de la Luz'][0].capitulo, 1);
  assert.equal(grouped['Guerrero de la Luz'][1].capitulo, 2);
});
