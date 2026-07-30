import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttendanceRecordDto, AttendanceHistoryItem } from '@app/shared/models/service-social.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/attendance`;

  getByDateAndTeacher(date: string, teacherId: string): Observable<AttendanceRecordDto[]> {
    const params = new HttpParams().set('date', date).set('teacherId', teacherId);
    return this.http.get<AttendanceRecordDto[]>(`${this.apiUrl}/by-date`, { params });
  }

  upsertBulk(
    date: string,
    teacherId: string,
    records: { studentId: string; present: boolean }[]
  ): Observable<unknown[]> {
    return this.http.post<unknown[]>(`${this.apiUrl}/bulk`, {
      date,
      teacherId,
      records,
    });
  }

  getHistory(teacherId: string, from?: string, to?: string): Observable<AttendanceHistoryItem[]> {
    let params = new HttpParams().set('teacherId', teacherId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<AttendanceHistoryItem[]>(`${this.apiUrl}/history`, { params });
  }

  getAbsenceCounts(teacherId: string): Observable<{ studentId: string; name: string; absenceCount: number; hasWarning: boolean }[]> {
    const params = new HttpParams().set('teacherId', teacherId);
    return this.http.get<{ studentId: string; name: string; absenceCount: number; hasWarning: boolean }[]>(
      `${this.apiUrl}/absence-counts`,
      { params }
    );
  }

  getSummary(date: string, teacherId?: string): Observable<{ total: number; present: number; absent: number }> {
    let params = new HttpParams().set('date', date);
    if (teacherId) params = params.set('teacherId', teacherId);
    return this.http.get<{ total: number; present: number; absent: number }>(
      `${this.apiUrl}/summary`,
      { params }
    );
  }
}
