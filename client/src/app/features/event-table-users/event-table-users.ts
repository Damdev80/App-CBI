import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersEventService } from '../../core/services/users-event.services';
import { UsersEvent } from '../../shared/models/userEvent.model';

@Component({
  selector: 'app-event-registration-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-registration-list.component.html',
})
export class EventRegistrationListComponent implements OnInit {
  private usersEventService = inject(UsersEventService);

  registrations: UsersEvent[] = [];
  filteredRegistrations: UsersEvent[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  
  // Modal state
  showPaymentModal = false;
  selectedRegistration: UsersEvent | null = null;
  paymentAmount = 0;

  // Filtros
  searchTerm = '';
  filterPayStatus: 'ALL' | 'PAGO' | 'DEBE' = 'ALL';

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading = true;
    this.usersEventService.getAllRegistrations().subscribe({
      next: (data: UsersEvent[]) => {
        this.registrations = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading registrations:', error);
        this.errorMessage = 'Error al cargar los registros';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.registrations];

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(term) ||
        reg.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado de pago
    if (this.filterPayStatus !== 'ALL') {
      filtered = filtered.filter(reg => reg.payStatus === this.filterPayStatus);
    }

    this.filteredRegistrations = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openPaymentModal(registration: UsersEvent) {
    this.selectedRegistration = registration;
    this.paymentAmount = 0;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedRegistration = null;
    this.paymentAmount = 0;
  }

  processPayment() {
    if (!this.selectedRegistration || this.paymentAmount <= 0) {
      this.errorMessage = 'Ingresa un monto válido';
      return;
    }

    const currentAmount = this.selectedRegistration.paymentAmount ?? 0;
    const newAmount = currentAmount - this.paymentAmount;
    const newStatus = newAmount <= 0 ? 'PAGO' : 'DEBE';

    this.usersEventService.updateRegistration(
      this.selectedRegistration.id,
      {
        paymentAmount: Math.max(0, newAmount),
        payStatus: newStatus
      }
    ).subscribe({
      next: (updated: UsersEvent) => {
        this.successMessage = `Pago registrado exitosamente. ${newStatus === 'PAGO' ? '¡Completado!' : `Pendiente: $${newAmount.toFixed(2)}`}`;
        this.loadRegistrations();
        this.closePaymentModal();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al procesar el pago';
        console.error('Error:', error);
      }
    });
  }

  deleteRegistration(id: string, name: string) {
    if (confirm(`¿Estás seguro de eliminar la inscripción de ${name}?`)) {
      this.usersEventService.deleteRegistration(id).subscribe({
        next: () => {
          this.successMessage = 'Registro eliminado exitosamente';
          this.loadRegistrations();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al eliminar el registro';
          console.error('Error:', error);
        }
      });
    }
  }

  getTotalDebt(): number {
    return this.filteredRegistrations
      .filter(reg => reg.payStatus === 'DEBE')
      .reduce((sum, reg) => sum + (reg.paymentAmount ?? 0), 0);
  }

  getTotalPaid(): number {
    return this.filteredRegistrations
      .filter(reg => reg.payStatus === 'PAGO')
      .length;
  }

  getTotalPending(): number {
    return this.filteredRegistrations
      .filter(reg => reg.payStatus === 'DEBE')
      .length;
  }
}