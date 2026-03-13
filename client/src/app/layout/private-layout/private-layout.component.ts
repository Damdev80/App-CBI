
import { Component, inject, OnInit, signal } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationService } from "@app/core/services/notification.service";
import { UsersEventService } from "@app/core/services/users-event.services";
import { Event } from "@app/shared/models/userEvent.model";
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MessageService, MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [
        CommonModule, RouterModule,
        DrawerModule, ButtonModule, ToolbarModule, MenuModule,
        ToastModule, PanelMenuModule, AvatarModule, BadgeModule,
        DividerModule, ProgressSpinnerModule
    ],
    providers: [MessageService],
    templateUrl: './private-layout.component.html',
})
export class PrivateLayoutComponent implements OnInit {
    public userRole: string | null = null;
    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private usersEventService = inject(UsersEventService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    sidebarVisible = signal(false);
    events = signal<Event[]>([]);
    loadingEvents = signal<boolean>(false);
    userMenuItems: MenuItem[] = [];
    eventsExpanded = signal(false);
    socialExpanded = signal(false);

    ngOnInit() {
        this.loadEvents();
        if (this.authService.getRole) {
            this.userRole = this.authService.getRole();
        }
        this.userMenuItems = [
            { label: 'Perfil', icon: 'pi pi-user', command: () => this.navegateTo('/dashboard/profile') },
            { label: 'Configuración', icon: 'pi pi-cog' },
            { separator: true },
            { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', styleClass: 'text-red-500', command: () => this.logout() }
        ];

        this.notificationService.notification$.subscribe(notification => {
            if (notification) {
                this.messageService.add({
                    severity: notification.type === 'error' ? 'error' : notification.type === 'success' ? 'success' : notification.type === 'warning' ? 'warn' : 'info',
                    summary: notification.type === 'error' ? 'Error' : notification.type === 'success' ? 'Éxito' : 'Info',
                    detail: notification.message
                });
            }
        });
    }

    loadEvents() {
        this.loadingEvents.set(true);
        this.usersEventService.getAllEvents().subscribe({
            next: (events) => {
                this.events.set(events);
                this.loadingEvents.set(false);
            },
            error: (error) => {
                console.error('Error loading events:', error);
                this.loadingEvents.set(false);
            }
        });
    }

    navegateTo(path: string) {
        this.router.navigate([path]);
        this.sidebarVisible.set(false);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.sidebarVisible.set(false);
    }

    navigateToEventDetails(eventId: string) {
        this.router.navigate(['/dashboard/event-registrations-list'], { queryParams: { eventId } });
        this.sidebarVisible.set(false);
    }

    navigateToNewRegistration() {
        this.router.navigate(['/dashboard/event-registration']);
        this.sidebarVisible.set(false);
    }
}

