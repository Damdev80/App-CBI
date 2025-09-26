import { Component, Input, OnInit, OnDestroy, signal, computed, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CarouselItem  } from "./carrusel.interface";


@Component({
    selector: 'app-carrusel',
    standalone: true,
    imports: [CarouselComponent, CommonModule],
    template: `
    <div class="relative w-full overflow-hidden" 
         [style.height]="height()">
      
      <!-- Carousel Container -->
      <div class="relative h-screen w-full rounded-xl">
        
        <!-- Slides -->
        <div class="flex transition-transform duration-500 ease-in-out h-screen"
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
        @if (showArrowsSignal() && items().length > 1) {
          <!-- Previous Button -->
          <button 
            (click)="goToPrevious()"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 
                   bg-white/30 hover:bg-white/50 text-gray-800 p-3 rounded-full 
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
                   bg-white/30 hover:bg-white/50 text-gray-800 p-3 rounded-full 
                   shadow-lg transition-all duration-200 hover:scale-110 z-10
                   backdrop-blur-sm border border-white/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        }

        <!-- Loading indicator -->
        @if (isLoadingSignal()) {
          <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }
      </div>

      <!-- Dots Indicator -->
      @if (showDotsSignal() && items().length > 1) {
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
      @if (showCounterSignal() && items().length > 1) {
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

export class CarouselComponent implements OnInit, OnDestroy {
  // Inputs configurables
  @Input() carouselItems: CarouselItem[] = [];
  @Input() autoPlay = true;
  @Input() autoPlayInterval = 3000;
  @Input() showArrows = true;
  @Input() showDots = true;
  @Input() showCounter = false;
  @Input() carouselHeight = '400px';
  @Input() loading = false;

  // Signals para reactividad
  items = signal<CarouselItem[]>([]);
  currentIndex = signal(0);
  height = signal('400px');
  // Renombradas las signals internas para evitar colisión con los @Input()
  showArrowsSignal = signal(true);
  showDotsSignal = signal(true);
  showCounterSignal = signal(false);
  isLoadingSignal = signal(false);

  // Variables para auto-play
  private autoPlayTimer?: number;
  private isAutoPlaying = signal(false);

  // Computed para saber si hay slides
  hasSlides = computed(() => this.items().length > 0);

  constructor() {
    // Effect para reaccionar a cambios en el índice actual
    effect(() => {
      const index = this.currentIndex();
      // Aquí podrías emitir eventos o hacer logging
      console.log(`Slide actual: ${index + 1}`);
    });
  }

  ngOnInit() {
    // Inicializar signals con los inputs
    this.items.set(this.carouselItems);
    this.height.set(this.carouselHeight);
    this.showArrowsSignal.set(this.showArrows);
    this.showDotsSignal.set(this.showDots);
    this.showCounterSignal.set(this.showCounter);
    this.isLoadingSignal.set(this.loading);

    if (this.autoPlay && this.items().length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  // Navegación del carousel
  goToNext() {
    if (this.items().length === 0) return;
    
    const nextIndex = (this.currentIndex() + 1) % this.items().length;
    this.currentIndex.set(nextIndex);
    this.resetAutoPlay();
  }

  goToPrevious() {
    if (this.items().length === 0) return;
    
    const prevIndex = this.currentIndex() === 0 
      ? this.items().length - 1 
      : this.currentIndex() - 1;
    this.currentIndex.set(prevIndex);
    this.resetAutoPlay();
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.items().length) {
      this.currentIndex.set(index);
      this.resetAutoPlay();
    }
  }

  // Auto-play functionality
  private startAutoPlay() {
    this.isAutoPlaying.set(true);
    this.autoPlayTimer = window.setInterval(() => {
      this.goToNext();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = undefined;
    }
    this.isAutoPlaying.set(false);
  }

  private resetAutoPlay() {
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  // Métodos públicos para control externo
  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  // Actualizar items dinámicamente
  updateItems(newItems: CarouselItem[]) {
    this.items.set(newItems);
    if (this.currentIndex() >= newItems.length) {
      this.currentIndex.set(0);
    }
  }

  // Touch/Swipe support (básico)
  onTouchStart(event: TouchEvent) {
    // Implementar lógica de touch start
  }

  onTouchMove(event: TouchEvent) {
    // Implementar lógica de touch move
  }

  onTouchEnd(event: TouchEvent) {
    // Implementar lógica de touch end
  }
}
