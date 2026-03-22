import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MINISTERIOS } from '@app/core/config/sidebar-modules.config';

@Component({
  selector: 'app-en-desarrollo',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="w-full max-w-lg mx-auto px-4 py-16 text-center fade-up">
      <div class="card p-8">
        @if (ministerio?.slug === 'exploradores-rey') {
          <div class="text-5xl mb-4 opacity-60">📚</div>
          <h1 class="font-serif text-2xl font-semibold text-ink mb-2" style="font-family: var(--serif);">
            {{ ministerioName }}
          </h1>
          <p class="text-ink-2 text-sm mb-6">
            Tu módulo principal es <strong>Servicio Social</strong>. Accede desde el menú lateral.
          </p>
          <a routerLink="/dashboard/servicio-social" class="btn">Ir a Servicio Social</a>
        } @else {
          <div class="text-5xl mb-4 opacity-60">🚧</div>
          <h1 class="font-serif text-2xl font-semibold text-ink mb-2" style="font-family: var(--serif);">
            {{ ministerioName }}
          </h1>
          <p class="text-ink-2 text-sm mb-6">
            Este módulo está en desarrollo. Pronto tendrás acceso al contenido.
          </p>
          <a routerLink="/dashboard" class="btn-outline">Volver al inicio</a>
        }
      </div>
    </div>
  `,
})
export class EnDesarrolloComponent {
  private route = inject(ActivatedRoute);
  ministerio = MINISTERIOS.find(m => m.slug === this.route.snapshot.paramMap.get('slug')) ?? null;
  get ministerioName(): string {
    return this.ministerio?.name ?? 'Ministerio';
  }
}
