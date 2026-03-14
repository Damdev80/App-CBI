import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CardModule } from 'primeng/card';

@Component({
    selector: "app-stat-card",
    standalone: true,
    imports: [CommonModule, CardModule],
    templateUrl: "./stat-card.component.html",
})
export class StatCardComponent {
    title = input<string>('');
    value = input<string | number>(0);
    description = input<string | undefined>();
    icon = input<string>('');
    color = input<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error'>('primary');

    valueColorClass(): string {
        switch (this.color()) {
            case 'secondary':
            case 'warning':
                return 'text-secondary-color';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-primary-color';
        }
    }

    iconColorClass(): string {
        switch (this.color()) {
            case 'secondary':
            case 'warning':
                return 'bg-secondary-light text-secondary-color';
            case 'error':
                return 'bg-red-500/10 text-red-500';
            case 'primary':
                return 'bg-primary/10 text-primary';
            default:
                return 'bg-primary-light text-primary-color';
        }
    }
}