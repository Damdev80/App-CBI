export interface RegisterModel {
    numberPhone: string;
    email: string;
    password: string;
}



export interface RegisterResponse {
    id: string;
    numberPhone: string;
    email: string;
    name: string | null;
    createdAt: string;
}