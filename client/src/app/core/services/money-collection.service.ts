import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MoneyCollection } from '@app/shared/models/service-social.model';

@Injectable({ providedIn: 'root' })
export class MoneyCollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/money-collections`;

  create(data: { date: string; amount: number; studentId: string; notes?: string }): Observable<MoneyCollection> {
    return this.http.post<MoneyCollection>(this.apiUrl, data);
  }

  findAll(filters?: { studentId?: string; teacherId?: string; from?: string; to?: string }): Observable<MoneyCollection[]> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<MoneyCollection[]>(this.apiUrl, { params });
  }

  getTotal(filters?: { studentId?: string; teacherId?: string; from?: string; to?: string }): Observable<number> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<number>(`${this.apiUrl}/total`, { params });
  }
}
