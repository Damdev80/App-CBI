import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full'
    },
    {
        path: 'welcome',
        loadComponent: () => import('./pages/welcome/welcome.component').then(c => c.WelcomeComponent)
    },
    {
        path:'**',
        loadComponent: () => import('./pages/not-found/404.component').then(c => c.NotFoundComponent)
    }
];
