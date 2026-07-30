import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService, EventModel } from '@app/core/services/event.service';

type EventType = 'EVENTO' | 'ACTIVIDAD' | 'REUNION';

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
  private readonly minPrice = 1;
  private readonly maxPrice = 1_000_000;

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  recentEvents = signal<EventModel[]>([]);
  eventTypeOptions: Array<{ value: EventType; label: string }> = [
    { value: 'EVENTO', label: 'Evento' },
    { value: 'ACTIVIDAD', label: 'Actividad' },
    { value: 'REUNION', label: 'Reunión' },
  ];

  form = this.fb.group({
    title: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1), Validators.maxLength(255)] }),
    description: this.fb.control<string>('', { nonNullable: true }),
    eventType: this.fb.control<EventType>('EVENTO', { nonNullable: true }),
    hasPrice: this.fb.control<boolean>(false, { nonNullable: true }),
    priceTier: this.fb.control<number>(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(this.maxPrice)] }),
    eventDate: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
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

    const { title, description, eventType, hasPrice, priceTier, eventDate } = this.form.getRawValue();
    const normalizedPrice = hasPrice ? this.normalizePriceAmount(priceTier) : 0;
    this.eventService.createEvent({
      title: title.trim(),
      description: description?.trim() || undefined,
      eventType,
      hasPrice,
      priceTier: normalizedPrice,
      eventDate,
    }).subscribe({
      next: () => {
        this.successMessage.set('Evento creado correctamente.');
        this.form.reset({
          title: '',
          description: '',
          eventType: 'EVENTO',
          hasPrice: false,
          priceTier: 0,
          eventDate: '',
        });
        this.loadEvents();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Error al crear el evento.');
        this.isLoading.set(false);
      }
    });
  }

  onHasPriceToggle() {
    const hasPrice = Boolean(this.form.get('hasPrice')?.value);
    const priceControl = this.form.get('priceTier');
    if (!priceControl) return;

    if (!hasPrice) {
      priceControl.setValue(0);
      return;
    }

    priceControl.setValue(this.normalizePriceAmount(priceControl.value));
  }

  onPriceSliderInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.form.get('priceTier')?.setValue(this.normalizePriceAmount(target.value));
  }

  onPriceInputBlur() {
    const hasPrice = Boolean(this.form.get('hasPrice')?.value);
    if (!hasPrice) return;
    const priceControl = this.form.get('priceTier');
    if (!priceControl) return;
    priceControl.setValue(this.normalizePriceAmount(priceControl.value));
  }

  currentPriceTier(): number {
    return Number(this.form.get('priceTier')?.value ?? 0);
  }

  formatCop(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(Number(amount) || 0)));
  }

  private normalizePriceAmount(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return this.minPrice;
    const rounded = Math.round(parsed);
    return Math.min(this.maxPrice, Math.max(this.minPrice, rounded));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
  }
}
