import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-404',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './404.component.html',
})

export class NotFoundComponent {
    constructor(private router: Router) {}
    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}