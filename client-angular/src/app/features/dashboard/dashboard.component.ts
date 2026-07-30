import {
  Component, inject, signal, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, PLATFORM_ID, OnInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/dashboard-cards/stat-card.component';
import { DashboardEventService } from '@app/core/services/dashboard-event.service';
import { AuthService } from '@app/core/services/auth.service';
import { MembersService } from '@app/core/services/members.service';
import { EventService, EventModel } from '@app/core/services/event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutChart')   donutRef!: ElementRef;
  @ViewChild('genderChart')  genderRef!: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private membersService = inject(MembersService);
  private dashboardEventService = inject(DashboardEventService);
  private eventService = inject(EventService);

  role = signal<string | null>(null);
  userId: string | null = null;
  groupIds = signal<string[]>([]);

  totalUsers          = signal<number>(0);
  totalBautized       = signal<number>(0);
  totalWomenRegistered = signal<number>(0);
  totalcountUnpaid    = signal<number>(0);
  isLoading           = signal<boolean>(true);
  error               = signal<string | null>(null);

  upcomingEvents = signal<EventModel[]>([]);
  chartsReady    = false;

  private donutInstance:  any = null;
  private genderInstance: any = null;
  private resizeHandler?: () => void;

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userId = decoded.sub || decoded.userId || decoded.id;
        this.role.set(decoded.role || null);
      } catch (_) {}
    }

    if (this.userId) {
      this.membersService.getGroupsByUserId(this.userId).subscribe({
        next: (g) => this.groupIds.set(Array.isArray(g) ? g.map((x: any) => x.groupId) : []),
        error: () => {}
      });
    }

    const role = this.role();
    const canSeeGender = role === 'ADMIN' || role === 'SEMI_ADMIN' || role === 'LIDER_GRUPO' || role === 'LIDER';
    if (canSeeGender) {
      this.dashboardEventService.getNumberWomenRegistered().subscribe({
        next: (value) => this.totalWomenRegistered.set(value),
        error: () => this.totalWomenRegistered.set(0),
      });
    }

    this.dashboardEventService.getRoleSummary().subscribe({
      next: (summary) => {
        this.totalUsers.set(summary.kpis.totalUsers ?? 0);
        this.totalBautized.set(summary.kpis.totalBaptized ?? 0);
        this.totalWomenRegistered.set(0);
        this.totalcountUnpaid.set(
          summary.kpis.pendingServicePayments ?? summary.kpis.totalUnpaidEvents ?? 0,
        );
        this.isLoading.set(false);
        this.chartsReady = true;
        setTimeout(() => this.buildCharts(), 50);
      },
      error: (err) => {
        this.error.set(err?.message || 'Error cargando datos');
        this.isLoading.set(false);
      }
    });

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        const now = new Date();
        const upcoming = events
          .filter(e => new Date(e.eventDate) >= now)
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
          .slice(0, 5);
        this.upcomingEvents.set(upcoming.length ? upcoming : events.slice(0, 5));
      },
      error: () => {}
    });
  }

  ngAfterViewInit() {
    if (this.chartsReady) this.buildCharts();
  }

  buildCharts() {
    if (!isPlatformBrowser(this.platformId)) return;
    import('echarts').then(echarts => {
      this.buildDonut(echarts);
      this.buildGender(echarts);
      this.setupResize(echarts);
    });
  }

  private buildDonut(echarts: any) {
    if (!this.donutRef?.nativeElement) return;
    if (this.donutInstance) this.donutInstance.dispose();

    const total    = this.totalUsers();
    const baut     = this.totalBautized();
    const noBaut   = Math.max(0, total - baut);
    const pct      = total > 0 ? Math.round((baut / total) * 100) : 0;
    const hasData  = total > 0;

    this.donutInstance = echarts.init(this.donutRef.nativeElement);
    this.donutInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--line)',
        textStyle: { color: 'var(--ink)', fontFamily: 'DM Sans', fontSize: 12 }
      },
      legend: {
        show: true,
        bottom: 8,
        left: 'center',
        textStyle: { color: 'var(--ink-2)', fontFamily: 'DM Sans', fontSize: 11 }
      },
      graphic: [{
        type: 'text',
        left: 'center',
        top: '44%',
        style: {
          text: hasData ? `${pct}%` : '—',
          fontSize: 26,
          fontWeight: 'bold',
          fontFamily: 'Cormorant Garant, Georgia, serif',
          fill: 'var(--accent)',
        }
      }, {
        type: 'text',
        left: 'center',
        top: '56%',
        style: {
          text: 'bautizados',
          fontSize: 11,
          fontFamily: 'DM Sans',
          fill: 'var(--ink-3)',
        }
      }],
      series: [{
        name: 'Bautizados',
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false, label: { show: false } },
        data: hasData
          ? [
              { value: baut,  name: 'Bautizados',    itemStyle: { color: '#1B3454' } },
              { value: noBaut, name: 'No bautizados', itemStyle: { color: '#E3E3DE' } },
            ]
          : [
              { value: 1, name: 'Sin datos', itemStyle: { color: '#E3E3DE' } },
            ],
      }]
    });
    this.donutInstance.resize();
  }

  private buildGender(echarts: any) {
    if (!this.genderRef?.nativeElement) return;
    if (this.genderInstance) this.genderInstance.dispose();

    const total   = this.totalUsers();
    const mujeres = this.totalWomenRegistered();
    const hombres = Math.max(0, total - mujeres);

    this.genderInstance = echarts.init(this.genderRef.nativeElement);
    this.genderInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--line)',
        textStyle: { color: 'var(--ink)', fontFamily: 'DM Sans', fontSize: 12 }
      },
      grid: { left: 12, right: 12, top: 24, bottom: 28, containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Hombres', 'Mujeres'],
        axisLine: { lineStyle: { color: 'var(--line)' } },
        axisLabel: { color: 'var(--ink-2)', fontFamily: 'DM Sans', fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        axisLabel: { color: 'var(--ink-3)', fontFamily: 'DM Sans', fontSize: 10 },
        splitLine: { lineStyle: { color: 'var(--line-2)', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [{
        name: 'Miembros',
        type: 'bar',
        barWidth: '42%',
        barGap: '30%',
        borderRadius: [6, 6, 0, 0],
        data: [
          { value: hombres, itemStyle: { color: '#1B3454' } },
          { value: mujeres, itemStyle: { color: '#8BADCC' } },
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'DM Sans',
          fontSize: 14,
          fontWeight: '600',
          color: 'var(--ink)',
          formatter: (params: any) => params.value > 0 ? params.value : ''
        }
      }]
    });
    this.genderInstance.resize();
  }

  private setupResize(echarts: any) {
    this.resizeHandler = () => {
      this.donutInstance?.resize();
      this.genderInstance?.resize();
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy() {
    this.donutInstance?.dispose();
    this.genderInstance?.dispose();
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
  }

  get bautizedPercent(): number {
    const t = this.totalUsers();
    return t > 0 ? Math.round((this.totalBautized() / t) * 100) : 0;
  }

  get menCount(): number {
    return Math.max(0, this.totalUsers() - this.totalWomenRegistered());
  }

  formatEventDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es', {
      weekday: 'short', day: 'numeric', month: 'short'
    });
  }

  daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
