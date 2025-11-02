import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Auth, authState } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};

export const authChildGuard: CanActivateChildFn = (route, state) => {
  return authGuard(route, state);
};

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);

  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/tabs/home']);
        return false;
      }
      return true;
    })
  );
};
