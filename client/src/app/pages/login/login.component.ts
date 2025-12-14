import { ChangeDetectorRef, Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginEventService } from "@app/core/services/login-event.service";
import { LoginResponse, HttpErrorResponse } from "@app/shared/models/login.model";
import { NotificationService } from "@app/core/services/notification.service";
@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {

    private router = inject(Router);
    private fb = inject(FormBuilder);
    private loginService = inject(LoginEventService);
    private cdr = inject(ChangeDetectorRef);
    private notificationService = inject(NotificationService);

    loginForm: FormGroup;
    errorMessage = signal('');
    isLoading = signal(false);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            rememberMe: [false]
        });
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        const { email, password, rememberMe } = this.loginForm.value;

        this.loginService.login({ email, password }).subscribe({
            next: (response: LoginResponse) => {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('access_token', response.access_token);
                this.isLoading.set(false);
                this.notificationService.showSuccess('Inicio de sesión exitoso');
                this.router.navigate(['/dashboard']);
            },
            error: (httpError: HttpErrorResponse) => {
                this.isLoading.set(false);
                this.errorMessage.set(httpError.error?.message || 'Error en el inicio de sesión');
                this.cdr.detectChanges();
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}