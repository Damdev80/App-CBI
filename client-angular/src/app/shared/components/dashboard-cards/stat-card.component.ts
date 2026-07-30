import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-stat-card",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./stat-card.component.html",
})
export class StatCardComponent {
    title = input<string>('');
    value = input<string | number>(0);
    description = input<string | undefined>();
    icon = input<string>('');
    color = input<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info' | 'error'>('primary');

    accentColor(): string {
        switch (this.color()) {
            case 'success': return 'var(--ok)';
            case 'warning': return 'var(--warn)';
            case 'error':   return 'var(--err)';
            default:        return 'var(--accent)';
        }
    }
}