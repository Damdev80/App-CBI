import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './header.component.html',
})

export class HeaderComponent {
    constructor(private router: Router) {}

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}