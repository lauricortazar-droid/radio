/**
 * Generador de síntesis musical armónica espiritual (Web Audio API)
 * Proporciona audio meditativo real sin depender de CDNs externas caídas o cuotas de red.
 */

class SpiritualAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private loopInterval: any = null;
  private masterGain: GainNode | null = null;
  private currentTrackTitle = '';

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public start(trackTitle: string, rate: number = 1.0) {
    this.stop();
    this.currentTrackTitle = trackTitle;
    const ctx = this.getAudioContext();
    this.isPlaying = true;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Seleccionar tonalidad armónica según el título (Re menor, La menor, Do mayor pentatónico)
    const chords = this.getHarmonicProgression(trackTitle);
    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      // Tocar acordes suaves con osciladores senoidales y envolventes ADSR
      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * (rate || 1.0), ctx.currentTime);

        const now = ctx.currentTime;
        const dur = (3.5 / (rate || 1.0));
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.06 / (i + 1), now + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + dur);
      });
    };

    playNextChord();
    this.loopInterval = setInterval(playNextChord, Math.max(1500, 3200 / (rate || 1.0)));
  }

  public stop() {
    this.isPlaying = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      } catch (e) {
        // Ignorar
      }
    }
  }

  public setRate(rate: number) {
    if (this.isPlaying && this.currentTrackTitle) {
      this.start(this.currentTrackTitle, rate);
    }
  }

  private getHarmonicProgression(title: string): number[][] {
    // Frecuencias base meditativas (432Hz escala sagrada / notas armónicas)
    const A_Minor = [
      [220, 261.63, 329.63, 440], // La menor
      [174.61, 220, 261.63, 349.23], // Fa mayor
      [130.81, 164.81, 196, 261.63], // Do mayor
      [196, 246.94, 293.66, 392]  // Sol mayor
    ];

    const D_Minor = [
      [146.83, 174.61, 220, 293.66], // Re menor
      [116.54, 146.83, 174.61, 233.08], // Sib mayor
      [130.81, 164.81, 196, 261.63], // Do mayor
      [220, 261.63, 329.63, 440] // La menor
    ];

    if (title.toLowerCase().includes('soltar') || title.toLowerCase().includes('paz')) {
      return D_Minor;
    }
    return A_Minor;
  }
}

export const audioSynthesizer = new SpiritualAudioSynthesizer();
