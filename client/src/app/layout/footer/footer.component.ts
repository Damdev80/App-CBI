import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Route } from "@angular/router";

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './footer.component.html',
})

export class FooterComponent {
    constructor() {}
    navigateTo(path: string) {
        // Implement navigation logic if needed
    }
}