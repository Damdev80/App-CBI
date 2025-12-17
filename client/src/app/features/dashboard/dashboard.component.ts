import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatCardComponent } from '@app/shared/components/dashboard-cards/stat-card.component';
import { DashboardEventService } from '@app/core/services/dashboard-event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private dashboardEventService = inject(DashboardEventService);

  totalUsers = signal<number>(0);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.LoadDashboardData();
  }

  LoadDashboardData(){
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
}
