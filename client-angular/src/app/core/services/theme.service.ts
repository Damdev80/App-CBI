import { Injectable, signal, effect, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  // Signal para el estado del tema
  isDarkMode = signal<boolean>(false);
  
  constructor() {
    // Solo inicializar en el navegador
    if (this.isBrowser) {
      // Detectar tema inicial desde localStorage o sistema
      this.initializeTheme();
    }
    
    // Efecto para aplicar el tema cuando cambie
    effect(() => {
      if (this.isBrowser) {
        this.applyTheme(this.isDarkMode());
      }
    });
  }
  
  private initializeTheme(): void {
    if (!this.isBrowser) return;
    
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        this.isDarkMode.set(true);
      } else {
        this.isDarkMode.set(false);
      }
    } catch (error) {
      // Fallback a modo claro si hay error accediendo localStorage
      console.warn('Error accessing localStorage:', error);
      this.isDarkMode.set(false);
    }
  }
  
  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;
    
    const body = this.document.body;
    
    if (isDark) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
    
    // Guardar en localStorage de forma segura
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }
  
  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }
  
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }
}