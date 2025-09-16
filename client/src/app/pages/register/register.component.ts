import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './register.component.html',  
})

export class RegisterComponent {
    constructor(private router:Router) {}
        navigateTo(path: string) {  
        this.router.navigate([path])
    }
}
