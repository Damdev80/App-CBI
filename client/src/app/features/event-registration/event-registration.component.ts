import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

  registrationForm!: FormGroup;
  events: Event[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.initForm();
    this.loadEvents();
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

  // Obtener el evento seleccionado
  getSelectedEvent(): Event | undefined {
    const eventId = this.registrationForm.get('eventId')?.value;
    return this.events.find(e => e.id === eventId);
  }

  // Obtener el precio calculado basado en el evento y descuento
  getCalculatedPrice(): number {
    const selectedEvent = this.getSelectedEvent();
    if (!selectedEvent) return 0;
    
    const hasSiblings = this.registrationForm.get('hasSiblings')?.value;
    const discount = 10000;
    return hasSiblings ? selectedEvent.price - discount : selectedEvent.price;
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
}