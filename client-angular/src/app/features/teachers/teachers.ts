import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeacherServiceService } from '@app/core/services/teacher-service.service';
import { Teacher } from '@app/shared/models/service-social.model';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teachers.html',
})
export class TeachersComponent {
  private teacherService = inject(TeacherServiceService);
  private router = inject(Router);

  teachers = signal<Teacher[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');

  query = '';
  showForm = signal(false);

  newName = '';
  newNumber = '';

  filteredTeachers = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.teachers();
    if (!q) return list;
    return list.filter((t) => {
      const name = (t.name ?? '').toLowerCase();
      const num = (t.number ?? '').toLowerCase();
      return name.includes(q) || num.includes(q);
    });
  });

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.loading.set(true);
    this.error.set('');
    this.teacherService.getAll().subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los profesores.');
      },
    });
  }

  addTeacher() {
    if (!this.newName.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.teacherService
      .create({
        name: this.newName,
        number: this.newNumber || undefined,
      })
      .subscribe({
        next: () => {
          this.success.set('Profesor agregado correctamente.');
          this.resetForm();
          this.loadTeachers();
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo agregar el profesor.');
        },
      });
  }

  deleteTeacher(id: string) {
    this.error.set('');
    this.success.set('');
    this.teacherService.delete(id).subscribe({
      next: () => {
        this.success.set('Profesor eliminado.');
        this.loadTeachers();
      },
      error: () => this.error.set('No se pudo eliminar el profesor.'),
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
