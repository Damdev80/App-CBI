import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersEventService } from '../../core/services/users-event.services';
import { UsersEvent, PaymentInfo, AddPaymentDto } from '../../shared/models/userEvent.model';

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
  paginatedRegistrations: UsersEvent[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';

  //paginacion 
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Modal state
  showPaymentModal = false;
  selectedRegistration: UsersEvent | null = null;
  selectedPaymentInfo: PaymentInfo | null = null;
  paymentAmount = 0;
  wayPay: 'EFECTIVO' | 'TRANSFERENCIA' = 'EFECTIVO';

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
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredRegistrations.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if(page >= 1 && page <= this.totalPages){
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if(endPage - startPage + 1 < maxVisiblePages){
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages; 
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
    this.wayPay = 'EFECTIVO';
    this.showPaymentModal = true;
    
    // Cargar información detallada del pago
    this.usersEventService.getPaymentInfo(registration.id).subscribe({
      next: (info: PaymentInfo) => {
        this.selectedPaymentInfo = info;
      },
      error: (error: any) => {
        console.error('Error loading payment info:', error);
      }
    });
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedRegistration = null;
    this.selectedPaymentInfo = null;
    this.paymentAmount = 0;
  }

  processPayment() {
    if (!this.selectedRegistration || this.paymentAmount <= 0) {
      this.errorMessage = 'Ingresa un monto válido';
      return;
    }

    const payment: AddPaymentDto = {
      amount: this.paymentAmount,
      wayPay: this.wayPay
    };

    this.usersEventService.addPayment(this.selectedRegistration.id, payment).subscribe({
      next: (updated: UsersEvent) => {
        const isPaid = updated.payStatus === 'PAGO';
        this.successMessage = `Abono de $${this.paymentAmount.toLocaleString()} registrado. ${isPaid ? '¡Pago completado!' : 'Aún hay saldo pendiente.'}`;
        this.loadRegistrations();
        this.closePaymentModal();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al procesar el abono';
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

  // Calcular precio final del evento (con descuento si aplica)
  calculateFinalPrice(registration: UsersEvent): number {
    const eventPrice = registration.event?.price ?? 0;
    const discount = 10000;
    return registration.hasSiblings ? eventPrice - discount : eventPrice;
  }

  // Calcular monto pendiente
  getAmountRemaining(registration: UsersEvent): number {
    const finalPrice = this.calculateFinalPrice(registration);
    return Math.max(0, finalPrice - registration.paymentAmount);
  }

  getTotalCollected(): number {
    return this.filteredRegistrations
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