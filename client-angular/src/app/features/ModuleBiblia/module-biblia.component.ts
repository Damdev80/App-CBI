import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiBibliaService, BibleBook, BibleVerse } from "src/app/core/services/api-biblia.service";

/** Lista estática según docs (name como en API) por si /api/books falla */
const BIBLE_BOOKS_FALLBACK: BibleBook[] = [
  { name: 'Genesis', abrev: 'GN', chapters: 50, testament: 'Antiguo Testamento' },
  { name: 'Exodo', abrev: 'EX', chapters: 40, testament: 'Antiguo Testamento' },
  { name: 'Levitico', abrev: 'LV', chapters: 27, testament: 'Antiguo Testamento' },
  { name: 'Numeros', abrev: 'NM', chapters: 36, testament: 'Antiguo Testamento' },
  { name: 'Deuteronomio', abrev: 'DT', chapters: 34, testament: 'Antiguo Testamento' },
  { name: 'Josue', abrev: 'JOS', chapters: 24, testament: 'Antiguo Testamento' },
  { name: 'Jueces', abrev: 'JUE', chapters: 21, testament: 'Antiguo Testamento' },
  { name: 'Rut', abrev: 'RT', chapters: 4, testament: 'Antiguo Testamento' },
  { name: '1-Samuel', abrev: '1S', chapters: 31, testament: 'Antiguo Testamento' },
  { name: '2-Samuel', abrev: '2S', chapters: 24, testament: 'Antiguo Testamento' },
  { name: '1-Reyes', abrev: '1R', chapters: 22, testament: 'Antiguo Testamento' },
  { name: '2-Reyes', abrev: '2R', chapters: 25, testament: 'Antiguo Testamento' },
  { name: '1-Cronicas', abrev: '1CR', chapters: 29, testament: 'Antiguo Testamento' },
  { name: '2-Cronicas', abrev: '2CR', chapters: 36, testament: 'Antiguo Testamento' },
  { name: 'Esdras', abrev: 'ESD', chapters: 10, testament: 'Antiguo Testamento' },
  { name: 'Nehemias', abrev: 'NEH', chapters: 13, testament: 'Antiguo Testamento' },
  { name: 'Ester', abrev: 'EST', chapters: 10, testament: 'Antiguo Testamento' },
  { name: 'Job', abrev: 'JOB', chapters: 42, testament: 'Antiguo Testamento' },
  { name: 'Salmos', abrev: 'SAL', chapters: 150, testament: 'Antiguo Testamento' },
  { name: 'Proverbios', abrev: 'PR', chapters: 31, testament: 'Antiguo Testamento' },
  { name: 'Eclesiastes', abrev: 'EC', chapters: 12, testament: 'Antiguo Testamento' },
  { name: 'Cantares', abrev: 'CNT', chapters: 8, testament: 'Antiguo Testamento' },
  { name: 'Isaias', abrev: 'IS', chapters: 66, testament: 'Antiguo Testamento' },
  { name: 'Jeremias', abrev: 'JER', chapters: 52, testament: 'Antiguo Testamento' },
  { name: 'Lamentaciones', abrev: 'LM', chapters: 5, testament: 'Antiguo Testamento' },
  { name: 'Ezequiel', abrev: 'EZ', chapters: 48, testament: 'Antiguo Testamento' },
  { name: 'Daniel', abrev: 'DN', chapters: 12, testament: 'Antiguo Testamento' },
  { name: 'Oseas', abrev: 'OS', chapters: 14, testament: 'Antiguo Testamento' },
  { name: 'Joel', abrev: 'JL', chapters: 3, testament: 'Antiguo Testamento' },
  { name: 'Amos', abrev: 'AM', chapters: 9, testament: 'Antiguo Testamento' },
  { name: 'Abdias', abrev: 'ABD', chapters: 1, testament: 'Antiguo Testamento' },
  { name: 'Jonas', abrev: 'JON', chapters: 4, testament: 'Antiguo Testamento' },
  { name: 'Miqueas', abrev: 'MI', chapters: 7, testament: 'Antiguo Testamento' },
  { name: 'Nahum', abrev: 'NAH', chapters: 3, testament: 'Antiguo Testamento' },
  { name: 'Habacuc', abrev: 'HAB', chapters: 3, testament: 'Antiguo Testamento' },
  { name: 'Sofonias', abrev: 'SOF', chapters: 3, testament: 'Antiguo Testamento' },
  { name: 'Hageo', abrev: 'HAG', chapters: 2, testament: 'Antiguo Testamento' },
  { name: 'Zacarias', abrev: 'ZAC', chapters: 14, testament: 'Antiguo Testamento' },
  { name: 'Malaquias', abrev: 'MAL', chapters: 4, testament: 'Antiguo Testamento' },
  { name: 'Mateo', abrev: 'MT', chapters: 28, testament: 'Nuevo Testamento' },
  { name: 'Marcos', abrev: 'MR', chapters: 16, testament: 'Nuevo Testamento' },
  { name: 'Lucas', abrev: 'LC', chapters: 24, testament: 'Nuevo Testamento' },
  { name: 'Juan', abrev: 'JN', chapters: 21, testament: 'Nuevo Testamento' },
  { name: 'Hechos', abrev: 'HCH', chapters: 28, testament: 'Nuevo Testamento' },
  { name: 'Romanos', abrev: 'RO', chapters: 16, testament: 'Nuevo Testamento' },
  { name: '1-Corintios', abrev: '1CO', chapters: 16, testament: 'Nuevo Testamento' },
  { name: '2-Corintios', abrev: '2CO', chapters: 13, testament: 'Nuevo Testamento' },
  { name: 'Galatas', abrev: 'GA', chapters: 6, testament: 'Nuevo Testamento' },
  { name: 'Efesios', abrev: 'EF', chapters: 6, testament: 'Nuevo Testamento' },
  { name: 'Filipenses', abrev: 'FIL', chapters: 4, testament: 'Nuevo Testamento' },
  { name: 'Colosenses', abrev: 'COL', chapters: 4, testament: 'Nuevo Testamento' },
  { name: '1-Tesalonicenses', abrev: '1TS', chapters: 5, testament: 'Nuevo Testamento' },
  { name: '2-Tesalonicenses', abrev: '2TS', chapters: 3, testament: 'Nuevo Testamento' },
  { name: '1-Timoteo', abrev: '1TI', chapters: 6, testament: 'Nuevo Testamento' },
  { name: '2-Timoteo', abrev: '2TI', chapters: 4, testament: 'Nuevo Testamento' },
  { name: 'Tito', abrev: 'TIT', chapters: 3, testament: 'Nuevo Testamento' },
  { name: 'Filemon', abrev: 'FLM', chapters: 1, testament: 'Nuevo Testamento' },
  { name: 'Hebreos', abrev: 'HE', chapters: 13, testament: 'Nuevo Testamento' },
  { name: 'Santiago', abrev: 'STG', chapters: 5, testament: 'Nuevo Testamento' },
  { name: '1-Pedro', abrev: '1P', chapters: 5, testament: 'Nuevo Testamento' },
  { name: '2-Pedro', abrev: '2P', chapters: 3, testament: 'Nuevo Testamento' },
  { name: '1-Juan', abrev: '1JN', chapters: 5, testament: 'Nuevo Testamento' },
  { name: '2-Juan', abrev: '2JN', chapters: 1, testament: 'Nuevo Testamento' },
  { name: '3-Juan', abrev: '3JN', chapters: 1, testament: 'Nuevo Testamento' },
  { name: 'Judas', abrev: 'JUD', chapters: 1, testament: 'Nuevo Testamento' },
  { name: 'Apocalipsis', abrev: 'AP', chapters: 22, testament: 'Nuevo Testamento' },
];

