import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface EventModel {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  createdAt?: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  eventDate: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/event`;

  getAllEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(`${this.apiUrl}/events`);
  }

  createEvent(data: CreateEventDto): Observable<EventModel> {
    return this.http.post<EventModel>(`${this.apiUrl}/create`, data);
  }
}
