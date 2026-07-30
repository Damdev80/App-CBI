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
  // Login/Register use localStorage, HTTP — render client-side
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'register',
    renderMode: RenderMode.Client
  },
  // pre-register makes backend calls on init — render client-side
  {
    path: 'pre-register',
    renderMode: RenderMode.Client
  },
  // App layout requires auth, profile API — render client-side
  {
    path: 'app',
    renderMode: RenderMode.Client
  },
  {
    path: 'app/**',
    renderMode: RenderMode.Client
  },
  // 404
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
