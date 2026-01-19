import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CardComponent } from "@app/shared/components/card/card.component";
import { LemaCbiFullwidthComponent } from "../../shared/components/lema-cbi/lema-cbi-fullwidth.component";
@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, CardComponent, LemaCbiFullwidthComponent],
    templateUrl: './welcome.component.html',
})

export class WelcomeComponent {
    constructor(private router: Router) {}
    

}   