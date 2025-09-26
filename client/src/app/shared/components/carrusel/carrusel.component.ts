import { Component, input, OnInit, OnDestroy, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarouselItem  } from "./carrusel.interface";


@Component({
    selector: 'app-carrusel',
    standalone: true,
    imports: [CarruselComponent, CommonModule],
    template: `
    <div class="relative w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg" 
         [style.height]="height()">
      
      <!-- Carousel Container -->
      <div class="relative h-full">
        
        <!-- Slides -->
        <div class="flex transition-transform duration-500 ease-in-out h-ful    l"
             [style.transform]="'translateX(-' + (currentIndex() * 100) + '%)'">
          
          @for (item of items(); track item.id; let i = $index) {
            <div class="w-full h-full flex-shrink-0 relative">
              <!-- Image -->
              <img 
                [src]="item.image" 
                [alt]="item.title || 'Carousel item ' + (i + 1)"
                class="w-full h-full object-cover">
              
              <!-- Overlay with content (if title or description exists) -->
              @if (item.title || item.description) {
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                           flex items-end p-6">
                  <div class="text-white">
                    @if (item.title) {
                      <h3 class="text-2xl font-bold mb-2">{{ item.title }}</h3>
                    }
                    @if (item.description) {
                      <p class="text-gray-200 mb-3">{{ item.description }}</p>
                    }
                    @if (item.link) {
                      <a [href]="item.link" 
                         class="inline-block bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        Ver más
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Navigation Arrows -->
        @if (showArrows() && items().length > 1) {
          <!-- Previous Button -->
          <button 
            (click)="goToPrevious()"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 
                   bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full 
                   shadow-lg transition-all duration-200 hover:scale-110 z-10
                   backdrop-blur-sm border border-white/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Next Button -->
          <button 
            (click)="goToNext()"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 
                   bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full 
                   shadow-lg transition-all duration-200 hover:scale-110 z-10
                   backdrop-blur-sm border border-white/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        }

        <!-- Loading indicator -->
        @if (isLoading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }
      </div>

      <!-- Dots Indicator -->
      @if (showDots() && items().length > 1) {
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          @for (item of items(); track item.id; let i = $index) {
            <button
              (click)="goToSlide(i)"
              class="w-3 h-3 rounded-full transition-all duration-200 border-2 border-white"
              [class]="i === currentIndex() 
                      ? 'bg-white scale-110' 
                      : 'bg-white/50 hover:bg-white/80'">
            </button>
          }
        </div>
      }

      <!-- Slide Counter -->
      @if (showCounter() && items().length > 1) {
        <div class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {{ currentIndex() + 1 }} / {{ items().length }}
        </div>
      }
    </div>
    `,
    styles:[`
        :host {
            display:block;
            width: 100%
        }
    `]


})

export class CarruselComponent {
    constructor() {}
    
}
