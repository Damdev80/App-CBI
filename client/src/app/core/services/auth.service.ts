import { Injectable } from "@angular/core";
import {jwtDecode} from "jwt-decode";

export interface JwtPayload {
    id: string;
    role: 'USER' | 'LIDER' | 'ADMIN';
    groupId?: string;
}

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    getToken(): string | null {
        // Evitar error en SSR: window puede no estar definido
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }

    getUser(): JwtPayload | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            return jwtDecode<JwtPayload>(token);
        } catch {
            return null;
        }
    }

    getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

    getGroupId(): string | null {
        return this.getUser()?.groupId ?? null;
    }

    logout(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
    }
}