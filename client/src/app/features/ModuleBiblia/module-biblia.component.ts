import { CommonModule } from "@angular/common";
import { Component, inject, signal, computed, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiBibliaService, BibleBook, BibleVerse } from "src/app/core/services/api-biblia.service";

@Component({
  selector: 'module-biblia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-biblia.component.html'
})
export class ModuleBibliaComponent implements OnInit {
  private api = inject(ApiBibliaService);

  // Books from API
  allBooks = signal<BibleBook[]>([]);
  booksLoading = signal(true);

  // Selection state
  selectedBookName = signal('Salmos');
  selectedBook = signal<BibleBook | null>(null);
  selectedChapter = signal<number>(1);
  selectedVersion = signal('');

  // Chapters range
  chapterCount = computed(() => this.selectedBook()?.chapters ?? 50);
  chapters = computed(() => Array.from({ length: this.chapterCount() }, (_, i) => i + 1));

  // Results
  verses = signal<BibleVerse[]>([]);
  rawResult = signal<any>(null);
  loading = signal(false);
  error = signal('');

  // UI mode
  mode: 'chapter' | 'range' | 'verse' = 'chapter';
  rangeInput = '';
  verseInput: number | null = null;

  // Filter for search
  bookSearch = '';
  get filteredBooks(): BibleBook[] {
    const q = this.bookSearch.toLowerCase();
    return this.allBooks().filter(b => b.name.toLowerCase().includes(q));
  }

  ngOnInit() {
    this.api.getAllBooks().subscribe({
      next: (books) => {
        this.allBooks.set(books);
        this.booksLoading.set(false);
        const salmos = books.find(b => b.name.toLowerCase() === 'salmos');
        if (salmos) {
          this.selectedBook.set(salmos);
          this.selectedBookName.set(salmos.name);
        }
      },
      error: () => {
        this.booksLoading.set(false);
        this.error.set('No se pudieron cargar los libros de la Biblia.');
      }
    });
  }

  onBookSelect(book: BibleBook) {
    this.selectedBook.set(book);
    this.selectedBookName.set(book.name);
    this.selectedChapter.set(1);
    this.verses.set([]);
    this.rawResult.set(null);
    this.error.set('');
    this.bookSearch = '';
  }

  load() {
    const book = this.selectedBook();
    if (!book) return;
    this.loading.set(true);
    this.error.set('');
    this.verses.set([]);
    this.rawResult.set(null);

    const bookKey = book.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    const version = this.selectedVersion() || undefined;

    let obs$;
    if (this.mode === 'verse' && this.verseInput) {
      obs$ = this.api.getVerse(bookKey, this.selectedChapter(), this.verseInput, version);
    } else if (this.mode === 'range' && this.rangeInput) {
      obs$ = this.api.getRange(bookKey, this.selectedChapter(), this.rangeInput, version);
    } else {
      obs$ = this.api.getChapter(bookKey, this.selectedChapter(), version);
    }

    obs$.subscribe({
      next: (data) => {
        if (data?.verses && Array.isArray(data.verses)) {
          this.verses.set(data.verses);
        } else {
          this.rawResult.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al cargar el pasaje.');
        this.loading.set(false);
      }
    });
  }
}
