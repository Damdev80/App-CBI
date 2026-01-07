import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './layout/private-layout/private-layout.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/404.component';
import { PreRegisterComponent } from './pages/pre-register/preRegister.component';

export const routes: Routes = [
    // Rutas públicas
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {
                path: '',
                component: WelcomeComponent, 
                pathMatch: 'full'
            },
            {
                path: 'login', 
                component: LoginComponent
            },
            {
                path: 'register', 
                component: RegisterComponent
            },
            {
                path: 'pre-register',
                component: PreRegisterComponent
            }

        ]
    },
    // Rutas privadas (Dashboard)
    {
        path: 'dashboard',
        component: PrivateLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/dashboard/dashboard.component')
                  .then(m => m.DashboardComponent)
            },
            {
                path: 'event-registration',
                loadComponent: () => import('./features/event-registration/event-registration.component')
                  .then(m => m.EventRegistrationComponent)
            },
            {
                path: 'event-registrations-list',
                loadComponent: () => import('./features/event-table-users/event-table-users')
                  .then(m => m.EventRegistrationListComponent)
            }
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
