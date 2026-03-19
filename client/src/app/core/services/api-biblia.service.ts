import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface BibleBook {
  name: string;
  abrev: string;
  chapters: number;
  testament: string;
}

export interface BibleVerse {
  number: number;
  verse: string;
}

export interface BibleChapterResult {
  verses?: BibleVerse[];
  vers?: Array<{ number: number; verse: string; [key: string]: any }>;
  [key: string]: any;
}

/** Según documentación: https://docs-bible-api.netlify.app/api/chapter
 *  La API exige VERSIÓN y devuelve { vers: [{ verse, number }] }
 */
@Injectable({ providedIn: "root" })
export class ApiBibliaService {
  private http = inject(HttpClient);
  private apiUrl = "https://bible-api.deno.dev/api";

  /** Versión por defecto (obligatoria en /read) */
  readonly defaultVersion = "rv1960";

  getAllBooks(): Observable<BibleBook[]> {
    return this.http.get<BibleBook[]>(`${this.apiUrl}/books`);
  }

  getBookInfo(book: string): Observable<BibleBook> {
    return this.http.get<BibleBook>(`${this.apiUrl}/book/${book}`);
  }

  /**
   * Capítulo completo.
   * URL: /api/read/{version}/{book}/{chapter}
   */
  getChapter(book: string, chapter: number, version?: string): Observable<BibleChapterResult> {
    const ver = (version || this.defaultVersion).trim().toLowerCase();
    return this.http.get<BibleChapterResult>(`${this.apiUrl}/read/${ver}/${book}/${chapter}`);
  }

  /**
   * Un versículo.
   * URL: /api/read/{version}/{book}/{chapter}/{verse}
   */
  getVerse(book: string, chapter: number, verse: number, version?: string): Observable<BibleChapterResult> {
    const ver = (version || this.defaultVersion).trim().toLowerCase();
    return this.http.get<BibleChapterResult>(`${this.apiUrl}/read/${ver}/${book}/${chapter}/${verse}`);
  }

  /**
   * Rango de versículos (ej. "5-10").
   * URL: /api/read/{version}/{book}/{chapter}/{range}
   */
  getRange(book: string, chapter: number, range: string, version?: string): Observable<BibleChapterResult> {
    const ver = (version || this.defaultVersion).trim().toLowerCase();
    return this.http.get<BibleChapterResult>(`${this.apiUrl}/read/${ver}/${book}/${chapter}/${range}`);
  }
}
