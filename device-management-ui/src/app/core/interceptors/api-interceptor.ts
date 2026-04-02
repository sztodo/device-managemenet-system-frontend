import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const toast = inject(ToastService);

  const apiReq = req.clone({
    url: req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`
  });

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.error ??
        error.error?.message ??
        error.message ??
        'An unexpected error occurred';

      toast.error(message);
      return throwError(() => error);
    })
  );
};
