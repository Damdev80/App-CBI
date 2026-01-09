import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationService, Notification } from "@app/core/services/notification.service";
import { UsersEventService } from "@app/core/services/users-event.services";
import { Event } from "@app/shared/models/userEvent.model";
@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './private-layout.component.html',
})


export class PrivateLayoutComponent implements OnInit {

    private router = inject(Router);
    private notificationService = inject(NotificationService);
    private usersEventService = inject(UsersEventService);
    
    notification$ = this.notificationService.notification$;
    events = signal<Event[]>([]);
    loadingEvents = signal<boolean>(false);

    ngOnInit() {
        this.loadEvents();
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

