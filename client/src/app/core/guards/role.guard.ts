import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

type AllowedRole =
  | 'ADMIN'
  | 'SEMI_ADMIN'
  | 'CONTADORA'
  | 'LIDER_GRUPO'
  | 'LIDER'
  | 'SERVIDOR'
  | 'USER';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.getRole() as AllowedRole | null;
  const roles = (route.data?.['roles'] as AllowedRole[] | undefined) ?? [];

  if (!role) {
    router.navigate(['/login']);
    return false;
  }
  if (roles.length === 0 || roles.includes(role)) return true;

  router.navigate(['/app']);
  return false;
};
