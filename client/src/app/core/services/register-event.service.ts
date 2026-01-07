import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { RegisterModel } from "@app/shared/models/register.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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

    getAllGroups(): Observable<string[]> {
        return this.http.get<{ name: string }[]>(`${environment.apiUrl}/group/groups/names`).pipe(
            map(groups => groups.map(g => g.name))
        );
    }

}