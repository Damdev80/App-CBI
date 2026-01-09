import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals para reactividad
  registrations = signal<UsersEvent[]>([]);
  selectedEventId = signal<string | null>(null);
  loading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  // Paginación con signals
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions = [5, 10, 25, 50];
  
  // Modal state con signals
  showPaymentModal = signal<boolean>(false);
  selectedRegistration = signal<UsersEvent | null>(null);
  selectedPaymentInfo = signal<PaymentInfo | null>(null);
  paymentAmount = signal<number>(0);
  wayPay = signal<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');

  // Filtros con signals
  searchTerm = signal<string>('');
  filterPayStatus = signal<'ALL' | 'PAGO' | 'DEBE'>('ALL');

  // Computed signals para filtrado y paginación
  filteredRegistrations = computed(() => {
    let filtered = [...this.registrations()];
    const term = this.searchTerm().toLowerCase();
    const status = this.filterPayStatus();
    const eventId = this.selectedEventId();

    // Filtrar por evento si viene de un enlace directo
    if (eventId) {
      filtered = filtered.filter(reg => reg.eventId === eventId);
    }

    // Filtrar por término de búsqueda
    if (term) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(term) ||
        reg.email.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado de pago
    if (status !== 'ALL') {
      filtered = filtered.filter(reg => reg.payStatus === status);
    }

    return filtered;
  });

  totalPages = computed(() => 
    Math.max(1, Math.ceil(this.filteredRegistrations().length / this.pageSize()))
  );

  paginatedRegistrations = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredRegistrations().slice(startIndex, endIndex);
  });

  // Effect para resetear página cuando cambian los filtros
  private filterEffect = effect(() => {
    // Trigger cuando cambien los filtros
    this.searchTerm();
    this.filterPayStatus();
    this.currentPage.set(1);
  });

  ngOnInit() {
    // Verificar si viene con un eventId en los query params
    this.route.queryParams.subscribe(params => {
      if (params['eventId']) {
        this.selectedEventId.set(params['eventId']);
      }
    });
    
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading.set(true);
    this.usersEventService.getAllRegistrations().subscribe({
      next: (data: UsersEvent[]) => {
        this.registrations.set(data);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading registrations:', error);
        this.errorMessage.set('Error al cargar los registros');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number) {
    const total = this.totalPages();
    if(page >= 1 && page <= total){
      this.currentPage.set(page);
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const total = this.totalPages();
    const current = this.currentPage();

    let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(total, startPage + maxVisiblePages - 1);

    if(endPage - startPage + 1 < maxVisiblePages){
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages; 
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  onFilterChange(value: 'ALL' | 'PAGO' | 'DEBE') {
    this.filterPayStatus.set(value);
  }

  openPaymentModal(registration: UsersEvent) {
    this.selectedRegistration.set(registration);
    this.paymentAmount.set(0);
    this.wayPay.set('EFECTIVO');
    this.showPaymentModal.set(true);
    
    // Cargar información detallada del pago
    this.usersEventService.getPaymentInfo(registration.id).subscribe({
      next: (info: PaymentInfo) => {
        this.selectedPaymentInfo.set(info);
      },
      error: (error: any) => {
        console.error('Error loading payment info:', error);
      }
    });
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.selectedRegistration.set(null);
    this.selectedPaymentInfo.set(null);
    this.paymentAmount.set(0);
  }

  processPayment() {
    const selected = this.selectedRegistration();
    const amount = this.paymentAmount();
    
    if (!selected || amount <= 0) {
      this.errorMessage.set('Ingresa un monto válido');
      return;
    }

    const payment: AddPaymentDto = {
      amount: amount,
      wayPay: this.wayPay()
    };

    this.usersEventService.addPayment(selected.id, payment).subscribe({
      next: (updated: UsersEvent) => {
        this.successMessage.set(`Abono de $${amount.toLocaleString()} registrado exitosamente.`);
        this.loadRegistrations();
        this.closePaymentModal();
        
        setTimeout(() => {
          this.successMessage.set('');
        }, 5000);
      },
      error: (error: any) => {
        this.errorMessage.set('Error al procesar el abono');
        console.error('Error:', error);
      }
    });
  }

  // Método para cambiar el estado de pago directamente
  updatePayStatus(registration: UsersEvent, newStatus: 'PAGO' | 'DEBE') {
    this.usersEventService.updatePayStatus(registration.id, newStatus).subscribe({
      next: () => {
        this.successMessage.set(`Estado actualizado a ${newStatus}`);
        this.loadRegistrations();
        
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        this.errorMessage.set('Error al actualizar el estado');
        console.error('Error:', error);
      }
    });
  }

  deleteRegistration(id: string, name: string) {
    if (confirm(`¿Estás seguro de eliminar la inscripción de ${name}?`)) {
      this.usersEventService.deleteRegistration(id).subscribe({
        next: () => {
          this.successMessage.set('Registro eliminado exitosamente');
          this.loadRegistrations();
          
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.errorMessage.set('Error al eliminar el registro');
          console.error('Error:', error);
        }
      });
    }
  }

  getTotalCollected(): number {
    return this.filteredRegistrations()
      .reduce((sum, reg) => sum + (reg.paymentAmount ?? 0), 0);
  }

  getTotalPaid(): number {
    return this.filteredRegistrations()
      .filter(reg => reg.payStatus === 'PAGO')
      .length;
  }

  navigateToNewRegistration() {
    this.router.navigate(['/dashboard/event-registration']);
  }
}