@Component({
  selector: 'module-biblia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-biblia.component.html'
})
export class ModuleBibliaComponent implements OnInit {
  private api        = inject(ApiBibliaService);
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // ── Book list ──
  allBooks     = signal<BibleBook[]>([]);
  booksLoading = signal(true);

  // ── Selection ──
  selectedBook: BibleBook | null = null;
  // Use string for ngModel compatibility with <select>, coerce to number on use
  selectedChapter: any = 1;
  /** Versión obligatoria en la API (rv1960, nvi, etc.) */
  selectedVersion = 'rv1960';

  // ── Search / dropdown ──
  bookSearch   = '';
  showBookList = false;

  get filteredBooks(): BibleBook[] {
    const q = this.bookSearch.toLowerCase();
    const all = this.allBooks();
    if (!q) return all;
    return all.filter(b => (b.name ?? '').toLowerCase().includes(q));
  }

  get chapters(): number[] {
    return Array.from({ length: this.selectedBook?.chapters ?? 150 }, (_, i) => i + 1);
  }

  // ── Results ──
  verses    = signal<BibleVerse[]>([]);
  rawResult = signal<any>(null);
  loading   = signal(false);
  error     = signal('');

  /** Panel de palabras repetidas (solo palabras que aparecen 2+ veces) */
  showRepeatedWords = signal(false);
  repeatedWordsList = computed(() => this.buildRepeatedWords(this.verses()));

  // ── Mode ──
  mode: 'chapter' | 'range' | 'verse' = 'chapter';
  rangeInput  = '';
  verseInput: any = '';

