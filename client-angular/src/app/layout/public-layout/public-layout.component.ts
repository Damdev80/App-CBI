import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@app/shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, ThemeToggleComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
  constructor(private router:Router) {}
        navigateTo(path: string) {  
        this.router.navigate([path])
    }
  currentYear = new Date().getFullYear();
}
