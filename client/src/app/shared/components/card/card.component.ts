import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common";
interface formCard {
    title: string,
    imageUrl: string | null,
    description: string
    
}

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card.component.html',
})

export class CardComponent {
    @Input() title: string = '';
    @Input() imageUrl: string | null = null;
    @Input() description: string = '';
    
}