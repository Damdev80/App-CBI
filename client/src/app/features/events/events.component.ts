import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EventService, EventModel } from '@app/core/services/event.service';

type EventType = 'EVENTO' | 'ACTIVIDAD' | 'REUNION';
type EventTypeFilter = EventType | 'ALL';

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
  private readonly minPrice = 1;
  private readonly maxPrice = 1_000_000;

  eventTypeOptions: Array<{ value: EventType; label: string }> = [
    { value: 'EVENTO', label: 'Evento' },
    { value: 'ACTIVIDAD', label: 'Actividad' },
    { value: 'REUNION', label: 'Reunión' },
  ];

  events     = signal<EventModel[]>([]);
  isLoading  = signal(true);
  showModal  = signal(false);
  saving     = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  selectedTypeFilter = signal<EventTypeFilter>('ALL');
  onlyWithPrice = signal<boolean>(false);

  eventCountByType = computed(() => {
    const all = this.events();
    return {
      EVENTO: all.filter((e) => e.eventType === 'EVENTO').length,
      ACTIVIDAD: all.filter((e) => e.eventType === 'ACTIVIDAD').length,
      REUNION: all.filter((e) => e.eventType === 'REUNION').length,
    };
  });

  filteredEvents = computed(() => {
    const typeFilter = this.selectedTypeFilter();
    const onlyPaid = this.onlyWithPrice();

    return this.events().filter((event) => {
      if (typeFilter !== 'ALL' && event.eventType !== typeFilter) return false;
      if (onlyPaid && !event.hasPrice) return false;
      return true;
    });
  });

  priceSummary = computed(() => {
    const rows = this.events();
    const paid = rows.filter((e) => e.hasPrice).length;
    const free = rows.length - paid;
    return { paid, free };
  });

  form = this.fb.group({
    title:       this.fb.control<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    description: this.fb.control<string>('', { nonNullable: true }),
    eventType:   this.fb.control<EventType>('EVENTO', { nonNullable: true }),
    hasPrice:    this.fb.control<boolean>(false, { nonNullable: true }),
    priceTier:   this.fb.control<number>(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(this.maxPrice)] }),
    eventDate:   this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() { this.loadEvents(); }

  loadEvents() {
    this.isLoading.set(true);
    this.eventService.getAllEvents().subscribe({
      next: (ev) => {
        const normalized = (ev || []).map((event) => ({
          ...event,
          eventType: (event.eventType || 'EVENTO') as EventType,
          hasPrice: Boolean(event.hasPrice),
          priceTier: Number.isFinite(event.priceTier) ? Number(event.priceTier) : 0,
        }));

        this.events.set(
          normalized.sort((a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
          ),
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openModal()  {
    this.form.reset({
      title: '',
      description: '',
      eventType: 'EVENTO',
      hasPrice: false,
      priceTier: 0,
      eventDate: '',
    });
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); }

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

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.errorMsg.set('');

    const { title, description, eventDate, eventType, hasPrice, priceTier } = this.form.getRawValue();
    const normalizedPrice = hasPrice ? this.normalizePriceAmount(priceTier) : 0;

    this.eventService.createEvent({
      title: title.trim(),
      description: description?.trim() || undefined,
      eventType,
      hasPrice,
      priceTier: normalizedPrice,
      eventDate,
    })
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

  setTypeFilter(filter: EventTypeFilter) {
    this.selectedTypeFilter.set(filter);
  }

  getEventTypeLabel(type: EventType): string {
    if (type === 'ACTIVIDAD') return 'Actividad';
    if (type === 'REUNION') return 'Reunión';
    return 'Evento';
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

  getEventCostLabel(event: EventModel): string {
    if (!event.hasPrice) return 'Gratis';
    return `$ ${this.formatCop(event.priceTier)} COP`;
  }

  private normalizePriceAmount(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return this.minPrice;
    const rounded = Math.round(parsed);
    return Math.min(this.maxPrice, Math.max(this.minPrice, rounded));
  }

  getTypeBadgeClass(type: EventType): string {
    if (type === 'ACTIVIDAD') return 'badge-accent';
    if (type === 'REUNION') return 'badge-ok';
    return 'badge';
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
