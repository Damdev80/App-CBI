import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '@app/core/services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-[1000px] mx-auto px-4 sm:px-6 fade-up">
      <div class="mb-6 pb-5 border-b border-line">
        <p class="text-[0.6875rem] font-semibold tracking-wider uppercase text-ink-3 mb-1">Administración</p>
        <h1 class="font-serif text-2xl sm:text-[2.25rem] font-semibold text-ink tracking-tight m-0" style="font-family: var(--serif);">
          Panel de administración
        </h1>
        <p class="text-sm text-ink-2 mt-1">Gestiona usuarios, restablece contraseñas (por defecto 12345678) y activa/desactiva cuentas.</p>
      </div>

      @if (error()) {
        <div class="alert alert-err mb-4">{{ error() }}</div>
      }
      @if (success()) {
        <div class="alert alert-ok mb-4">{{ success() }}</div>
      }

      <!-- Stats -->
      @if (stats()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="card py-4 px-4">
            <p class="text-2xl font-bold text-ink m-0">{{ stats()!.total }}</p>
            <p class="text-xs text-ink-3 m-0">Usuarios totales</p>
          </div>
          <div class="card py-4 px-4">
            <p class="text-2xl font-bold m-0" style="color: var(--ok);">{{ stats()!.active }}</p>
            <p class="text-xs text-ink-3 m-0">Activos</p>
          </div>
          <div class="card py-4 px-4">
            <p class="text-2xl font-bold text-ink-3 m-0">{{ stats()!.inactive }}</p>
            <p class="text-xs text-ink-3 m-0">Inactivos</p>
          </div>
          <div class="card py-4 px-4">
            <p class="text-2xl font-bold m-0" style="color: var(--accent);">{{ stats()!.admins }}</p>
            <p class="text-xs text-ink-3 m-0">Administradores</p>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="spinner spinner-lg" style="color: var(--accent);"></span>
        </div>
      } @else {
        <div class="card overflow-hidden">
          <div class="px-4 sm:px-6 py-4 border-b border-line bg-surface-2 flex flex-wrap items-center gap-3">
            <input type="text" placeholder="Buscar por nombre, email o número..."
                   class="input flex-1 min-w-[200px]"
                   [ngModel]="searchTerm()"
                   (ngModelChange)="searchTerm.set($event)">
          </div>
          <div class="divide-y divide-line">
            @for (u of filteredUsers(); track u.id) {
              <div class="px-4 sm:px-6 py-3 hover:bg-surface-2"
                   [class.opacity-60]="!u.isActive">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-ink m-0 truncate flex items-center gap-2">
                      {{ u.name || u.email || 'Sin nombre' }}
                      @if (!u.isActive) {
                        <span class="badge text-[10px]" style="background: var(--ink-3); color: white;">Inactivo</span>
                      }
                    </p>
                    <p class="text-xs text-ink-3 m-0">
                      {{ u.email || '—' }} · {{ u.number || '—' }}
                      <span class="badge ml-1" [style.background]="getRoleColor(u.role)" [style.color]="'white'">
                        {{ u.role }}
                      </span>
                    </p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 shrink-0">
                    <button type="button" class="btn-outline text-sm py-1.5 px-2"
                            (click)="toggleActive(u)"
                            [disabled]="toggling() === u.id"
                            [title]="u.isActive ? 'Desactivar' : 'Activar'">
                      @if (toggling() === u.id) {
                        <span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
                      } @else {
                        {{ u.isActive ? 'Desactivar' : 'Activar' }}
                      }
                    </button>
                    <button type="button" class="btn-outline text-sm py-1.5 px-2"
                            (click)="resetPassword(u)"
                            [disabled]="resetting() === u.id"
                            title="Restablecer a 12345678">
                      @if (resetting() === u.id) {
                        <span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
                      } @else {
                        Restablecer
                      }
                    </button>
                    <button type="button" class="btn-outline text-sm py-1.5 px-2"
                            (click)="openCustomPassword(u)"
                            title="Establecer contraseña personalizada">
                      Nueva contraseña
                    </button>
                  </div>
                </div>
                @if (customPasswordUser()?.id === u.id) {
                  <div class="mt-3 pt-3 border-t border-line flex gap-2 items-end">
                    <div class="flex-1 min-w-0">
                      <label class="block text-xs text-ink-3 mb-1">Nueva contraseña</label>
                      <input type="password" class="input w-full" placeholder="Escribe la nueva contraseña"
                             [(ngModel)]="customPassword" (keyup.enter)="submitCustomPassword(u)">
                    </div>
                    <button type="button" class="btn shrink-0" (click)="submitCustomPassword(u)"
                            [disabled]="!customPassword() || customPassword().length < 4 || resetting() === u.id">
                      Aplicar
                    </button>
                    <button type="button" class="btn-outline shrink-0" (click)="cancelCustomPassword()">Cancelar</button>
                  </div>
                }
              </div>
            }
          </div>
          @if (filteredUsers().length === 0) {
            <div class="px-4 sm:px-6 py-8 text-center text-ink-3 text-sm">
              @if (searchTerm()) {
                No hay usuarios que coincidan con la búsqueda.
              } @else {
                No hay usuarios registrados.
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<AdminUser[]>([]);
  stats = signal<{ total: number; active: number; inactive: number; admins: number } | null>(null);
  searchTerm = signal('');
  loading = signal(true);
  resetting = signal<string | null>(null);
  toggling = signal<string | null>(null);
  error = signal('');
  success = signal('');
  customPasswordUser = signal<AdminUser | null>(null);
  customPassword = signal('');

  filteredUsers = computed(() => {
    const list = this.users();
    const q = this.searchTerm().toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (u) =>
        (u.name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.number?.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  loadStats() {
    this.adminService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set('');
    this.adminService.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  resetPassword(user: AdminUser) {
    this.resetting.set(user.id);
    this.error.set('');
    this.success.set('');
    this.adminService.resetPassword(user.id).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.resetting.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudo restablecer la contraseña.');
        this.resetting.set(null);
      },
    });
  }

  openCustomPassword(user: AdminUser) {
    this.customPasswordUser.set(user);
    this.customPassword.set('');
  }

  cancelCustomPassword() {
    this.customPasswordUser.set(null);
    this.customPassword.set('');
  }

  submitCustomPassword(user: AdminUser) {
    const pw = this.customPassword();
    if (!pw || pw.length < 4) return;
    this.resetting.set(user.id);
    this.error.set('');
    this.success.set('');
    this.adminService.resetPassword(user.id, pw).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.resetting.set(null);
        this.cancelCustomPassword();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudo cambiar la contraseña.');
        this.resetting.set(null);
      },
    });
  }

  toggleActive(user: AdminUser) {
    this.toggling.set(user.id);
    this.error.set('');
    this.success.set('');
    this.adminService.setUserActive(user.id, !user.isActive).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.toggling.set(null);
        this.loadUsers();
        this.loadStats();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudo actualizar.');
        this.toggling.set(null);
      },
    });
  }

  getRoleColor(role: string): string {
    if (role === 'ADMIN') return 'var(--err)';
    if (role === 'LIDER') return 'var(--accent)';
    return 'var(--ink-3)';
  }
}
