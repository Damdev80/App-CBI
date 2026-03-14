import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common";
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
interface formCard {
    title: string,
    imageUrl: string | null,
    description: string
    
}

@Component({
    selector: 'app-card',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    templateUrl: './card.component.html',
})

export class CardComponent {
    @Input() title: string = '';
    @Input() imageUrl: string | null = null;
    @Input() description: string = '';
    
}