export interface LoginModel {
    email: string;
    password: string;
}

export interface LoginModel {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;  // El backend devuelve access_token
}

export interface HttpErrorResponse {
    error: {
        message: string;
        error: string;
        statusCode: number;
    };
    status: number;
    statusText: string;
}