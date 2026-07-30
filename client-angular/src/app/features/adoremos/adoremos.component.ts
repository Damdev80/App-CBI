import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chord } from '@tonaljs/tonal';

type SongArrangementLine = {
  chords: string;
  lyrics: string;
};

type WorshipSong = {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  timeSignature: string;
  durationMin: number;
  tags: string[];
  progression: string[];
  arrangement: SongArrangementLine[];
};

@Component({
  selector: 'app-adoremos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adoremos.component.html',
})
export class AdoremosComponent {
  readonly songsCatalog: WorshipSong[] = [
    {
      id: 'fuego-vivo',
      title: 'Fuego Vivo',
      artist: 'CBI Adoremos',
      key: 'G',
      bpm: 72,
      timeSignature: '4/4',
      durationMin: 6,
      tags: ['Adoracion', 'Oracion'],
      progression: ['G  D/F#  Em7  C', 'G  D  C  D'],
      arrangement: [
        { chords: 'G            D/F#        Em7         C', lyrics: 'Cristo, tu presencia llena hoy este lugar' },
        { chords: 'G            D           C           D', lyrics: 'Aviva en nosotros el fuego de tu altar' },
        { chords: 'Em7          C            G           D', lyrics: 'Santo, eterno, digno de exaltar' },
      ],
    },
    {
      id: 'trono-gracia',
      title: 'Trono de Gracia',
      artist: 'CBI Adoremos',
      key: 'D',
      bpm: 78,
      timeSignature: '6/8',
      durationMin: 5,
      tags: ['Congregacional', 'Fe'],
      progression: ['D  A/C#  Bm7  G', 'D  A  G  A'],
      arrangement: [
        { chords: 'D             A/C#        Bm7         G', lyrics: 'Nos acercamos hoy al trono de tu gracia' },
        { chords: 'D             A           G           A', lyrics: 'Confiados en tu amor, firmes en tu verdad' },
        { chords: 'Bm7           G           D           A', lyrics: 'Tu palabra sostiene nuestra fe' },
      ],
    },
    {
      id: 'rio-paz',
      title: 'Rio de Paz',
      artist: 'CBI Adoremos',
      key: 'A',
      bpm: 84,
      timeSignature: '4/4',
      durationMin: 4,
      tags: ['Juvenil', 'Gozo'],
      progression: ['A  E/G#  F#m7  D', 'A  E  D  E'],
      arrangement: [
        { chords: 'A             E/G#       F#m7        D', lyrics: 'Tu paz desciende como rio en mi interior' },
        { chords: 'A             E           D           E', lyrics: 'Tu gracia vence toda sombra y temor' },
        { chords: 'F#m7          D           A           E', lyrics: 'Hoy cantamos, Jesus, tu salvacion' },
      ],
    },
    {
      id: 'altar-fiel',
      title: 'Altar Fiel',
      artist: 'CBI Adoremos',
      key: 'Em',
      bpm: 68,
      timeSignature: '4/4',
      durationMin: 7,
      tags: ['Intimo', 'Entrega'],
      progression: ['Em  C  G  D', 'Em  C  G  D/F#'],
      arrangement: [
        { chords: 'Em            C           G           D', lyrics: 'Rendimos nuestra vida en tu altar fiel' },
        { chords: 'Em            C           G           D/F#', lyrics: 'Nada se compara a tu amor, Emanuel' },
        { chords: 'C             G           D           Em', lyrics: 'Reina en nosotros, Espiritu de Dios' },
      ],
    },
    {
      id: 'canto-nuevo',
      title: 'Canto Nuevo',
      artist: 'CBI Adoremos',
      key: 'C',
      bpm: 92,
      timeSignature: '4/4',
      durationMin: 5,
      tags: ['Celebracion', 'Apertura'],
      progression: ['C  G/B  Am7  F', 'C  G  F  G'],
      arrangement: [
        { chords: 'C             G/B         Am7         F', lyrics: 'Levantamos hoy un canto nuevo para ti' },
        { chords: 'C             G           F           G', lyrics: 'Declaramos que eres rey por la eternidad' },
        { chords: 'Am7           F           C           G', lyrics: 'Tu victoria nos da libertad' },
      ],
    },
  ];

  searchQuery = signal<string>('');
  keyFilter = signal<string>('ALL');
  selectedSongId = signal<string>(this.songsCatalog[0]?.id ?? '');
  transposeSemitones = signal<number>(0);
  setlistSongIds = signal<string[]>([]);

  readonly availableKeys = computed(() => {
    const keys = Array.from(new Set(this.songsCatalog.map((song) => song.key)));
    return ['ALL', ...keys.sort((a, b) => a.localeCompare(b))];
  });

  readonly filteredSongs = computed(() => {
    const query = this.normalizeText(this.searchQuery());
    const key = this.keyFilter();

    return this.songsCatalog.filter((song) => {
      if (key !== 'ALL' && song.key !== key) return false;
      if (!query) return true;

      return (
        this.normalizeText(song.title).includes(query) ||
        this.normalizeText(song.artist).includes(query) ||
        this.normalizeText(song.tags.join(' ')).includes(query) ||
        this.normalizeText(song.key).includes(query)
      );
    });
  });

