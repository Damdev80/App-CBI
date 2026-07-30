'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollReveal } from '@/components/animated/scroll-reveal';

interface BibleBook {
  name: string;
  abrev: string;
  chapters: number;
  testament: string;
}

interface BibleVerse {
  number: number;
  verse: string;
}

const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Genesis', abrev: 'GN', chapters: 50, testament: 'AT' },
  { name: 'Exodo', abrev: 'EX', chapters: 40, testament: 'AT' },
  { name: 'Levitico', abrev: 'LV', chapters: 27, testament: 'AT' },
  { name: 'Numeros', abrev: 'NM', chapters: 36, testament: 'AT' },
  { name: 'Deuteronomio', abrev: 'DT', chapters: 34, testament: 'AT' },
  { name: 'Josue', abrev: 'JOS', chapters: 24, testament: 'AT' },
  { name: 'Jueces', abrev: 'JUE', chapters: 21, testament: 'AT' },
  { name: 'Rut', abrev: 'RT', chapters: 4, testament: 'AT' },
  { name: '1-Samuel', abrev: '1S', chapters: 31, testament: 'AT' },
  { name: '2-Samuel', abrev: '2S', chapters: 24, testament: 'AT' },
  { name: '1-Reyes', abrev: '1R', chapters: 22, testament: 'AT' },
  { name: '2-Reyes', abrev: '2R', chapters: 25, testament: 'AT' },
  { name: '1-Cronicas', abrev: '1CR', chapters: 29, testament: 'AT' },
  { name: '2-Cronicas', abrev: '2CR', chapters: 36, testament: 'AT' },
  { name: 'Esdras', abrev: 'ESD', chapters: 10, testament: 'AT' },
  { name: 'Nehemias', abrev: 'NEH', chapters: 13, testament: 'AT' },
  { name: 'Ester', abrev: 'EST', chapters: 10, testament: 'AT' },
  { name: 'Job', abrev: 'JOB', chapters: 42, testament: 'AT' },
  { name: 'Salmos', abrev: 'SAL', chapters: 150, testament: 'AT' },
  { name: 'Proverbios', abrev: 'PR', chapters: 31, testament: 'AT' },
  { name: 'Eclesiastes', abrev: 'EC', chapters: 12, testament: 'AT' },
  { name: 'Cantares', abrev: 'CNT', chapters: 8, testament: 'AT' },
  { name: 'Isaias', abrev: 'IS', chapters: 66, testament: 'AT' },
  { name: 'Jeremias', abrev: 'JER', chapters: 52, testament: 'AT' },
  { name: 'Lamentaciones', abrev: 'LM', chapters: 5, testament: 'AT' },
  { name: 'Ezequiel', abrev: 'EZ', chapters: 48, testament: 'AT' },
  { name: 'Daniel', abrev: 'DN', chapters: 12, testament: 'AT' },
  { name: 'Oseas', abrev: 'OS', chapters: 14, testament: 'AT' },
  { name: 'Joel', abrev: 'JL', chapters: 3, testament: 'AT' },
  { name: 'Amos', abrev: 'AM', chapters: 9, testament: 'AT' },
  { name: 'Abdias', abrev: 'ABD', chapters: 1, testament: 'AT' },
  { name: 'Jonas', abrev: 'JON', chapters: 4, testament: 'AT' },
  { name: 'Miqueas', abrev: 'MI', chapters: 7, testament: 'AT' },
  { name: 'Nahum', abrev: 'NAH', chapters: 3, testament: 'AT' },
  { name: 'Habacuc', abrev: 'HAB', chapters: 3, testament: 'AT' },
  { name: 'Sofonias', abrev: 'SOF', chapters: 3, testament: 'AT' },
  { name: 'Hageo', abrev: 'HAG', chapters: 2, testament: 'AT' },
  { name: 'Zacarias', abrev: 'ZAC', chapters: 14, testament: 'AT' },
  { name: 'Malaquias', abrev: 'MAL', chapters: 4, testament: 'AT' },
  { name: 'Mateo', abrev: 'MT', chapters: 28, testament: 'NT' },
  { name: 'Marcos', abrev: 'MR', chapters: 16, testament: 'NT' },
  { name: 'Lucas', abrev: 'LC', chapters: 24, testament: 'NT' },
  { name: 'Juan', abrev: 'JN', chapters: 21, testament: 'NT' },
  { name: 'Hechos', abrev: 'HCH', chapters: 28, testament: 'NT' },
  { name: 'Romanos', abrev: 'RO', chapters: 16, testament: 'NT' },
  { name: '1-Corintios', abrev: '1CO', chapters: 16, testament: 'NT' },
  { name: '2-Corintios', abrev: '2CO', chapters: 13, testament: 'NT' },
  { name: 'Galatas', abrev: 'GA', chapters: 6, testament: 'NT' },
  { name: 'Efesios', abrev: 'EF', chapters: 6, testament: 'NT' },
  { name: 'Filipenses', abrev: 'FIL', chapters: 4, testament: 'NT' },
  { name: 'Colosenses', abrev: 'COL', chapters: 4, testament: 'NT' },
  { name: '1-Tesalonicenses', abrev: '1TS', chapters: 5, testament: 'NT' },
  { name: '2-Tesalonicenses', abrev: '2TS', chapters: 3, testament: 'NT' },
  { name: '1-Timoteo', abrev: '1TI', chapters: 6, testament: 'NT' },
  { name: '2-Timoteo', abrev: '2TI', chapters: 4, testament: 'NT' },
  { name: 'Tito', abrev: 'TIT', chapters: 3, testament: 'NT' },
  { name: 'Filemon', abrev: 'FLM', chapters: 1, testament: 'NT' },
  { name: 'Hebreos', abrev: 'HE', chapters: 13, testament: 'NT' },
  { name: 'Santiago', abrev: 'STG', chapters: 5, testament: 'NT' },
  { name: '1-Pedro', abrev: '1P', chapters: 5, testament: 'NT' },
  { name: '2-Pedro', abrev: '2P', chapters: 3, testament: 'NT' },
  { name: '1-Juan', abrev: '1JN', chapters: 5, testament: 'NT' },
  { name: '2-Juan', abrev: '2JN', chapters: 1, testament: 'NT' },
  { name: '3-Juan', abrev: '3JN', chapters: 1, testament: 'NT' },
  { name: 'Judas', abrev: 'JUD', chapters: 1, testament: 'NT' },
  { name: 'Apocalipsis', abrev: 'AP', chapters: 22, testament: 'NT' },
];

function toApiKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function BibliaPage() {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(BIBLE_BOOKS.find(b => b.name === 'Salmos') ?? BIBLE_BOOKS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState('rv1960');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showBookList, setShowBookList] = useState(false);

  const chapters = Array.from({ length: selectedBook?.chapters ?? 150 }, (_, i) => i + 1);

  const filteredBooks = BIBLE_BOOKS.filter(b =>
    b.name.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const loadChapter = useCallback(async () => {
    if (!selectedBook?.name) {
      setError('Selecciona un libro antes de cargar.');
      return;
    }

    setLoading(true);
    setError('');
    setVerses([]);

    const key = toApiKey(selectedBook.name);
    const url = `https://bible-api.deno.dev/${selectedVersion}/${key}/${selectedChapter}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se encontró el capítulo');
      const data = await res.json();
      const rawList = data?.vers ?? data?.verses ?? [];
      const verseList: BibleVerse[] = Array.isArray(rawList)
        ? rawList.map((v: Record<string, unknown>) => ({
            number: (v.number as number) ?? 0,
            verse: (v.verse as string) ?? '',
          }))
        : [];
      setVerses(verseList);
    } catch (err) {
      setError(
        `No se encontró "${selectedBook.name}" capítulo ${selectedChapter}. Prueba con otra versión.`
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBook, selectedChapter, selectedVersion]);

  const selectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookList(false);
    setBookSearch('');
    setVerses([]);
    setError('');
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8">
      <ScrollReveal>
        <div className="mb-8 pb-5 border-b">
          <p className="text-xs tracking-widest uppercase text-muted-foreground font-medium mb-1">
            Recurso
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Estudio Bíblico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            66 libros · Antiguo y Nuevo Testamento · Múltiples versiones
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            <div className="relative">
              <Label>Libro</Label>
              <button
                type="button"
                className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm text-left"
                onClick={() => setShowBookList(!showBookList)}
              >
                <span>{selectedBook?.name ?? 'Selecciona un libro'}</span>
                {selectedBook && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {selectedBook.testament}
                  </span>
                )}
              </button>
              {showBookList && (
                <div className="absolute top-full left-0 right-0 z-50 bg-background border rounded-lg shadow-lg max-h-[280px] flex flex-col overflow-hidden mt-1">
                  <div className="p-2 border-b">
                    <Input
                      type="text"
                      placeholder="Buscar libro…"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredBooks.length === 0 ? (
                      <p className="p-3 text-center text-sm text-muted-foreground">Sin resultados</p>
                    ) : (
                      filteredBooks.map((book) => (
                        <button
                          key={book.abrev}
                          onClick={() => selectBook(book)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                          style={{
                            background: selectedBook?.abrev === book.abrev ? 'hsl(var(--accent))' : undefined,
                          }}
                        >
                          <span>{book.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {book.testament} · {book.chapters} cap.
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>Capítulo</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
                disabled={!selectedBook}
              >
                {chapters.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Versión</Label>
              <Input
                type="text"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                placeholder="rv1960, nvi, dhh"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={loadChapter} disabled={loading || !selectedBook}>
              {loading ? 'Cargando...' : 'Leer'}
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && verses.length > 0 && (
        <ScrollReveal delay={0.2}>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/50 flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold">
                {selectedBook?.name} {selectedChapter}
              </h2>
              {selectedVersion && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selectedVersion.toUpperCase()}
                </span>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                {verses.length} versículos
              </span>
            </div>
            <div className="p-4">
              {verses.map((v) => (
                <div
                  key={v.number}
                  className="flex gap-3 py-3 border-b last:border-b-0 hover:bg-muted/30 px-2 rounded"
                >
                  <span className="text-sm font-semibold text-primary min-w-[1.5rem] text-right pt-0.5">
                    {v.number}
                  </span>
                  <p className="text-base leading-relaxed">{v.verse}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {!loading && !verses.length && !error && (
        <div className="text-center py-16 text-muted-foreground">
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="mx-auto mb-4 opacity-35"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-lg font-medium text-muted-foreground/70 mb-1">
            {selectedBook ? 'Listo para leer' : 'Selecciona un libro'}
          </p>
          <p className="text-sm">
            {selectedBook
              ? `${selectedBook.name} — ${selectedBook.chapters} capítulos · Presiona Leer`
              : 'Haz clic en el selector de libro para explorar los 66 libros.'}
          </p>
        </div>
      )}
    </div>
  );
}
