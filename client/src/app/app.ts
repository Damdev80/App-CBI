import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <main class="min-h-screen">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class App {
  constructor() {
    console.log('App component initialized');
  }
}
