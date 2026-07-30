import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VisitorsService, type Visitor } from '@app/core/services/visitors.service';

@Component({
  selector: 'app-visitantes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visitantes.component.html',
})
export class VisitantesComponent {
  private fb = inject(FormBuilder);
  private visitorsService = inject(VisitorsService);

  loading = signal(false);
  submitting = signal(false);
  success = signal('');
  error = signal('');
  visitors = signal<Visitor[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    dateBorn: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(7)]],
  });

  constructor() {
    this.loadVisitors();
  }

  loadVisitors() {
    this.loading.set(true);
    this.visitorsService.list().subscribe({
      next: (data) => {
        this.visitors.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de visitantes.');
        this.loading.set(false);
      },
    });
  }

  submit() {
    this.success.set('');
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error.set('Completa todos los campos requeridos.');
      return;
    }

    this.submitting.set(true);
    const data = this.form.getRawValue();
    this.visitorsService.create(data).subscribe({
      next: (created) => {
        this.visitors.update((prev) => [created, ...prev]);
        this.success.set('Visitante registrado correctamente.');
        this.form.reset({ name: '', dateBorn: '', phone: '' });
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('No se pudo guardar el visitante.');
        this.submitting.set(false);
      },
    });
  }
}
