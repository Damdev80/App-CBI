import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUsersEventDto, UsersEvent, Event, AddPaymentDto, PaymentInfo } from '../../shared/models/userEvent.model';

@Injectable({
  providedIn: 'root'
})
export class UsersEventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users-event`;
  private eventUrl = `${environment.apiUrl}/event`;

  createRegistration(data: CreateUsersEventDto): Observable<UsersEvent> {
    return this.http.post<UsersEvent>(`${this.apiUrl}/create`, data);
  }

  getAllRegistrations(): Observable<UsersEvent[]> {
    return this.http.get<UsersEvent[]>(this.apiUrl);
  }

  getRegistrationById(id: string): Observable<UsersEvent> {
    return this.http.get<UsersEvent>(`${this.apiUrl}/${id}`);
  }

  getPaymentInfo(id: string): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.apiUrl}/${id}/payment-info`);
  }

  getEventRegistrations(eventId: string): Observable<UsersEvent[]> {
    return this.http.get<UsersEvent[]>(`${this.apiUrl}/event/${eventId}`);
  }

  updateRegistration(id: string, data: Partial<CreateUsersEventDto>): Observable<UsersEvent> {
    return this.http.patch<UsersEvent>(`${this.apiUrl}/${id}`, data);
  }

  addPayment(id: string, payment: AddPaymentDto): Observable<UsersEvent> {
    return this.http.patch<UsersEvent>(`${this.apiUrl}/${id}/add-payment`, payment);
  }

  updatePayStatus(id: string, payStatus: 'PAGO' | 'DEBE'): Observable<UsersEvent> {
    return this.http.patch<UsersEvent>(`${this.apiUrl}/${id}/pay-status`, { payStatus });
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.eventUrl}/events`);
  }   
}