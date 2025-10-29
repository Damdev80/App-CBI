import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CarouselComponent } from "../../shared/components/carrusel/carrusel.component";
import { CarouselItem } from "@app/shared/components/carrusel/carrusel.interface";
import { CardComponent } from "@app/shared/components/card/card.component";
@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, CarouselComponent, CardComponent],
    templateUrl: './welcome.component.html',
})

export class WelcomeComponent {
    constructor(private router: Router) {}
    
    photos: CarouselItem[] = [
            {
                id: 1,
                image: 'img/ImgBanner_Estableciendo_El_Reino.jpg',
                title: 'Bienvenido a CBI',
                description: 'Tu socio confiable en soluciones tecnológicas.',
                link: '/register'
            }, 
            {
                id: 2,
                image: 'https://picsum.photos/seed/cbi2/1200/600',
                title: 'Innovación Continua',
                description: 'Transformamos ideas en realidad con tecnología de punta.',
                link: '/register'
            }, 
            {
                id: 3,
                image: 'https://picsum.photos/seed/cbi3/1200/600',
                title: 'Compromiso con la Calidad',
                description: 'Entregamos excelencia en cada proyecto que emprendemos.',
                link: '/register'
            }, 
            {
                id: 4,
                image: 'https://picsum.photos/seed/cbi4/1200/600',
                title: 'Soluciones Personalizadas',
                description: 'Adaptamos nuestras soluciones a las necesidades únicas de tu negocio.',
                link: '/register'
            }, 
            {
                id: 5,
                image: 'https://picsum.photos/seed/cbi5/1200/600',
                title: 'Equipo de Expertos',
                description: 'Nuestro equipo está compuesto por profesionales altamente capacitados.',
                link: '/register'
            }
    ]




    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}   