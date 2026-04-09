import { ChangeDetectorRef, Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginEventService } from "@app/core/services/login-event.service";
import { profileService } from "@app/core/services/profile.service";
import { LoginResponse } from "@app/shared/models/login.model";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationService } from "@app/core/services/notification.service";

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
})
export class LoginComponent {

    private router = inject(Router);
    private fb = inject(FormBuilder);
    private loginService = inject(LoginEventService);
    private profileService = inject(profileService);
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
        const credentials = {
          email: String(email || '').trim().toLowerCase(),
          password: String(password || '').trim(),
        };

        this.loginService.login(credentials).subscribe({
            next: (response: LoginResponse) => {
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('access_token', response.access_token);
                this.notificationService.showSuccess('Inicio de sesión exitoso');
                this.profileService.getProfileWithGroups().subscribe({
                    next: (profile) => {
                        const groups = profile.groups || [];
                        const privilegedRoles = ['ADMIN', 'SEMI_ADMIN', 'CONTADORA'];
                        const isPrivileged = privilegedRoles.includes(profile.role ?? '');
                        this.isLoading.set(false);
                        if (groups.length === 0 && !isPrivileged) {
                            this.router.navigate(['/app']);
                        } else {
                            this.router.navigate(['/dashboard']);
                        }
                    },
                    error: () => {
                        this.isLoading.set(false);
                        this.router.navigate(['/dashboard']);
                    },
                });
            },
            error: (err: HttpErrorResponse) => {
                this.isLoading.set(false);
                const msg = err?.error?.message ?? 'Error en el inicio de sesión';
                this.errorMessage.set(msg);
                this.cdr.detectChanges();
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}