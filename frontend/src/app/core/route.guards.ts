import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.user()) {
    return router.createUrlTree(['/login']);
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.user()) {
    return router.createUrlTree(['/admin-login']);
  }

  if (session.user()?.role !== 'admin') {
    return router.createUrlTree(['/']);
  }

  return true;
};
