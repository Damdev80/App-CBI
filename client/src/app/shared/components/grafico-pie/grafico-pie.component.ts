import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";


@Component({
    selector: 'graf-pie',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './grafico-pie.component.html'
})

export class grafPieComponent {
    name = input<string>('null')
    value = input<number>(0)
}