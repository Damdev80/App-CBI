
import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { AuthService } from "@app/core/services/auth.service";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { Notification, NotificationService } from "@app/core/services/notification.service";
import { UsersEventService } from "@app/core/services/users-event.services";
import { profileService } from "@app/core/services/profile.service";
import { Event } from "@app/shared/models/userEvent.model";
import { ThemeToggleComponent } from "@app/shared/components/theme-toggle/theme-toggle.component";
import { getModulesForGroups, MINISTERIOS, DEPT_ICONS, SIDEBAR_MODULES, type SidebarModuleKey } from "@app/core/config/sidebar-modules.config";

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
    private profileService = inject(profileService);

    events = signal<Event[]>([]);
    loadingEvents = signal<boolean>(false);
    notification = signal<Notification | null>(null);
    sidebarOpen = signal<boolean>(false);
    sidebarCollapsed = signal<boolean>(true);
    userMenuOpen = false;
    deptIcons = DEPT_ICONS;
    visibleModules = signal<Set<SidebarModuleKey>>(new Set());
    ministerios = MINISTERIOS;

    canSee = (key: SidebarModuleKey): boolean => {
        if (this.userRole === 'ADMIN') return true;
        if (key === SIDEBAR_MODULES.admin) return false;
        return this.visibleModules().has(key);
    };

    ngOnInit() {
        this.loadEvents();
        this.userRole = this.authService.getRole();
        this.profileService.getProfileWithGroups().subscribe({
            next: (p) => {
                const groups = p.groups || [];
                if (groups.length === 0 && this.userRole !== 'ADMIN') {
                    this.router.navigate(['/app']);
                    return;
                }
                const groupNames = groups.map((g) => g.name);
                this.visibleModules.set(getModulesForGroups(groupNames));
                if (this.userRole === 'ADMIN') {
                    const allModules = new Set<SidebarModuleKey>([
                        SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.usuarios,
                        SIDEBAR_MODULES.admin, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.servSocial,
                        SIDEBAR_MODULES.biblia,
                        SIDEBAR_MODULES.deptStaff, SIDEBAR_MODULES.deptVisionJuvenil, SIDEBAR_MODULES.deptAdoremos,
                        SIDEBAR_MODULES.deptEscuelaFormacion, SIDEBAR_MODULES.deptExploradoresRey,
                        SIDEBAR_MODULES.deptSalvacion, SIDEBAR_MODULES.deptAudiovisuales,
                        SIDEBAR_MODULES.deptMujeresReinan, SIDEBAR_MODULES.deptVaronesAmigosDios,
                        SIDEBAR_MODULES.deptDanzaKadosh, SIDEBAR_MODULES.deptIntercesion,
                        SIDEBAR_MODULES.deptEntrelazados, SIDEBAR_MODULES.deptProtocolo,
                    ]);
                    this.visibleModules.set(allModules);
                }
            },
            error: () => this.visibleModules.set(new Set([SIDEBAR_MODULES.dashboard, SIDEBAR_MODULES.eventos, SIDEBAR_MODULES.foro, SIDEBAR_MODULES.biblia])),
        });

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

    toggleMobileMenu() {
        this.sidebarOpen.update((v) => !v);
    }

    toggleSidebarCollapsed() {
        this.sidebarCollapsed.update((v) => !v);
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

