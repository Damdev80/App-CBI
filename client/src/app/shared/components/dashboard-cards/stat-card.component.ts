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
}