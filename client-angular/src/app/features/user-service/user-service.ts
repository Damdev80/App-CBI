import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserServiceService } from '@app/core/services/user-service.service';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { StudentGroupsService } from '@app/core/services/student-groups.service';
import { UserServiceSocial, Teacher, StudentGroup } from '@app/shared/models/service-social.model';

@Component({
  selector: 'app-user-service',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-service.html',
})

export class UserServiceComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserServiceService);
  private teacherService = inject(TeacherServiceService);
  private studentGroupsService = inject(StudentGroupsService);

  teacher = signal<Teacher | null>(null);
  teachers = signal<Teacher[]>([]);
  groups = signal<StudentGroup[]>([]);
  users = signal<UserServiceSocial[]>([]);
  loading = signal(true);
  showForm = signal(false);
  showGroupForm = signal(false);
  newGroupName = '';
  newGroupNumber = '';
  saving = signal(false);
  error = signal('');
  success = signal('');
  teacherId = signal<string | null>(null);

  newName = '';
  newNumber = '';
  newGender: 'MASCULINO' | 'FEMENINO' = 'MASCULINO';
  newDocuments = '';
  newGroupId = '';
  selectedTeacherId = '';
  selectedTeacherIds: string[] = [];
  query = '';

  // Computed statistics
  totalUsers = computed(() => this.users().length);
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
      if (tid) this.selectedTeacherIds = [tid];
      this.loadData();
    });
  }

  loadTeachers() {
    this.teacherService.getAll().subscribe({
      next: (data) => this.teachers.set(data),
    });
  }

  loadGroups(teacherId?: string) {
    this.studentGroupsService.getAll(teacherId).subscribe({
      next: (data) => this.groups.set(data),
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
      this.loadGroups(tid);
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
    this.loadGroups();
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
    const teacherIds = this.selectedTeacherIds.length > 0
      ? this.selectedTeacherIds
      : (tid ? [tid] : []);
    if (teacherIds.length === 0) {
      this.error.set('Selecciona al menos un profesor.');
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
        teacherIds,
        Gender: this.newGender,
        Documents: this.newDocuments || undefined,
        groupId: this.newGroupId || undefined,
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

  openForm() {
    const tid = this.teacherId();
    if (tid) this.selectedTeacherIds = [tid];
    else this.selectedTeacherIds = [];
    this.loadGroups(tid || undefined);
    this.showForm.set(true);
  }

  goBack() {
    this.router.navigate(['/dashboard/profesores']);
  }

  addGroup() {
    const tid = this.selectedTeacherId || this.teacherId();
    if (!this.newGroupName.trim()) {
      this.error.set('El nombre del grupo es obligatorio.');
      return;
    }
    this.studentGroupsService
      .create({ name: this.newGroupName.trim(), number: this.newGroupNumber.trim() || undefined, teacherId: tid || undefined })
      .subscribe({
        next: () => {
          this.loadGroups(tid || undefined);
          this.newGroupName = '';
          this.newGroupNumber = '';
          this.showGroupForm.set(false);
          this.success.set('Grupo creado.');
        },
        error: () => this.error.set('No se pudo crear el grupo.'),
      });
  }

  resetForm() {
    this.newName = '';
    this.newNumber = '';
    this.newGender = 'MASCULINO';
    this.newDocuments = '';
    this.newGroupId = '';
    if (!this.teacherId()) this.selectedTeacherId = '';
    this.selectedTeacherIds = [];
    this.showForm.set(false);
  }

  toggleTeacherSelection(teacherId: string) {
    const idx = this.selectedTeacherIds.indexOf(teacherId);
    if (idx >= 0) {
      this.selectedTeacherIds = this.selectedTeacherIds.filter((id) => id !== teacherId);
    } else {
      this.selectedTeacherIds = [...this.selectedTeacherIds, teacherId];
    }
    this.loadGroups(this.selectedTeacherIds[0] || this.teacherId() || undefined);
  }

  isTeacherSelected(teacherId: string): boolean {
    return this.selectedTeacherIds.includes(teacherId);
  }
}
