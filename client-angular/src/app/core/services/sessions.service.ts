import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface Session {
    id: string;
    title: string;
    description?: string;
    groupId: string;
}

@Injectable({
    providedIn: 'root'
})

export class SessionsService {
    private apiUrl = environment.apiUrl + '/sessions';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        });
    }


    getSessionsByGroup(groupId: string): Observable<Session[]> {
        return this.http.get<Session[]>(`${this.apiUrl}/group/${groupId}`, { headers: this.getAuthHeaders() });
    }

    createSession(data: { title: string; description?: string; date?: Date; groupId: string }): Observable<Session> {
        return this.http.post<Session>(this.apiUrl, data, { headers: this.getAuthHeaders() });
    }
}

