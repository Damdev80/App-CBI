import { inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Signal, signal } from "@angular/core";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
})

export class Profile{
    private router = inject(Router);
    private fb = inject(FormBuilder);
    profileForm: FormGroup;
    userName: Signal<string> = signal('Usuario Ejemplo');
    userEmail: Signal<string> = signal('usuario@example.com');
    errorMessage = signal('');
    isLoading = signal(false);

    
    constructor(){
        this.profileForm = this.fb.group({
            name: [this.userName(), [Validators.required]],
            email: [this.userEmail(), [ Validators.required, Validators.email]],
        })
    }

    onSubmit(){
        if(this.profileForm.invalid){
            this.profileForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        const { name, email } = this.profileForm.value;
        
        
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}
