import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '@app/core/services/user-service.service';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { UserServiceSocial, Teacher } from '@app/shared/models/service-social.model';

@Component({
  selector: 'app-user-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-service.html',
})

export class UserServiceComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserServiceService);
  private teacherService = inject(TeacherServiceService);

  teacher = signal<Teacher | null>(null);
  teachers = signal<Teacher[]>([]);
  users = signal<UserServiceSocial[]>([]);
  loading = signal(true);
  showForm = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  teacherId = signal<string | null>(null);

  newName = '';
  newNumber = '';
  newGender: 'MASCULINO' | 'FEMENINO' = 'MASCULINO';
  newDocuments = '';
  selectedTeacherId = '';
  query = '';

  // Computed statistics
  totalUsers = computed(() => this.users().length);
  presentToday = computed(() => this.users().filter((u) => u.attendance).length);
  goingToCamp = computed(() => this.users().filter((u) => u.GoToCampement).length);
  unpaidCount = computed(() => this.users().filter((u) => u.payGotoCampement === 'DEBE').length);

  filteredUsers = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter((u) => {
      const name = (u.name ?? '').toLowerCase();
      const num = (u.number ?? '').toLowerCase();
      const docs = (u.Documents ?? '').toLowerCase();
      return name.includes(q) || num.includes(q) || docs.includes(q);
    });
  });

  ngOnInit() {
    this.loadTeachers();
    this.route.queryParams.subscribe((params) => {
      const tid = params['teacherId'] ?? null;
      this.teacherId.set(tid);
      this.selectedTeacherId = tid || '';
      this.loadData();
    });
  }

  loadTeachers() {
    this.teacherService.getAll().subscribe({
      next: (data) => this.teachers.set(data),
    });
  }

  loadData() {
    this.loading.set(true);
    this.error.set('');
    const tid = this.teacherId();

    if (tid) {
      this.teacherService.getById(tid).subscribe({
        next: (t) => this.teacher.set(t),
      });
      this.userService.getByTeacher(tid).subscribe({
        next: (data) => {
          this.users.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudieron cargar los alumnos.');
        },
      });
      return;
    }

    this.teacher.set(null);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los alumnos.');
      },
    });
  }

  addUser() {
    const tid = this.selectedTeacherId || this.teacherId();
    if (!tid) {
      this.error.set('Selecciona un profesor.');
      return;
    }
    if (!this.newName.trim()) {
      this.error.set('El nombre del alumno es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.userService
      .create({
        name: this.newName,
        number: this.newNumber || undefined,
        teacherId: tid,
        Gender: this.newGender,
        Documents: this.newDocuments || undefined,
      })
      .subscribe({
        next: () => {
          this.success.set('Alumno agregado correctamente.');
          this.resetForm();
          this.loadData();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo agregar el alumno.');
        },
      });
  }

  toggleAttendance(id: string) {
    this.userService.toggleAttendance(id).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((u) => (u.id === updated.id ? updated : u)),
        );
      },
      error: () => this.error.set('No se pudo actualizar la asistencia.'),
    });
  }

  togglePayment(user: UserServiceSocial) {
    const newStatus = user.payGotoCampement === 'PAGO' ? 'DEBE' : 'PAGO';
    this.userService.update(user.id, { payGotoCampement: newStatus } as any).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((u) => (u.id === updated.id ? updated : u)),
        );
      },
      error: () => this.error.set('No se pudo actualizar el pago.'),
    });
  }

  deleteUser(id: string) {
    this.userService.delete(id).subscribe({
      next: () => {
        this.success.set('Alumno eliminado.');
        this.loadData();
      },
      error: () => this.error.set('No se pudo eliminar el alumno.'),
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/profesores']);
  }

  resetForm() {
    this.newName = '';
    this.newNumber = '';
    this.newGender = 'MASCULINO';
    this.newDocuments = '';
    if (!this.teacherId()) this.selectedTeacherId = '';
    this.showForm.set(false);
  }
}