  readonly selectedSong = computed(() => {
    const selected = this.songById(this.selectedSongId());
    if (selected) return selected;

    const firstFiltered = this.filteredSongs()[0];
    if (firstFiltered) return firstFiltered;

    return this.songsCatalog[0] ?? null;
  });

  readonly transposedSongKey = computed(() => {
    const song = this.selectedSong();
    if (!song) return '';
    return this.transposeKey(song.key, this.transposeSemitones());
  });

  readonly transposedProgression = computed(() => {
    const song = this.selectedSong();
    if (!song) return [];

    const semitones = this.transposeSemitones();
    return song.progression.map((line) => this.transposeProgressionLine(line, semitones));
  });

  readonly transposedArrangement = computed(() => {
    const song = this.selectedSong();
    if (!song) return [];

    const semitones = this.transposeSemitones();
    return song.arrangement.map((line) => ({
      chords: this.transposeProgressionLine(line.chords, semitones),
      lyrics: line.lyrics,
    }));
  });

  readonly chordInsights = computed(() => {
    const chords = this.collectChordTokens(this.transposedProgression());

    return chords.map((chord) => {
      const baseChord = chord.split('/')[0];
      const notes = Chord.get(baseChord).notes;

      return {
        chord,
        notes: notes.length > 0 ? notes.join(' - ') : 'N/D',
      };
    });
  });

  readonly setlistSongs = computed(() => {
    return this.setlistSongIds()
      .map((songId) => this.songById(songId))
      .filter((song): song is WorshipSong => song !== null);
  });

  readonly totalSetlistMinutes = computed(() => {
    return this.setlistSongs().reduce((total, song) => total + song.durationMin, 0);
  });

  selectSong(songId: string): void {
    this.selectedSongId.set(songId);
  }

  addSongToSetlist(songId: string): void {
    this.setlistSongIds.update((current) => [...current, songId]);
  }

  removeSetlistSong(index: number): void {
    this.setlistSongIds.update((current) => current.filter((_, i) => i !== index));
  }

  moveSetlistSong(index: number, direction: -1 | 1): void {
    this.setlistSongIds.update((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      const [songId] = next.splice(index, 1);
      next.splice(target, 0, songId);
      return next;
    });
  }

  clearSetlist(): void {
    this.setlistSongIds.set([]);
  }

  transposeStep(delta: -1 | 1): void {
    this.transposeSemitones.update((value) => {
      const next = value + delta;
      return Math.max(-6, Math.min(6, next));
    });
  }

  resetTranspose(): void {
    this.transposeSemitones.set(0);
  }

  formatDuration(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} min`;
    return `${hrs} h ${mins} min`;
  }

  getTransposeLabel(): string {
    const value = this.transposeSemitones();
    if (value === 0) return 'Original';
    return value > 0 ? `+${value}` : `${value}`;
  }

  private songById(songId: string): WorshipSong | null {
    return this.songsCatalog.find((song) => song.id === songId) ?? null;
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private transposeKey(key: string, semitones: number): string {
    const match = key.match(/^([A-G](?:#|b)?)(m?)$/);
    if (!match) return key;

    const root = this.transposeNote(match[1], semitones);
    return `${root}${match[2]}`;
  }

  private transposeProgressionLine(line: string, semitones: number): string {
    if (semitones === 0) return line;

    return line
      .split(/(\s+)/)
      .map((token) => this.transposeChordToken(token, semitones))
      .join('');
  }

  private transposeChordToken(token: string, semitones: number): string {
    const trimmed = token.trim();
    if (!trimmed) return token;

    const match = trimmed.match(/^([A-G](?:#|b)?)([^\s/]*)(?:\/([A-G](?:#|b)?))?$/);
    if (!match) return token;

    const root = this.transposeNote(match[1], semitones);
    const suffix = match[2] || '';
    const bass = match[3] ? this.transposeNote(match[3], semitones) : '';

    const transposed = bass ? `${root}${suffix}/${bass}` : `${root}${suffix}`;
    return token.replace(trimmed, transposed);
  }

  private transposeNote(note: string, semitones: number): string {
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const enharmonics: Record<string, string> = {
      'Cb': 'B',
      'Db': 'C#',
      'Eb': 'D#',
      'Fb': 'E',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#',
      'E#': 'F',
      'B#': 'C',
    };

    const normalized = enharmonics[note] || note;
    const index = chromaticScale.indexOf(normalized);
    if (index === -1) return note;

    const total = chromaticScale.length;
    const nextIndex = ((index + semitones) % total + total) % total;
    return chromaticScale[nextIndex];
  }

  private collectChordTokens(lines: string[]): string[] {
    const regex = /([A-G](?:#|b)?(?:maj7|maj9|m7|m9|m|sus2|sus4|add9|dim|aug|7|6|9|11|13)?(?:\/[A-G](?:#|b)?)?)/g;
    const unique = new Set<string>();

    for (const line of lines) {
      const matches = line.match(regex);
      if (!matches) continue;
      matches.forEach((chord) => unique.add(chord));
    }

    return Array.from(unique);
  }
}
