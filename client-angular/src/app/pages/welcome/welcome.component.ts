import { Component, OnInit, signal } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { LemaCbiFullwidthComponent } from "../../shared/components/lema-cbi/lema-cbi-fullwidth.component";
import { environment } from "src/environments/environment";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'event' | 'culto-joven';
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LemaCbiFullwidthComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  calendarEvents = signal<CalendarEvent[]>([]);
  today = new Date();
  currentMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

  // ── Department join modal ──
  joinModal = signal(false);
  joinGroup   = '';
  joinName    = '';
  joinPhone   = '';
  joinMessage = '';
  joinLoading = signal(false);
  joinSuccess = signal(false);
  joinError   = signal('');

  readonly departments = [
    { name: 'Visión Juvenil',        desc: 'Jóvenes que buscan a Dios con pasión, creciendo en fe y liderando con propósito.', icon: '🔥' },
    { name: 'Adoremos',              desc: 'Un equipo que lleva la congregación al encuentro con el Padre a través de la música.', icon: '🎵' },
    { name: 'Exploradores del Rey',  desc: 'Ministerio de niños que aprenden a conocer a Jesús con alegría y creatividad.', icon: '⭐' },
    { name: 'Mujeres que Reinan',    desc: 'Mujeres de fe que crecen en identidad y propósito, sosteniéndose mutuamente.', icon: '👑' },
    { name: 'Varones Amigos de Dios', desc: 'Hombres que caminan en integridad y lideran con el ejemplo en comunidad.', icon: '🛡️' },
    { name: 'Danza Kadosh',          desc: 'El cuerpo como instrumento de adoración — la danza sagrada que expresa lo inefable.', icon: '💃' },
  ];

  readonly allDepartments = [
    'Staff', 'Visión Juvenil', 'Adoremos', 'Escuela de Formación',
    'Exploradores del Rey', 'Salvación', 'Audiovisuales',
    'Mujeres que Reinan', 'Varones Amigos de Dios', 'Danza Kadosh',
    'Intercesión', 'Entrelazados', 'Protocolo',
  ];

  // ── Calendar helpers ──
  get calendarDays(): (Date | null)[] {
    const year  = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    return cells;
  }

  get monthLabel(): string {
    const m = this.currentMonth.toLocaleDateString('es', { month: 'long' });
    const y = this.currentMonth.getFullYear();
    return `${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
  }

  prevMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1); }
  nextMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1); }

  eventsOnDay(date: Date): CalendarEvent[] {
    return this.calendarEvents().filter(e =>
      e.date.getFullYear() === date.getFullYear() &&
      e.date.getMonth()    === date.getMonth() &&
      e.date.getDate()     === date.getDate()
    );
  }

  isToday(date: Date): boolean {
    const t = this.today;
    return date.getFullYear() === t.getFullYear() &&
           date.getMonth()    === t.getMonth()    &&
           date.getDate()     === t.getDate();
  }

  formatDate(d: Date): string {
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDay(d: Date): string {
    const name = d.toLocaleDateString('es', { weekday: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // ── Youth services every 2 Saturdays from Mar 28 ──
  private generateYouthServices(): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const start = new Date(2026, 2, 28);
    for (let i = 0; i < 26; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i * 14);
      events.push({ id: `culto-joven-${i}`, title: 'Culto de Jóvenes', date: d, type: 'culto-joven' });
    }
    return events;
  }

  ngOnInit() {
    const fixed = this.generateYouthServices();
    this.http.get<any[]>(`${this.apiUrl}/event/events`).subscribe({
      next: (api) => {
        const real: CalendarEvent[] = (api ?? []).map(e => ({
          id: e.id, title: e.title, date: new Date(e.eventDate), type: 'event' as const,
        }));
        this.calendarEvents.set([...fixed, ...real]);
      },
      error: () => this.calendarEvents.set(fixed),
    });
  }

  /** Eventos del mes visible en el calendario, ordenados por fecha.
   *  Si no hay ninguno en ese mes, muestra los próximos 6 eventos desde hoy. */
  get upcomingEvents(): CalendarEvent[] {
    const y = this.currentMonth.getFullYear();
    const m = this.currentMonth.getMonth();

    const inMonth = this.calendarEvents()
      .filter(e => e.date.getFullYear() === y && e.date.getMonth() === m)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (inMonth.length) return inMonth;

    // Fallback: próximos desde hoy
    const now = Date.now();
    return this.calendarEvents()
      .filter(e => e.date.getTime() >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 6);
  }

  // ── Group join request ──
  openJoinModal(groupName: string) {
    this.joinGroup   = groupName;
    this.joinName    = '';
    this.joinPhone   = '';
    this.joinMessage = '';
    this.joinError.set('');
    this.joinSuccess.set(false);
    this.joinModal.set(true);
  }

  closeJoinModal() {
    this.joinModal.set(false);
  }

  submitJoinRequest() {
    if (!this.joinName.trim() || !this.joinPhone.trim()) {
      this.joinError.set('Por favor ingresa tu nombre y teléfono.');
      return;
    }
    this.joinLoading.set(true);
    this.joinError.set('');
    this.http.post(`${this.apiUrl}/group/join-request`, {
      groupName: this.joinGroup,
      name:      this.joinName.trim(),
      phone:     this.joinPhone.trim(),
      message:   this.joinMessage.trim() || undefined,
    }).subscribe({
      next: () => {
        this.joinLoading.set(false);
        this.joinSuccess.set(true);
      },
      error: () => {
        this.joinLoading.set(false);
        this.joinError.set('Ocurrió un error. Intenta de nuevo.');
      },
    });
  }

  constructor(private http: HttpClient) {}
}
