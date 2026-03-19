import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventService, EventModel } from '@app/core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './events.component.html',
})
export class EventsComponent implements OnInit {
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  events     = signal<EventModel[]>([]);
  isLoading  = signal(true);
  showModal  = signal(false);
  saving     = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    eventDate:   ['', [Validators.required]],
  });

  ngOnInit() { this.loadEvents(); }

  loadEvents() {
    this.isLoading.set(true);
    this.eventService.getAllEvents().subscribe({
      next: (ev) => {
        this.events.set(ev.sort((a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        ));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal()  { this.form.reset(); this.errorMsg.set(''); this.successMsg.set(''); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');
    const { title, description, eventDate } = this.form.value;
    this.eventService.createEvent({ title: title!, description: description || undefined, eventDate: eventDate! })
      .subscribe({
        next: () => {
          this.successMsg.set('Evento creado correctamente.');
          this.saving.set(false);
          this.loadEvents();
          setTimeout(() => this.closeModal(), 1200);
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear el evento.');
          this.saving.set(false);
        }
      });
  }

  goToRegistrations(eventId: string) {
    this.router.navigate(['/dashboard/event-registrations-list'], { queryParams: { eventId } });
  }

  isPast(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  daysLabel(dateStr: string): string {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'Pasado';
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff}d`;
  }
}
