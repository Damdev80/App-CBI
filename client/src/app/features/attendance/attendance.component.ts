import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { AttendanceService } from '@app/core/services/attendance.service';
import { MoneyCollectionService } from '@app/core/services/money-collection.service';
import {
  Teacher,
  AttendanceRecordDto,
  MoneyCollection,
} from '@app/shared/models/service-social.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance.component.html',
})
export class AttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teacherService = inject(TeacherServiceService);
  private attendanceService = inject(AttendanceService);
  private moneyCollectionService = inject(MoneyCollectionService);

  teachers = signal<Teacher[]>([]);
  selectedTeacherId = signal<string | null>(null);
  selectedDate = signal<string>('');
  records = signal<AttendanceRecordDto[]>([]);
  collections = signal<MoneyCollection[]>([]);
  totalCollected = signal<number>(0);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');
  showMoneyModal = signal(false);
  showReportView = signal(false);
  history = signal<{ date: string; present: string[]; absent: string[]; students: { id: string; name: string; present: boolean; group: { id: string; name: string } | null }[] }[]>([]);
  absenceCounts = signal<{ studentId: string; name: string; absenceCount: number; hasWarning: boolean }[]>([]);
  reportLoading = signal(false);
  reportError = signal('');

  newCollectionAmount = 0;
  newCollectionNotes = '';
  selectedStudentForCollection = '';
  studentNameForPayment = '';

  summary = computed(() => {
    const r = this.records();
    const total = r.length;
    const present = r.filter((x) => x.present).length;
    return { total, present, absent: total - present };
  });

  hasWarning = (studentId: string): boolean => {
    const ac = this.absenceCounts().find((x) => x.studentId === studentId);
    return ac ? ac.hasWarning : false;
  };

  absenceCountsWithWarning = computed(() =>
    this.absenceCounts().filter((a) => a.hasWarning)
  );

  /** Total abonado por alumno (este mes) */
  amountByStudent = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.collections()) {
      const id = c.studentId;
      map.set(id, (map.get(id) ?? 0) + c.amount);
    }
    return map;
  });

  /** Obtener el domingo de la semana para la fecha dada */
  getSundayFor(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }

  ngOnInit() {
    this.selectedDate.set(this.getSundayFor(new Date()));

    this.teacherService.getAll().subscribe({
      next: (t) => this.teachers.set(t),
    });

    this.route.queryParams.subscribe((params) => {
      const tid = params['teacherId'] || null;
      this.selectedTeacherId.set(tid);
      this.loadData();
    });
  }

  loadData() {
    const tid = this.selectedTeacherId();
    const date = this.selectedDate();
    if (!tid || !date) {
      this.records.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.attendanceService.getByDateAndTeacher(date, tid).subscribe({
      next: (r) => {
        this.records.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la asistencia.');
      },
    });

    this.attendanceService.getAbsenceCounts(tid).subscribe({
      next: (a) => this.absenceCounts.set(a),
    });

    const [year, month] = date.split('-').map(Number);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    this.moneyCollectionService.findAll({
      teacherId: tid,
      from,
      to,
    }).subscribe({
      next: (c) => this.collections.set(c),
    });

    this.moneyCollectionService.getTotal({ teacherId: tid, from, to }).subscribe({
      next: (total) => this.totalCollected.set(total),
    });
  }

  onTeacherChange(id: string) {
    this.selectedTeacherId.set(id || null);
    this.router.navigate([], {
      queryParams: { teacherId: id || undefined },
      queryParamsHandling: 'merge',
    });
    this.loadData();
  }

  onDateChange(date: string) {
    const d = new Date(date + 'T12:00:00');
    if (d.getDay() !== 0) {
      // Ajustar al domingo de esa semana
      const diff = d.getDate() - d.getDay();
      d.setDate(diff);
      const sunday = d.toISOString().slice(0, 10);
      this.selectedDate.set(sunday);
      this.error.set('Solo se puede pasar lista los domingos. Se ajustó al domingo correspondiente.');
    } else {
      this.error.set('');
      this.selectedDate.set(date);
    }
    this.loadData();
  }

  togglePresent(record: AttendanceRecordDto) {
    this.records.update((list) =>
      list.map((r) =>
        r.id === record.id ? { ...r, present: !r.present } : r
      )
    );
  }

  isSunday(dateStr: string): boolean {
    return new Date(dateStr + 'T12:00:00').getDay() === 0;
  }

  saveAttendance() {
    const tid = this.selectedTeacherId();
    const date = this.selectedDate();
    const recs = this.records();

    if (!tid || !date || recs.length === 0) {
      this.error.set('Selecciona profesor y fecha con alumnos.');
      return;
    }
    if (!this.isSunday(date)) {
      this.error.set('Solo se puede pasar lista los domingos.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.attendanceService
      .upsertBulk(
        date,
        tid,
        recs.map((r) => ({ studentId: r.id, present: r.present }))
      )
      .subscribe({
        next: () => {
          this.success.set('Asistencia guardada correctamente.');
          this.loadData();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar la asistencia.');
        },
      });
  }

  openPayForStudent(record: AttendanceRecordDto) {
    this.selectedStudentForCollection = record.id;
    this.studentNameForPayment = record.name;
    this.newCollectionAmount = 0;
    this.newCollectionNotes = '';
    this.showMoneyModal.set(true);
  }

  saveCollection() {
    const date = this.selectedDate();
    if (!this.selectedStudentForCollection || !date || this.newCollectionAmount <= 0) {
      this.error.set('Selecciona un alumno y un monto mayor a 0.');
      return;
    }

    this.saving.set(true);
    this.moneyCollectionService
      .create({
        date,
        amount: this.newCollectionAmount,
        studentId: this.selectedStudentForCollection,
        notes: this.newCollectionNotes || undefined,
      })
      .subscribe({
        next: (created) => {
          this.success.set('Recolección registrada.');

          if (created?.id) {
            this.downloadInvoiceForCollection(created.id, created.invoice?.invoiceFileName);
          }

          this.showMoneyModal.set(false);
          this.loadData();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo registrar la recolección.');
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

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(n);
  }

  formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/profesores']);
  }

  loadReport() {
    const tid = this.selectedTeacherId();
    if (!tid) {
      this.reportError.set('Selecciona un profesor para ver reportes.');
      return;
    }
    this.reportError.set('');
    this.reportLoading.set(true);
    this.attendanceService.getHistory(tid).subscribe({
      next: (h) => {
        this.history.set(h);
        this.reportLoading.set(false);
      },
      error: (err) => {
        this.reportError.set(err?.error?.message || 'No se pudo cargar el historial.');
        this.reportLoading.set(false);
      },
    });
    this.attendanceService.getAbsenceCounts(tid).subscribe({
      next: (a) => this.absenceCounts.set(a),
      error: () => {
        if (!this.reportError()) this.reportError.set('No se pudo cargar el conteo de fallas.');
      },
    });
  }

  openReportView() {
    this.showReportView.set(true);
    this.reportError.set('');
    this.loadReport();
  }
}
