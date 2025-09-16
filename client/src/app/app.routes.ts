import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        children: [
            {path: '', component: WelcomeComponent, pathMatch: 'full'},
            {path: 'login', component:LoginComponent},
            {path: 'register', component: RegisterComponent}
        ]
    },
    {
        path:'**',
        loadComponent: () => import('./pages/not-found/404.component').then(c => c.NotFoundComponent)
    }
];
