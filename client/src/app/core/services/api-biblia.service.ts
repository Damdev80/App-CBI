import { Inject, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { profileEnd } from "console";

@Inject({
    providedIn: "root",
})

export class ApiBibliaService {
    private http = inject(HttpClient);
    private apiUrl = "https://bible-api.deno.dev/api"

    getChapter(book: string, chapter: number, version?: string): Observable<any> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<any>(`${prefix}/${book}/${chapter}`);
    }

    getBookInfo(book: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/book/${book}`);
    }

    getVerse(book: string, chapter: number, verse: number, version?: string): Observable<any> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<any>(`${prefix}/${book}/${chapter}/${verse}`);
    }

    getRange(book: string, chapter: number, range: string, version?: string): Observable<any> {
        const prefix = version ? `${this.apiUrl}/read/${version}` : `${this.apiUrl}/read`;
        return this.http.get<any>(`${prefix}/${book}/${chapter}/${range}`);
    }

    
}