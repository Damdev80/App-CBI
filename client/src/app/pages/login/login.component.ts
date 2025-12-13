import { ChangeDetectorRef, Component, inject, PLATFORM_ID } from "@angular/core";
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
    private platformId = inject(PLATFORM_ID);
    private cdr = inject(ChangeDetectorRef);
    private notificationService = inject(NotificationService);

    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

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

        this.isLoading = true;
        this.errorMessage = '';

        const { email, password, rememberMe } = this.loginForm.value;

        this.loginService.login({ email, password }).subscribe({
            next: (response: LoginResponse) => {
                if (isPlatformBrowser(this.platformId)) {
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('access_token', response.access_token);
                }

                this.isLoading = false;
                this.notificationService.showSuccess('Inicio de sesión exitoso');
                this.router.navigate(['/dashboard']);
            },
            error: (httpError: HttpErrorResponse) => {
                this.isLoading = false;
                this.errorMessage = httpError.error?.message || 'Error en el inicio de sesión';
                this.cdr.detectChanges();
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}