import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '@app/core/services/user-service.service';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { UserServiceSocial, Teacher } from '@app/shared/models/service-social.model';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-user-service',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, InputTextModule, ButtonModule, SelectModule,
    TagModule, TableModule, CheckboxModule, ProgressSpinnerModule
  ],
  templateUrl: './user-service.html',
})
export class UserService {
  private userService = inject(UserServiceService);
  private teacherService = inject(TeacherServiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  users = signal<UserServiceSocial[]>([]);
  teacher = signal<Teacher | null>(null);
  teachers = signal<Teacher[]>([]);
  loading = signal(true);
  showForm = signal(false);
  teacherId = signal<string | null>(null);

  newName = '';
  newNumber = '';
  newGender: 'MASCULINO' | 'FEMENINO' = 'MASCULINO';
  newDocuments = '';
  selectedTeacherId = '';

  // PrimeNG select options
  genderSelectOptions = [
    { label: 'Masculino', value: 'MASCULINO' },
    { label: 'Femenino', value: 'FEMENINO' }
  ];
  teacherSelectOptions: { label: string; value: string }[] = [];

  // Computed statistics
  totalUsers = computed(() => this.users().length);
  presentToday = computed(() => this.users().filter(u => u.attendance).length);
  goingToCamp = computed(() => this.users().filter(u => u.GoToCampement).length);

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
      next: (data) => {
        this.teachers.set(data);
        this.teacherSelectOptions = data.map(t => ({ label: t.name, value: t.id }));
      },
    });
  }

  loadData() {
    this.loading.set(true);
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
        error: () => this.loading.set(false),
      });
    } else {
      this.userService.getAll().subscribe({
        next: (data) => {
          this.users.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  addUser() {
    const tid = this.selectedTeacherId || this.teacherId();
    if (!this.newName.trim() || !tid) return;

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
          this.resetForm();
          this.loadData();
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
    });
  }

  deleteUser(id: string) {
    this.userService.delete(id).subscribe({
      next: () => this.loadData(),
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
