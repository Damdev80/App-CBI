import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StudentGroup } from '@app/shared/models/service-social.model';

@Injectable({ providedIn: 'root' })
export class StudentGroupsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/student-groups`;

  getAll(teacherId?: string): Observable<StudentGroup[]> {
    const params = teacherId ? new HttpParams().set('teacherId', teacherId) : undefined;
    return this.http.get<StudentGroup[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<StudentGroup> {
    return this.http.get<StudentGroup>(`${this.apiUrl}/${id}`);
  }

  create(data: { name: string; number?: string; teacherId?: string }): Observable<StudentGroup> {
    return this.http.post<StudentGroup>(this.apiUrl, data);
  }

  update(id: string, data: { name?: string; number?: string; teacherId?: string }): Observable<StudentGroup> {
    return this.http.patch<StudentGroup>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
