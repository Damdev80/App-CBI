
import { Component, inject, OnInit, signal } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Notification, NotificationService } from "@app/core/services/notification.service";
import { UsersEventService } from "@app/core/services/users-event.services";
import { Event } from "@app/shared/models/userEvent.model";
import { ThemeToggleComponent } from "@app/shared/components/theme-toggle/theme-toggle.component";

@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ThemeToggleComponent
    ],
    templateUrl: './private-layout.component.html',
})
export class PrivateLayoutComponent implements OnInit {
    public userRole: string | null = null;
    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private usersEventService = inject(UsersEventService);
    private authService = inject(AuthService);

    events = signal<Event[]>([]);
    loadingEvents = signal<boolean>(false);
    notification = signal<Notification | null>(null);
    sidebarOpen = signal<boolean>(false);

    ngOnInit() {
        this.loadEvents();
        if (this.authService.getRole) {
            this.userRole = this.authService.getRole();
        }

        this.notificationService.notification$.subscribe((n) => {
            this.notification.set(n);
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
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    navigateToEventDetails(eventId: string) {
        this.router.navigate(['/dashboard/event-registrations-list'], { queryParams: { eventId } });
    }

    navigateToNewRegistration() {
        this.router.navigate(['/dashboard/event-registration']);
    }
}

