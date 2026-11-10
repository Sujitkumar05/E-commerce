import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/** UI route protection only. Production APIs must enforce authorization server-side. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user?.role === 'admin') return true;
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};
