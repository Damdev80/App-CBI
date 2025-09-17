import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    imports: [CommonModule],
})

export class LoginComponent {
    constructor(private router:Router) {}
        navegateTo(path: string) {  
        this.router.navigate([path])
    }
}