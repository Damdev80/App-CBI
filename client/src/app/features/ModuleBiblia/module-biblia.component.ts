import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, inject, signal, OnInit, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiBibliaService, BibleBook, BibleVerse } from "src/app/core/services/api-biblia.service";

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
  selectedVersion = '';

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

  // ── Mode ──
  mode: 'chapter' | 'range' | 'verse' = 'chapter';
  rangeInput  = '';
  verseInput: any = '';

  ngOnInit() {
    // Only fetch in the browser — avoid SSR network calls to external APIs
    if (!isPlatformBrowser(this.platformId)) {
      this.booksLoading.set(false);
      return;
    }

    this.http.get<any>('https://bible-api.deno.dev/api/books').subscribe({
      next: (resp) => {
        // API can return an array directly or { books: [...] }
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

        this.allBooks.set(books);
        this.booksLoading.set(false);

        // Default: Salmos
        const def = books.find(b => b.name.toLowerCase().includes('salm'))
                 ?? books.find(b => b.name.toLowerCase().includes('psalm'))
                 ?? books[0];
        if (def) {
          this.selectedBook    = def;
          this.selectedChapter = 1;
        }
      },
      error: (e) => {
        console.error('Bible API books error:', e);
        this.booksLoading.set(false);
        this.error.set('No se pudieron cargar los libros. Verifica tu conexión.');
      }
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

  /** Normaliza el nombre del libro para el path de la API */
  private toApiKey(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9\s-]/g, '')                     // solo alfanumérico
      .replace(/\s+/g, '-');                             // espacios → guión
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
    const ver     = this.selectedVersion.trim() || undefined;

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
        // Normalize response: verses may be at root or nested
        const verseList: BibleVerse[] = Array.isArray(data?.verses)
          ? data.verses.map((v: any) => ({ number: v.number ?? v.verse_number, verse: v.verse ?? v.text ?? '' }))
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
}
