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
      dateBorn: ['', Validators.required],
      wayPay: ['', Validators.required],
      hasSiblings: [false],
      paymentAmount: [0, [Validators.required, Validators.min(0)]],
      payStatus: ['DEBE']
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
      const data = {
        ...formValue,
        dateBorn: new Date(formValue.dateBorn).toISOString()
      };

      this.usersEventService.createRegistration(data).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.successMessage = '¡Inscripción exitosa! Te esperamos en el evento.';
          this.registrationForm.reset({ payStatus: 'DEBE', hasSiblings: false });
          
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
    this.registrationForm.reset({ payStatus: 'DEBE', hasSiblings: false });
    this.successMessage = '';
    this.errorMessage = '';
  }

  getCalculatedPrice(): number {
    const hasSiblings = this.registrationForm.get('hasSiblings')?.value;
    const basePrice = 60000;
    const discount = 10000;
    return hasSiblings ? basePrice - discount : basePrice;
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