import { Routes } from '@angular/router';
import { adminGuard } from '@app/core/guards/admin.guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './layout/private-layout/private-layout.component';
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';
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
            },
            {
                path: 'profile',
                loadComponent: () => import('./pages/profile/profile.component')
                  .then(m => m.Profile)
            },
            {
                path: 'profesores',
                loadComponent: () => import('./features/teachers/teachers')
                  .then(m => m.TeachersComponent)
            },
            {
                path: 'asistencia',
                loadComponent: () => import('./features/attendance/attendance.component')
                  .then(m => m.AttendanceComponent)
            },
            {
                path: 'servicio-social',
                loadComponent: () => import('./features/user-service/user-service')
                  .then(m => m.UserServiceComponent)
            },
            {
                path: 'biblia',
                loadComponent: () => import('./features/ModuleBiblia/module-biblia.component')
                  .then(m => m.ModuleBibliaComponent)
            },
            {
                path: 'eventos',
                loadComponent: () => import('./features/events/events.component')
                  .then(m => m.EventsComponent)
            },
            {
                path: 'foro',
                loadComponent: () => import('./features/foro/foro.component')
                  .then(m => m.ForoComponent)
            },
            {
                path: 'admin',
                loadComponent: () => import('./features/admin/admin.component')
                  .then(m => m.AdminComponent),
                canActivate: [adminGuard]
            },
            {
                path: 'crear-evento',
                loadComponent: () => import('./features/events/events.component')
                  .then(m => m.EventsComponent)
            }
        ]
    },
    // Vista general (usuarios sin ministerio/grupo)
    {
        path: 'app',
        component: UserLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.Profile) },
            { path: 'eventos', loadComponent: () => import('./features/events/events.component').then(m => m.EventsComponent) },
            { path: 'foro', loadComponent: () => import('./features/foro/foro.component').then(m => m.ForoComponent) },
            { path: 'biblia', loadComponent: () => import('./features/ModuleBiblia/module-biblia.component').then(m => m.ModuleBibliaComponent) },
            { path: 'event-registration', loadComponent: () => import('./features/event-registration/event-registration.component').then(m => m.EventRegistrationComponent) },
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
