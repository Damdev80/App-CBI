import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoneyCollectionService } from '@app/core/services/money-collection.service';
import { StudentGroupsService } from '@app/core/services/student-groups.service';
import {
  MoneyCollection,
  StudentDebtStatus,
  StudentGroup,
} from '@app/shared/models/service-social.model';

@Component({
  selector: 'app-finanzas-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas-dashboard.component.html',
})
export class FinanzasDashboardComponent {
  private moneyCollectionService = inject(MoneyCollectionService);
  private studentGroupsService = inject(StudentGroupsService);
  private readonly initialRange = this.getCurrentMonthRange();
  private readonly minExpectedAmount = 1;

  expectedAmount = signal<number>(280000);
  selectedGroupId = signal<string>('');
  periodFrom = signal<string>(this.initialRange.from);
  periodTo = signal<string>(this.initialRange.to);
  searchQuery = signal<string>('');
  loading = signal<boolean>(false);
  movementsLoading = signal<boolean>(false);
  error = signal<string>('');
  success = signal<string>('');

  showPaymentModal = signal<boolean>(false);
  showMovementsModal = signal<boolean>(false);
  paymentSaving = signal<boolean>(false);
  paymentError = signal<string>('');
  paymentStudentId = signal<string>('');
  paymentStudentName = signal<string>('');
  paymentDate = signal<string>(this.toIsoDate(new Date()));
  paymentAmount = signal<number>(0);
  paymentNotes = signal<string>('');

  pageSize = signal<number>(10);
  debtPage = signal<number>(1);
  movementsPage = signal<number>(1);

  groups = signal<StudentGroup[]>([]);
  debtStatus = signal<StudentDebtStatus[]>([]);
  collections = signal<MoneyCollection[]>([]);
  totalCollected = signal<number>(0);

  filteredDebtStatus = computed(() => {
    const q = this.normalizeText(this.searchQuery());
    if (!q) return this.debtStatus();

    return this.debtStatus().filter((row) => {
      return (
        this.normalizeText(row.name).includes(q) ||
        this.normalizeText(row.number || '').includes(q) ||
        this.normalizeText(row.group?.name || '').includes(q) ||
        this.normalizeText(row.status).includes(q)
      );
    });
  });

  filteredCollections = computed(() => {
    const q = this.normalizeText(this.searchQuery());
    if (!q) return this.collections();

    return this.collections().filter((movement) => {
      return (
        this.normalizeText(movement.student?.name || '').includes(q) ||
        this.normalizeText(movement.student?.number || '').includes(q) ||
        this.normalizeText(movement.student?.group?.name || '').includes(q) ||
        this.normalizeText(movement.notes || '').includes(q)
      );
    });
  });

  debtTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDebtStatus().length / this.pageSize())),
  );

  movementsTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCollections().length / this.pageSize())),
  );

  currentDebtPage = computed(() => Math.min(this.debtPage(), this.debtTotalPages()));
  currentMovementsPage = computed(() =>
    Math.min(this.movementsPage(), this.movementsTotalPages()),
  );

  paginatedDebtStatus = computed(() => {
    const size = this.pageSize();
    const page = this.currentDebtPage();
    const start = (page - 1) * size;
    return this.filteredDebtStatus().slice(start, start + size);
  });

  paginatedCollections = computed(() => {
    const size = this.pageSize();
    const page = this.currentMovementsPage();
    const start = (page - 1) * size;
    return this.filteredCollections().slice(start, start + size);
  });

  morosos = computed(() => this.debtStatus().filter((s) => s.status === 'DEBE'));
  paidCount = computed(() => this.debtStatus().filter((s) => s.status === 'PAGO').length);
  totalDebt = computed(() =>
    this.debtStatus().reduce((sum, student) => sum + (student.debt || 0), 0),
  );
  movementsCount = computed(() => this.collections().length);
  filteredMovementsCount = computed(() => this.filteredCollections().length);
  averageTicket = computed(() => {
    const count = this.movementsCount();
    if (count === 0) return 0;
    return this.totalCollected() / count;
  });

  ngOnInit() {
    this.studentGroupsService.getAll().subscribe({
      next: (groups) => this.groups.set(groups || []),
      error: () => this.groups.set([]),
    });
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.movementsLoading.set(true);
    this.error.set('');
    this.debtPage.set(1);
    this.movementsPage.set(1);

    const groupId = this.selectedGroupId() || undefined;
    const expectedAmount = this.getNormalizedExpectedAmount();
    const from = this.periodFrom() || undefined;
    const to = this.periodTo() || undefined;

    this.moneyCollectionService
      .getDebtStatus({
        expectedAmount,
        groupId,
      })
      .subscribe({
        next: (status) => {
          this.debtStatus.set(status || []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el estado de deuda.');
          this.loading.set(false);
        },
      });

    this.moneyCollectionService.getTotal({ groupId, from, to }).subscribe({
      next: (value) => this.totalCollected.set(value ?? 0),
      error: () => this.totalCollected.set(0),
    });

    this.moneyCollectionService.findAll({ groupId, from, to }).subscribe({
      next: (rows) => {
        this.collections.set(rows || []);
        this.movementsLoading.set(false);
      },
      error: () => {
        this.collections.set([]);
        this.movementsLoading.set(false);
      },
    });
  }

  onDateRangeChange() {
    const from = this.periodFrom();
    const to = this.periodTo();

    if (from && to && from > to) {
      this.periodTo.set(from);
    }

    this.loadData();
  }

  setExpectedAmount(value: unknown) {
    const raw = this.toNumber(value);
    this.expectedAmount.set(Math.max(this.minExpectedAmount, Math.round(raw)));
  }

  resetFilters() {
    const range = this.getCurrentMonthRange();
    this.searchQuery.set('');
    this.selectedGroupId.set('');
    this.periodFrom.set(range.from);
    this.periodTo.set(range.to);
    this.pageSize.set(10);
    this.debtPage.set(1);
    this.movementsPage.set(1);
    this.loadData();
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value || '');
    this.debtPage.set(1);
    this.movementsPage.set(1);
  }

  onPageSizeChange(value: unknown) {
    const nextSize = Math.max(1, Math.trunc(this.toNumber(value) || 10));
    this.pageSize.set(nextSize);
    this.debtPage.set(1);
    this.movementsPage.set(1);
  }

  prevDebtPage() {
    this.debtPage.set(Math.max(1, this.currentDebtPage() - 1));
  }

  nextDebtPage() {
    this.debtPage.set(Math.min(this.debtTotalPages(), this.currentDebtPage() + 1));
  }

  prevMovementsPage() {
    this.movementsPage.set(Math.max(1, this.currentMovementsPage() - 1));
  }

  nextMovementsPage() {
    this.movementsPage.set(
      Math.min(this.movementsTotalPages(), this.currentMovementsPage() + 1),
    );
  }

  openMovementsModal() {
    this.showMovementsModal.set(true);
  }

  closeMovementsModal() {
    this.showMovementsModal.set(false);
  }

  openPaymentModal(student?: StudentDebtStatus) {
    this.paymentError.set('');
    this.paymentDate.set(this.toIsoDate(new Date()));
    this.paymentNotes.set('');

    if (student) {
      this.paymentStudentId.set(student.studentId);
      this.paymentStudentName.set(student.name);
      this.paymentAmount.set(student.debt > 0 ? student.debt : 0);
    } else {
      const first = this.filteredDebtStatus()[0] || this.debtStatus()[0];
      this.paymentStudentId.set(first?.studentId || '');
      this.paymentStudentName.set(first?.name || '');
      this.paymentAmount.set(0);
    }

    this.showPaymentModal.set(true);
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
    this.paymentSaving.set(false);
    this.paymentError.set('');
    this.paymentAmount.set(0);
    this.paymentNotes.set('');
  }

  onPaymentStudentChange(studentId: string) {
    this.paymentStudentId.set(studentId);
    const selected = this.debtStatus().find((student) => student.studentId === studentId);
    this.paymentStudentName.set(selected?.name || '');
  }

  savePayment() {
    if (!this.paymentStudentId()) {
      this.paymentError.set('Selecciona un estudiante.');
      return;
    }

    if (this.paymentAmount() <= 0) {
      this.paymentError.set('Ingresa un monto mayor a 0.');
      return;
    }

    this.paymentSaving.set(true);
    this.paymentError.set('');
    this.error.set('');

    this.moneyCollectionService
      .create({
        date: this.paymentDate(),
        amount: this.paymentAmount(),
        studentId: this.paymentStudentId(),
        notes: this.paymentNotes().trim() || undefined,
        targetAmount: this.expectedAmount(),
      })
      .subscribe({
        next: (created) => {
          this.paymentSaving.set(false);
          this.success.set(`Pago registrado para ${this.paymentStudentName()}.`);

          if (created?.id) {
            this.downloadInvoiceForCollection(created.id, created.invoice?.invoiceFileName);
          }

          this.closePaymentModal();
          this.loadData();
        },
        error: () => {
          this.paymentSaving.set(false);
          this.paymentError.set('No se pudo registrar el pago.');
        },
      });
  }

  private downloadInvoiceForCollection(collectionId: string, fileName?: string) {
    this.moneyCollectionService.downloadInvoice(collectionId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName || `factura-${collectionId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.error.set('Pago registrado, pero no se pudo descargar la factura.');
      },
    });
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  recalculateStatus() {
    this.moneyCollectionService
      .recalculatePayStatus({
        expectedAmount: this.getNormalizedExpectedAmount(),
        groupId: this.selectedGroupId() || undefined,
      })
      .subscribe({
        next: () => {
          this.success.set('Estado de pagos recalculado correctamente.');
          this.loadData();
        },
        error: () => (this.error.set('No se pudo recalcular el estado de pagos.')),
      });
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getNormalizedExpectedAmount(): number {
    return Math.max(this.minExpectedAmount, Math.round(this.expectedAmount()));
  }

  private getCurrentMonthRange() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      from: this.toIsoDate(from),
      to: this.toIsoDate(to),
    };
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
