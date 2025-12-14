import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RegisterEventService } from "@app/core/services/register-event.service";
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
    templateUrl: './register.component.html',  
})

export class RegisterComponent {
    
        registerForm: FormGroup;
        errorMessage = signal('');
        successMessage = signal('');
        isLoading = signal(false);

        private router = inject(Router);
        private fb = inject(FormBuilder);
        private registerService = inject(RegisterEventService);
        constructor(){
            this.registerForm = this.fb.group({
            number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            });
        }

        onSubmit() {
            this.errorMessage.set('');
            this.successMessage.set('');

            if (this.registerForm.invalid){
                this.errorMessage.set('Por favor, completa el formulario correctamente.');
                return;
            }
            

            this.isLoading.set(true);

            const formData = this.registerForm.value;

            this.registerService.register(formData).subscribe({
                next: (response) => {
                    this.isLoading.set(false);
                    this.successMessage.set('Registro exitoso. Redirigiendo al login...');
                    
                    this.registerForm.reset();
                    setTimeout(()=>{
                        this.router.navigate(['/login']);
                    }, 3000);
                },

                error: (error) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(error?.error?.message || 'Error en el registro. Por favor, intenta de nuevo.');
                }
            })
        }

    


        navigateTo(path: string) {  
        this.router.navigate([path])
    }
}
