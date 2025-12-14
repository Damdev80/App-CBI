import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { NotificationService, Notification } from "@app/core/services/notification.service";
@Component({
    selector: 'app-private-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './private-layout.component.html',
})


export class PrivateLayoutComponent {

    private router = inject(Router);
    private notificationService = inject(NotificationService);
    notification$ = this.notificationService.notification$;


    
    navegateTo(path: string) {
        this.router.navigate([path]);
    }
}

