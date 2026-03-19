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
  [key: string]: any;
}

@Injectable({
    providedIn: "root",
})
export class ApiBibliaService {
    private http = inject(HttpClient);
    private apiUrl = "https://bible-api.deno.dev/api";

    getAllBooks(): Observable<BibleBook[]> {
        return this.http.get<BibleBook[]>(`${this.apiUrl}/books`);
    }

    getBookInfo(book: string): Observable<BibleBook> {
        return this.http.get<BibleBook>(`${this.apiUrl}/book/${book}`);
    }

    getChapter(book: string, chapter: number, version?: string): Observable<BibleChapterResult> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<BibleChapterResult>(`${prefix}/${book}/${chapter}`);
    }

    getVerse(book: string, chapter: number, verse: number, version?: string): Observable<BibleChapterResult> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<BibleChapterResult>(`${prefix}/${book}/${chapter}/${verse}`);
    }

    getRange(book: string, chapter: number, range: string, version?: string): Observable<BibleChapterResult> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<BibleChapterResult>(`${prefix}/${book}/${chapter}/${range}`);
    }
}
