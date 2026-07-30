import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";


const enum SEXO {
        MASCULINO = 'Masculino',
        FEMENINO = 'Femenino'
}

interface IPreRegisterUserResponse {
    name: string;
    sexo: SEXO;
    number: string;
    address: string;
    baptized: boolean;
    group: string;
}



@Injectable({
    providedIn: "root",
})



export class PreRegisterService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    preRegisterUser(data: { name: string; sexo: SEXO; number: string; address: string; baptized: boolean; group: string }): Promise<IPreRegisterUserResponse> {
        return firstValueFrom(this.http.post<IPreRegisterUserResponse>(`${this.apiUrl}/pre-register`, data));
    }
}