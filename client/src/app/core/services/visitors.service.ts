import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateVisitorDto {
  name: string;
  dateBorn: string;
  phone: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  dateBorn: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class VisitorsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/visitors`;

  create(data: CreateVisitorDto): Observable<Visitor> {
    return this.http.post<Visitor>(this.apiUrl, data);
  }

  list(): Observable<Visitor[]> {
    return this.http.get<Visitor[]>(this.apiUrl);
  }
}
