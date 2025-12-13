import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { environment } from "src/environments/environment";
import { LoginModel, LoginResponse } from "@app/shared/models/login.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'

})

export class LoginEventService {
    private http = inject (HttpClient);
    private platformId = inject(PLATFORM_ID);
    private apiUrl = `${environment.apiUrl}/auth`;
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();


    private hasToken(): boolean {
        if (!isPlatformBrowser(this.platformId)) {
            return false;
        }
        return !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
    }

    login(credentials: LoginModel){
        return this.http.post<LoginResponse>(`${this.apiUrl}/log-in`, credentials);
    }
  
    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
        }
        this.isAuthenticatedSubject.next(false);
    }

    getToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return this.hasToken();
    }
}