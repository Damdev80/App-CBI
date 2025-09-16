import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.component.html',
})

export class LoginComponent {
    constructor(private router: Router) {}

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}