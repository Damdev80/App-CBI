import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { LemaCbiFullwidthComponent } from "../../shared/components/lema-cbi/lema-cbi-fullwidth.component";
import { TagModule } from 'primeng/tag';
@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, LemaCbiFullwidthComponent, TagModule],
    templateUrl: './welcome.component.html',
})

export class WelcomeComponent {
    constructor(private router: Router) {}
    

}   