import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '@app/core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button
      [icon]="themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
      [text]="true"
      [rounded]="true"
      (click)="toggleTheme()"
      [title]="themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro'"
      styleClass="theme-toggle-btn"
    />
  `,
  styles: [`
    :host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
    
    @media (max-width: 768px) {
      :host {
        top: 0.5rem;
        right: 0.5rem;
      }
    }
    
    ::ng-deep .theme-toggle-btn {
      background-color: var(--color-background-secondary) !important;
      border: 1px solid var(--color-border) !important;
      color: var(--color-text-primary) !important;
      transition: all 0.3s ease !important;
    }
    
    ::ng-deep .theme-toggle-btn:hover {
      background-color: var(--color-background-tertiary) !important;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}