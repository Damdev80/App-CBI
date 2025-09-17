import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent {
  constructor(private router:Router) {}
        navigateTo(path: string) {  
        this.router.navigate([path])
    }
  currentYear = new Date().getFullYear();
}
