import { Inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { LoginEventService } from "./login-event.service";

export  enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO'
}

 export enum Dicipules {
  SI = 'SI',
  NO = 'NO'
}

 export enum LevelDicipules {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV'
}

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    number?: string;
    address?: string;
    happybirth?: string; // ISO string para fechas
    gender?: Gender; // ajusta según tu enum Gender
    baptized?: boolean;
    isActive?: boolean;
    dicipules?: Dicipules; // o enum si lo tienes tipado
    role?: string;
    createdAt?: string; // ISO string
    updatedAt?: string; // ISO string
    age?: number;
    hobbies?: string;
    dreams?: string;
    job?: string;
    vulnerable_area?: string;
}

@Injectable({
    providedIn: 'root'
})

export class profileService {
    private apiUrl = '/api/profile';

    constructor(private http: HttpClient, private loginEventService: LoginEventService) {}

    private getAuthHeaders(): HttpHeaders {
        const token = this.loginEventService.getToken();
        return new HttpHeaders({
            Authorization: token ? `Bearer ${token}` : ''
        });
    }

    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${environment.apiUrl}${this.apiUrl}`, {
            headers: this.getAuthHeaders()
        });
    }

    updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
        return this.http.patch<UserProfile>(`${environment.apiUrl}${this.apiUrl}`, profileData, {
            headers: this.getAuthHeaders()
        });
    }
}