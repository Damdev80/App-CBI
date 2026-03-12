import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { Teacher } from '@app/shared/models/service-social.model';
<<<<<<< HEAD
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
=======
>>>>>>> 269214b (feat: add teachers and user service management)

@Component({
  selector: 'app-teachers',
  standalone: true,
<<<<<<< HEAD
  imports: [
    CommonModule, FormsModule,
    CardModule, InputTextModule, ButtonModule, TagModule, ProgressSpinnerModule
  ],
=======
  imports: [CommonModule, FormsModule],
>>>>>>> 269214b (feat: add teachers and user service management)
  templateUrl: './teachers.html',
})
export class TeachersComponent {
  private teacherService = inject(TeacherServiceService);
  private router = inject(Router);

  teachers = signal<Teacher[]>([]);
  loading = signal(true);
  showForm = signal(false);

  newName = '';
  newNumber = '';

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.loading.set(true);
    this.teacherService.getAll().subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addTeacher() {
    if (!this.newName.trim()) return;

    this.teacherService
      .create({
        name: this.newName,
        number: this.newNumber || undefined,
      })
      .subscribe({
        next: () => {
          this.resetForm();
          this.loadTeachers();
        },
      });
  }

  deleteTeacher(id: string) {
    this.teacherService.delete(id).subscribe({
      next: () => this.loadTeachers(),
    });
  }

  viewStudents(teacherId: string) {
    this.router.navigate(['/dashboard/servicio-social'], {
      queryParams: { teacherId },
    });
  }

  resetForm() {
    this.newName = '';
    this.newNumber = '';
    this.showForm.set(false);
  }
}
