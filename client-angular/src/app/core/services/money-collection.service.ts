import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  MoneyCollection,
  MoneyCollectionInvoiceMeta,
  StudentDebtStatus,
} from '@app/shared/models/service-social.model';

type MoneyCollectionCreateResponse = MoneyCollection & {
  invoice?: MoneyCollectionInvoiceMeta | null;
};

@Injectable({ providedIn: 'root' })
export class MoneyCollectionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/money-collections`;

  create(data: { date: string; amount: number; studentId: string; notes?: string; targetAmount?: number }): Observable<MoneyCollectionCreateResponse> {
    return this.http.post<MoneyCollectionCreateResponse>(this.apiUrl, data);
  }

  downloadInvoice(collectionId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${collectionId}/invoice`, {
      responseType: 'blob',
    });
  }

  findAll(filters?: { studentId?: string; teacherId?: string; groupId?: string; from?: string; to?: string }): Observable<MoneyCollection[]> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters?.groupId) params = params.set('groupId', filters.groupId);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<MoneyCollection[]>(this.apiUrl, { params });
  }

  getTotal(filters?: { studentId?: string; teacherId?: string; groupId?: string; from?: string; to?: string }): Observable<number> {
    let params = new HttpParams();
    if (filters?.studentId) params = params.set('studentId', filters.studentId);
    if (filters?.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters?.groupId) params = params.set('groupId', filters.groupId);
    if (filters?.from) params = params.set('from', filters.from);
    if (filters?.to) params = params.set('to', filters.to);
    return this.http.get<number>(`${this.apiUrl}/total`, { params });
  }

  getDebtStatus(filters: {
    expectedAmount: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
  }): Observable<StudentDebtStatus[]> {
    let params = new HttpParams().set('expectedAmount', String(filters.expectedAmount));
    if (filters.studentId) params = params.set('studentId', filters.studentId);
    if (filters.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    return this.http.get<StudentDebtStatus[]>(`${this.apiUrl}/debt-status`, { params });
  }

  getMorosos(filters: {
    expectedAmount: number;
    teacherId?: string;
    groupId?: string;
  }): Observable<StudentDebtStatus[]> {
    let params = new HttpParams().set('expectedAmount', String(filters.expectedAmount));
    if (filters.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters.groupId) params = params.set('groupId', filters.groupId);
    return this.http.get<StudentDebtStatus[]>(`${this.apiUrl}/morosos`, { params });
  }

  recalculatePayStatus(data: {
    expectedAmount: number;
    studentId?: string;
    teacherId?: string;
    groupId?: string;
  }): Observable<{ updated: number; expectedAmount: number; debtors: number }> {
    return this.http.post<{ updated: number; expectedAmount: number; debtors: number }>(
      `${this.apiUrl}/recalculate-pay-status`,
      data,
    );
  }
}
