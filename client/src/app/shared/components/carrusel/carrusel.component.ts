import { Component, input, OnInit, OnDestroy, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarruselItem } from "./carrusel.interface";


@Component({
    selector: 'app-carrusel',
    standalone: true,
    imports: [CarruselComponent, CommonModule],
    template: `
    div
    `
})

export class CarruselComponent {
    constructor() {}
    
}
