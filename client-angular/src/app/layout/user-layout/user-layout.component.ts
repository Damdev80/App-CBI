import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { Notification, NotificationService } from '@app/core/services/notification.service';
import { ThemeToggleComponent } from '@app/shared/components/theme-toggle/theme-toggle.component';

/**
 * Vista general para usuarios que no pertenecen a ningún ministerio/grupo.
 * Sidebar simplificado: Inicio, Perfil, Eventos, Visitantes, Estudio Bíblico.
 */
@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  templateUrl: './user-layout.component.html',
})
export class UserLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  notification = signal<Notification | null>(null);
  sidebarOpen = signal(false);

  ngOnInit() {
    this.notificationService.notification$.subscribe((n) => this.notification.set(n));
  }

  navegateTo(path: string) {
    this.router.navigate([path]);
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
