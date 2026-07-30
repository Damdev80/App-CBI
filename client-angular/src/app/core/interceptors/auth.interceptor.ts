import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { environment } from 'src/environments/environment';

/** Adjunta Bearer a peticiones hacia la API del backend (mismo origen configurado en environment). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const base = environment.apiUrl.replace(/\/$/, '');
  const url = req.url;
  const isApi =
    url.startsWith(base) ||
    url.startsWith(`${base}/`) ||
    (environment.production === false && url.includes('localhost:3000'));

  if (token && isApi && !req.headers.has('Authorization')) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }
  return next(req);
};
