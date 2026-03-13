import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dashboard routes require auth + backend calls — render client-side
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client
  },
  // pre-register makes backend calls on init — render client-side
  {
    path: 'pre-register',
    renderMode: RenderMode.Client
  },
  // Public static routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
