import { Component, inject, signal } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '@app/shared/components/dashboard-cards/stat-card.component';
import { DashboardEventService } from '@app/core/services/dashboard-event.service';
import { AuthService } from '@app/core/services/auth.service';
import { MembersService } from '@app/core/services/members.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  role = signal<string | null>(null);
  userId: string | null = null;
  groupIds = signal<string[]>([]);

  constructor(private authService: AuthService, private membersService: MembersService) {
    this.role.set(this.authService.getRole());
    this.userId = this.authService.getUser()?.id ?? null;
  }

  private dashboardEventService = inject(DashboardEventService);

  totalUsers = signal<number>(0);
  totalBautized = signal<number>(0);
  totalWomenRegistered = signal<number>(0);
  totalcountUnpaid = signal<number>(0);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    // Obtener el token usando AuthService (soporta localStorage y sessionStorage)
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userId = decoded.sub || decoded.userId || decoded.id;
        this.role.set(decoded.role || null);
      } catch (e) {
        // Opcional: puedes dejar un error si quieres
      }
    }
    this.LoadDashboardDataUser();
    this.LoadDashboardBautized();
    this.LoadDashboardWomenRegistered();
    this.LoadDahboardcountUnpaid();
    // Cargar los groupIds del usuario
    if (this.userId) {
      this.membersService.getGroupsByUserId(this.userId).subscribe({
        next: (groups) => {
          this.groupIds.set(Array.isArray(groups) ? groups.map(g => g.groupId) : []);
        },
        error: (err) => {
          console.error('Error cargando grupos del usuario', err);
        }
      });
    }
  }

  LoadDashboardDataUser(){
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardEventService.getNumberUser().subscribe({
      next:(count) => {
        this.totalUsers.set(count);
        this.isLoading.set(false);
      },

      error:(err) => {
        this.error.set('Error loading dashboard data');
        this.error.set(err.message || 'Unknown error');
        this.isLoading.set(false);
      }
    })
  }

  LoadDashboardBautized(){
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardEventService.getNumberBautized().subscribe({
      next:(count) => {
        this.totalBautized.set(count);
        this.isLoading.set(false);
      },

      error:(err) => {
        this.error.set('Error loading dashboard data');
        this.error.set(err.message || 'Unknown error');
        this.isLoading.set(false);
      }
    })
  }

  LoadDashboardWomenRegistered(){
    this.isLoading.set(true);
    this.error.set(null);


    this.dashboardEventService.getNumberWomenRegistered().subscribe({
      next:(count) => {
        this.totalWomenRegistered.set(count);
        this.isLoading.set(false);
      },

      error:(err) => {
        this.error.set('Error loading dashboard data');
        this.error.set(err.message || 'Unknown error');
        this.isLoading.set(false);
      }
    })
  }
  LoadDahboardcountUnpaid(){
    this.isLoading.set(false)
    this.error.set(null)

    this.dashboardEventService.getcountUnpaid().subscribe({
      next:(count) => {
        this.totalcountUnpaid.set(count)
        this.isLoading.set(false)
      },

      error:(err) => {
        this.error.set('Error loading dashboard data');
        this.error.set(err.message || 'Unknown error');
        this.isLoading.set(false);
      }
    })
  }
}

