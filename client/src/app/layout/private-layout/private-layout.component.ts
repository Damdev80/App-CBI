
import { Component, inject, OnInit, signal } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { SidebarItemComponent } from '../../shared/components/sidebar-item/sidebar-item.component';
import { NotificationService, Notification } from "@app/core/services/notification.service";
import { UsersEventService } from "@app/core/services/users-event.services";
import { Event } from "@app/shared/models/userEvent.model";
@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarItemComponent],
    templateUrl: './private-layout.component.html',
})


export class PrivateLayoutComponent implements OnInit {
    public userRole: string | null = null;
    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private usersEventService = inject(UsersEventService);
    private authService = inject(AuthService);
    
    notification$ = this.notificationService.notification$;
    events = signal<Event[]>([]);
    loadingEvents = signal<boolean>(false);

    ngOnInit() {
        this.loadEvents();
        // Exponer el rol del usuario para el template
        if (this.authService.getRole) {
            this.userRole = this.authService.getRole();
        }
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
        this.closeDrawer();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.closeDrawer();
    }

    navigateToEventDetails(eventId: string) {
        this.router.navigate(['/dashboard/event-registrations-list'], { queryParams: { eventId } });
        this.closeDrawer();
    }

    navigateToNewRegistration() {
        this.router.navigate(['/dashboard/event-registration']);
        this.closeDrawer();
    }

    closeDrawer() {
        // Cerrar el drawer en dispositivos móviles
        const drawer = document.getElementById('my-drawer') as HTMLInputElement;
        if (drawer) {
            drawer.checked = false;
        }
    }
}