  ngOnInit() {
    // Siempre cargar lista estática primero: así hay libros y selección por defecto aunque falle la API o sea SSR
    this.allBooks.set(BIBLE_BOOKS_FALLBACK);
    const defaultBook = BIBLE_BOOKS_FALLBACK.find(b => b.name === 'Salmos') ?? BIBLE_BOOKS_FALLBACK[0];
    this.selectedBook = defaultBook;
    this.selectedChapter = 1;
    this.booksLoading.set(false);

    // En el navegador, opcionalmente intentar reemplazar con /api/books
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<any>('https://bible-api.deno.dev/api/books').subscribe({
      next: (resp) => {
        const raw: any[] = Array.isArray(resp)
          ? resp
          : (resp?.books ?? resp?.data ?? Object.values(resp ?? {}));
        const books: BibleBook[] = raw
          .filter(b => b && typeof b === 'object' && (b.name || b.Name))
          .map(b => ({
            name:      String(b.name ?? b.Name ?? ''),
            abrev:     String(b.abrev ?? b.abbreviation ?? b.abr ?? ''),
            chapters:  Number(b.chapters ?? b.chapter_count ?? 150) || 150,
            testament: String(b.testament ?? b.Testament ?? ''),
          }));
        if (books.length > 0) {
          this.allBooks.set(books);
          const currentAbrev = this.selectedBook?.abrev;
          const same = books.find(b => b.abrev === currentAbrev || b.name === this.selectedBook?.name);
          this.selectedBook = same ?? books.find(b => b.name.toLowerCase().includes('salm')) ?? books[0];
        }
      },
      error: () => { /* mantener lista estática ya cargada */ }
    });
  }

  selectBook(book: BibleBook) {
    this.selectedBook    = book;
    this.selectedChapter = 1;
    this.showBookList    = false;
    this.bookSearch      = '';
    this.verses.set([]);
    this.rawResult.set(null);
    this.error.set('');
  }

  /** Normaliza el nombre del libro para la API: minúsculas, sin tildes, espacios → guión (ej. Genesis → genesis, 1-Samuel → 1-samuel) */
  private toApiKey(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  load() {
    const book = this.selectedBook;
    if (!book?.name) {
      this.error.set('Selecciona un libro antes de cargar.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.verses.set([]);
    this.rawResult.set(null);

    const key     = this.toApiKey(book.name);
    const chapter = Number(this.selectedChapter) || 1;
    const ver     = (this.selectedVersion || this.api.defaultVersion).trim();

    let obs$;
    const verse = Number(this.verseInput);
    if (this.mode === 'verse' && verse > 0) {
      obs$ = this.api.getVerse(key, chapter, verse, ver);
    } else if (this.mode === 'range' && this.rangeInput.trim()) {
      obs$ = this.api.getRange(key, chapter, this.rangeInput.trim(), ver);
    } else {
      obs$ = this.api.getChapter(key, chapter, ver);
    }

    obs$.subscribe({
      next: (data: any) => {
        // API devuelve "vers" (doc) o a veces "verses"
        const rawList = data?.vers ?? data?.verses ?? [];
        const verseList: BibleVerse[] = Array.isArray(rawList)
          ? rawList.map((v: any) => ({
              number: v.number ?? v.verse_number ?? 0,
              verse:  v.verse ?? v.text ?? '',
            }))
          : [];

        if (verseList.length) {
          this.verses.set(verseList);
        } else {
          this.rawResult.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? '';
        this.error.set(
          msg || `No se encontró "${book.name}" capítulo ${chapter}. Prueba sin versión o con otra versión.`
        );
        this.loading.set(false);
      }
    });
  }

  get testament(): string {
    const t = (this.selectedBook?.testament ?? '').toLowerCase();
    if (t.includes('antiguo') || t.includes('old')) return 'AT';
    if (t.includes('nuevo') || t.includes('new'))   return 'NT';
    return '';
  }

  /** Construye lista de palabras repetidas (2+ veces) ordenada por frecuencia */
  buildRepeatedWords(verses: BibleVerse[]): { word: string; count: number }[] {
    if (!verses?.length) return [];
    const map = new Map<string, number>();
    const stop = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'a', 'en', 'y', 'que', 'es', 'por', 'con', 'para', 'su', 'se', 'lo', 'como', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'sin', 'sobre', 'ser', 'tiene', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'desde', 'todo', 'nos', 'durante', 'estos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otra', 'otras', 'él', 'ella', 'te', 'ti', 'qué']);
    for (const v of verses) {
      const text = (v.verse ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const words = text.toLowerCase().match(/\b[a-záéíóúñü]+\b/g) ?? [];
      for (const w of words) {
        if (w.length < 2 || stop.has(w)) continue;
        map.set(w, (map.get(w) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .filter(([, count]) => count >= 2)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
  }

  toggleRepeatedWords() {
    this.showRepeatedWords.update(v => !v);
  }

  /** Divide el texto del versículo en segmentos para resaltar las palabras repetidas */
  getVerseSegments(verseText: string): { text: string; highlight: boolean }[] {
    if (!verseText || !this.showRepeatedWords()) {
      return [{ text: verseText || '', highlight: false }];
    }
    const repeatedSet = new Set(this.repeatedWordsList().map(x => x.word));
    const segments: { text: string; highlight: boolean }[] = [];
    const regex = /\b[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]+\b/g;
    let lastEnd = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(verseText)) !== null) {
      if (m.index > lastEnd) {
        segments.push({ text: verseText.slice(lastEnd, m.index), highlight: false });
      }
      const normalized = m[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      segments.push({ text: m[0], highlight: repeatedSet.has(normalized) });
      lastEnd = regex.lastIndex;
    }
    if (lastEnd < verseText.length) {
      segments.push({ text: verseText.slice(lastEnd), highlight: false });
    }
    return segments.length ? segments : [{ text: verseText, highlight: false }];
  }
}
