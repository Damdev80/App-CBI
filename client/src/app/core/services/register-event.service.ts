import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { RegisterModel } from "@app/shared/models/register.model";
import { Observable } from "rxjs";
import { RegisterResponse } from "@app/shared/models/register.model";

@Injectable({
    providedIn: 'root'

})

export class RegisterEventService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/user`;

    register(userData:RegisterModel): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/users`, userData);
    }

}