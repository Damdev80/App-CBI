import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersEventService } from '../../core/services/users-event.services';
import { Event } from '../../shared/models/userEvent.model';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-registration.component.html',
})
export class EventRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersEventService = inject(UsersEventService);
  private router = inject(Router);
  
  registrationForm!: FormGroup;
  events: Event[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.initForm();
    if (isPlatformBrowser(this.platformId)) {
      this.loadEvents();
    }
  }

  initForm() {
    this.registrationForm = this.fb.group({
      eventId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateBorn: ['', Validators.required],
      hasSiblings: [false]
    });
  }

  loadEvents() {
    this.usersEventService.getAllEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;
      },
      error: (error: any) => {
        console.error('Error loading events:', error);
        this.errorMessage = 'Error al cargar eventos. Intenta nuevamente.';
      }
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formValue = this.registrationForm.value;
      
      // Validar y formatear la fecha correctamente
      const dateBorn = formValue.dateBorn ? new Date(formValue.dateBorn) : new Date();
      if (isNaN(dateBorn.getTime())) {
        this.errorMessage = 'Fecha de nacimiento inválida';
        this.loading = false;
        return;
      }
      
      const data = {
        eventId: formValue.eventId,
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        dateBorn: dateBorn.toISOString(),
        hasSiblings: formValue.hasSiblings || false
      };

      this.usersEventService.createRegistration(data).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = '¡Inscripción exitosa! Te esperamos en el evento.';
          this.registrationForm.reset({ hasSiblings: false });
          
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Error al registrar. Intenta nuevamente.';
          console.error('Error:', error);
        }
      });
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  resetForm() {
    this.registrationForm.reset({ hasSiblings: false });
    this.successMessage = '';
    this.errorMessage = '';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get f() {
    return this.registrationForm.controls;
  }

  goBack() {
    this.router.navigate(['/dashboard/event-registrations-list']);
  }
}