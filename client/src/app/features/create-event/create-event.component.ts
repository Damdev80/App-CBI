import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService, EventModel } from '@app/core/services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
})
export class CreateEventComponent {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  recentEvents = signal<EventModel[]>([]);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: [''],
    eventDate: ['', [Validators.required]],
  });

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => this.recentEvents.set(events.slice(0, 10)),
      error: () => {}
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { title, description, eventDate } = this.form.value;
    this.eventService.createEvent({
      title: title!,
      description: description || undefined,
      eventDate: eventDate!,
    }).subscribe({
      next: () => {
        this.successMessage.set('Evento creado correctamente.');
        this.form.reset();
        this.loadEvents();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al crear el evento.');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
  }
}
