import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
  number: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/admin`;

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
  }> {
    return this.http.get(`${this.apiUrl}/stats`, {
      headers: this.getHeaders(),
    }) as Observable<{ total: number; active: number; inactive: number; admins: number }>;
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, {
      headers: this.getHeaders(),
    });
  }

  resetPassword(
    userId: string,
    password?: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/users/${userId}/reset-password`,
      password ? { password } : {},
      { headers: this.getHeaders() }
    );
  }

  setUserActive(
    userId: string,
    isActive: boolean
  ): Observable<{ message: string; isActive: boolean }> {
    return this.http.post(
      `${this.apiUrl}/users/${userId}/set-active`,
      { isActive },
      { headers: this.getHeaders() }
    ) as Observable<{ message: string; isActive: boolean }>;
  }
}
