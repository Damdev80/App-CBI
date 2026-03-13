import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiBibliaService } from "src/app/core/services/api-biblia.service";
import { Router } from "@angular/router";
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'module-biblia',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, SelectModule, MessageModule],
  templateUrl: './module-biblia.component.html'
})
export class ModuleBibliaComponent {
  private api = inject(ApiBibliaService);
  private router = inject(Router);

  books = ['salmos','proverbios','mateo','marcos','lucas','juan','genesis','exodo','levitico','numeros','deuteronomio'];
  bookOptions = this.books.map(b => ({ label: b, value: b }));
  selectedBook = 'salmos';
  chapters: number[] = [];
  chapterOptions: { label: string; value: number }[] = [];
  selectedChapter?: number;
  version?: string;
  result: any = null;
  error?: string;

  constructor() {
    this.onBookChange(); // carga capítulos iniciales
  }

  onBookChange() {
    this.error = undefined;
    this.selectedChapter = undefined;
    this.chapters = [];
    this.chapterOptions = [];
    this.api.getBookInfo(this.selectedBook).subscribe({
      next: info => {
        if (typeof info.chapters === 'number') {
          this.chapters = Array.from({ length: info.chapters }, (_, i) => i + 1);
        } else if (Array.isArray(info.chapters) && info.chapters.length) {
          const count = info.chapters.length;
          this.chapters = Array.from({ length: count }, (_, i) => i + 1);
        } else if (info.chapterCount) {
          this.chapters = Array.from({ length: info.chapterCount }, (_, i) => i + 1);
        } else {
          this.chapters = Array.from({ length: 50 }, (_, i) => i + 1);
        }
        this.chapterOptions = this.chapters.map(c => ({ label: String(c), value: c }));
      },
      error: err => {
        this.error = 'No se pudo obtener info del libro: ' + (err?.message || err);
        this.chapters = Array.from({ length: 50 }, (_, i) => i + 1);
        this.chapterOptions = this.chapters.map(c => ({ label: String(c), value: c }));
      }
    });
  }

  fetchChapter() {
    if (!this.selectedBook || !this.selectedChapter) return;
    this.result = null;
    this.error = undefined;
    this.api.getChapter(this.selectedBook, this.selectedChapter, this.version).subscribe({
      next: data => { this.result = data; },
      error: err => { this.error = err?.message || 'Error al cargar capítulo'; }
    });
  }

  fetchRange(range: string) {
    if (!this.selectedBook || !this.selectedChapter) return;
    this.result = null;
    this.error = undefined;
    this.api.getRange(this.selectedBook, this.selectedChapter, range, this.version).subscribe({
      next: data => { this.result = data; },
      error: err => { this.error = err?.message || 'Error al cargar rango'; }
    });
  }

  fetchVerse(verse: number) {
    if (!this.selectedBook || !this.selectedChapter || !verse) return;
    this.result = null;
    this.error = undefined;
    this.api.getVerse(this.selectedBook, this.selectedChapter, verse, this.version).subscribe({
      next: data => { this.result = data; },
      error: err => { this.error = err?.message || 'Error al cargar versículo'; }
    });
  }
  
    navigateTo(path: string) {
    this.router.navigate([path]);
    }
}