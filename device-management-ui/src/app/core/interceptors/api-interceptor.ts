import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'dm_token';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  let apiReq = req.clone({
    url: req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`,
  });

  if (isBrowser) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      apiReq = apiReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (isBrowser) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('dm_user');
          router.navigate(['/login']);
          toast.error('Session expired. Please log in again.');
        }
      } else {
        const message =
          error.error?.error ??
          error.error?.message ??
          error.message ??
          'An unexpected error occurred';
        toast.error(message);
      }
      return throwError(() => error);
    }),
  );
};
