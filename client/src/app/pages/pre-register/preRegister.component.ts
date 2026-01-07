import { CommonModule, } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Signal, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { PreRegisterService } from "@app/core/services/pre-register.service";
import { RegisterEventService } from "@app/core/services/register-event.service";
import { inject } from "@angular/core";

@Component({
    selector: 'app-pre-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './preRegister.component.html',
})

export class PreRegisterComponent implements OnInit {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private preRegisterService = inject(PreRegisterService);
    private registerEventService = inject(RegisterEventService);

    preRegisterForm: FormGroup;
    errorMessage = signal('');
    isLoading = signal(false);
    groups = signal<string[]>([]);

    constructor(){
        this.preRegisterForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            sexo: ['', [Validators.required]],
            number: ['', [Validators.required, Validators.minLength(10)]],
            address: ['', [Validators.required, Validators.minLength(5)]],
            baptized: [false, [Validators.required]],
            isServing: [false],
            group: [''],
            happybirth: ['', [Validators.required]],
        });

        // Escuchar cambios en isServing para activar/desactivar y validar group
        this.preRegisterForm.get('isServing')?.valueChanges.subscribe((isServing) => {
            const groupControl = this.preRegisterForm.get('group');
            if (isServing) {
                groupControl?.setValidators([Validators.required]);
                groupControl?.enable();
            } else {
                groupControl?.clearValidators();
                groupControl?.setValue('');
                groupControl?.disable();
            }
            groupControl?.updateValueAndValidity();
        });
    }

    ngOnInit(): void {
        this.loadGroups();
        // Inicializar el campo group como deshabilitado
        this.preRegisterForm.get('group')?.disable();
    }

    loadGroups(): void {
        this.registerEventService.getAllGroups().subscribe({
            next: (groups) => {
                this.groups.set(groups);
            },
            error: (error) => {
                console.error('Error al cargar grupos:', error);
            }
        });
    }

    async onSubmit() {
        if(this.preRegisterForm.invalid){
            this.preRegisterForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');
        
        // Obtener todos los valores incluyendo los deshabilitados
        const formdata = {
            ...this.preRegisterForm.value,
            group: this.preRegisterForm.get('group')?.value || ''
        };
        
        if(formdata.baptized === null){
            formdata.baptized = false;
        }
        
        // Si no está sirviendo, enviar string vacío para group
        if (!formdata.isServing) {
            formdata.group = '';
        }
        
        // Remover isServing antes de enviar
        delete formdata.isServing;

        try {
            await this.preRegisterService.preRegisterUser(formdata);
            alert('Pre-registro exitoso. Ahora puedes completar tu registro.');
            this.router.navigate(['/register']);
        } catch (error: any) {
            this.errorMessage.set(error?.error?.message || 'Error al realizar el pre-registro');
        } finally {
            this.isLoading.set(false);
        }
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}