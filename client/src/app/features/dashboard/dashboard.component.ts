import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  totalBautized = signal<number>(0);
  totalWomenRegistered = signal<number>(0);
  totalcountUnpaid = signal<number>(0);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.LoadDashboardDataUser();
    this.LoadDashboardBautized();
    this.LoadDashboardWomenRegistered();
    this.LoadDahboardcountUnpaid();
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

