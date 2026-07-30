import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '@app/core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <main class="bg-main text-main min-h-screen">
      
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App {
  // Inyectar el servicio para inicializar el tema
  private themeService = inject(ThemeService);
  
  constructor() {
    console.log('App component initialized');
  }
}
