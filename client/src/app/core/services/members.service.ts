  
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private apiUrl = environment.apiUrl + '/member/members';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  getGroupsByUserId(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/groups`, {
      headers: this.getAuthHeaders(),
    });
  }

  leaveGroup(userId: string, groupId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${environment.apiUrl}/member/members/user-group?userId=${userId}&groupId=${groupId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateLevelDicipules(userId: string, groupId: string, levelDicipules: string): Observable<any> {
    return this.http.patch<any>(
      `${environment.apiUrl}/member/members/level`,
      { userId, groupId, levelDicipules },
      { headers: this.getAuthHeaders() }
    );
  }

  createMember(data: { userId: string; groupId: string; levelDicipules: string }): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/member/create`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
}