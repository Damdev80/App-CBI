import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { LoginModel } from "@app/shared/models/login.model";

@Injectable({
    providedIn: 'root'

})

export class LoginEventService {
    private http = inject (HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    login(credentials: LoginModel) {
        return this.http.post<{ token: string }>(`${this.apiUrl}/log-in`, credentials);
    }

    register(credentials: LoginModel) {
        return this.http.post<{ token: string }>(`${this.apiUrl}/register`, credentials);
    }
}