import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserServiceSocial } from '@app/shared/models/service-social.model';

@Injectable({ providedIn: 'root' })
export class UserServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users-service`;

  getAll(): Observable<UserServiceSocial[]> {
    return this.http.get<UserServiceSocial[]>(this.apiUrl);
  }

  getByTeacher(teacherId: string): Observable<UserServiceSocial[]> {
    return this.http.get<UserServiceSocial[]>(
      `${this.apiUrl}/teacher/${teacherId}`,
    );
  }

  getById(id: string): Observable<UserServiceSocial> {
    return this.http.get<UserServiceSocial>(`${this.apiUrl}/${id}`);
  }

  create(data: {
    name: string;
    number?: string;
    teacherId: string;
    Gender: 'MASCULINO' | 'FEMENINO';
    Documents?: string;
  }): Observable<UserServiceSocial> {
    return this.http.post<UserServiceSocial>(this.apiUrl, data);
  }

  update(
    id: string,
    data: Partial<UserServiceSocial>,
  ): Observable<UserServiceSocial> {
    return this.http.patch<UserServiceSocial>(`${this.apiUrl}/${id}`, data);
  }

  toggleAttendance(id: string): Observable<UserServiceSocial> {
    return this.http.patch<UserServiceSocial>(
      `${this.apiUrl}/${id}/toggle-attendance`,
      {},
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
