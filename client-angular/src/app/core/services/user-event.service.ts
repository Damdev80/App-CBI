import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root'
})

export class userEventService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/user`;

    getAllUsers() {
        return this.http.get(`${this.apiUrl}/users`);
    }
}