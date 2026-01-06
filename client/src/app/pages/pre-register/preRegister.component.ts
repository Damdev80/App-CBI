import { CommonModule, } from "@angular/common";
import { Component } from "@angular/core";
import { Signal, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { PreRegisterService } from "@app/core/services/pre-register.service";
import { inject } from "@angular/core";

@Component({
    selector: 'app-pre-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './preRegister.component.html',
})

export class PreRegisterComponent {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private preRegisterService = inject(PreRegisterService);
    
}