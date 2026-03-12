import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Teacher } from '@app/shared/models/service-social.model';

@Injectable({ providedIn: 'root' })
export class TeacherServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teachers-service`;

  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl);
  }

  getById(id: string): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  create(data: {
    name: string;
    number?: string;
  }): Observable<Teacher> {
    return this.http.post<Teacher>(this.apiUrl, data);
  }

  update(id: string, data: Partial<Teacher>): Observable<Teacher> {
    return this.http.patch<Teacher>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
