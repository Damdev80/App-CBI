import { inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Signal, signal } from "@angular/core";
import { profileService, UserProfile, Gender, Dicipules } from "../../core/services/profile.service";
import { HttpClientModule } from "@angular/common/http";

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
    templateUrl: './profile.component.html',
})
export class Profile implements OnInit {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private profileService = inject(profileService);

    profileForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    genderOptions = Object.values(Gender);
    dicipulesOptions = Object.values(Dicipules);

    constructor() {
        this.profileForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            number: [''],
            address: [''],
            happybirth: [''],
            gender: [''],
            baptized: [false],
            isActive: [true],
            role: [''],
            age: [null],
            hobbies: [''],
            dreams: [''],
            job: [''],
            vulnerable_area: [''],
            levelDicipules: [''],
        });
    }

    ngOnInit() {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (profile) => {
                // Convertir fechas a formato yyyy-MM-dd para el input date
                if (profile.happybirth) {
                    profile.happybirth = profile.happybirth.split('T')[0];
                }
                this.profileForm.patchValue(profile);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set('Error al cargar el perfil');
                this.isLoading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');
        // Convertir fecha a ISO string si existe
        const formValue = { ...this.profileForm.value };
        if (formValue.happybirth) {
            formValue.happybirth = new Date(formValue.happybirth).toISOString();
        }
        this.profileService.updateProfile(formValue).subscribe({
            next: (profile) => {
                this.successMessage.set('Perfil actualizado correctamente');
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set('Error al actualizar el perfil');
                this.isLoading.set(false);
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}